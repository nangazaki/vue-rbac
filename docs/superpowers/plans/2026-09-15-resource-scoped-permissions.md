# Resource-Scoped Permissions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let `hasPermission` (and the directive / `RbacGuard` layers built on it) check a permission scoped to a specific resource instance, e.g. "can write to `section-123`", by composing `action` + `resourceId` into the existing exact-match permission string — closes [issue #3](https://github.com/nangazaki/vue-rbac/issues/3).

**Architecture:** No changes to the matching engine (`userPermissions: Set<Permission>`, exact `Set.has` lookups). Add an optional `resourceId` parameter to `hasPermission` that composes `` `${permission}:${resourceId}` `` before the existing lookup. Thread that same optional parameter through the directive (new `resource` modifier) and `RbacGuard` (new `resource` prop). Roles grant resource-scoped access by listing the fully composed string in their `permissions` array — no new config, no new role-definition syntax.

**Tech Stack:** TypeScript, Vue 3, Vitest, `@vue/test-utils`.

**Spec:** `docs/superpowers/specs/2026-09-15-resource-scoped-permissions-design.md`

## Global Constraints

- Composition separator is hardcoded `:` — matches the existing `resource:action` convention already used throughout the library and docs. No configurable separator.
- All resource-scoped checks are fail-closed: any malformed input (wrong shape, wrong type) resolves to `false`/denied, never throws.
- `resourceId` type is `string | number` everywhere it appears (core, directive, `RbacGuard`).
- No changes to `hasAnyPermission` / `hasAllPermissions` — resource scoping is a single-permission concept in this iteration.
- No wildcard/prefix matching and no resolver/callback API — out of scope (see spec's "Out of scope" section).

---

### Task 1: Core — `hasPermission` resourceId overload

**Files:**
- Modify: `lib/types/rbac.types.ts:23` (`RBAC.hasPermission`), `lib/types/rbac.types.ts:34` (`IUseRBAC.hasPermission`)
- Modify: `lib/rbac.ts:114-116` (`hasPermission` implementation)
- Test: `lib/tests/permission-checks.spec.ts`

**Interfaces:**
- Produces: `hasPermission(permission: Permission, resourceId?: string | number): boolean` — this exact signature is consumed by Task 2 (directive) and Task 3 (`RbacGuard`) via `RBAC`/`IUseRBAC`.

- [ ] **Step 1: Write the failing tests**

Edit `lib/tests/permission-checks.spec.ts`. First, extend the `editor` role fixture in the shared `beforeEach` (around line 23) to include two resource-scoped permissions:

```ts
        editor: {
          permissions: [
            "posts:create",
            "posts:edit",
            "entries:write:section-123",
            "entries:archive:42",
          ],
          inherits: ["viewer"],
        },
```

Then add a new `describe` block right after the existing `describe("hasPermission()", ...)` block (after its closing `});` around line 73):

```ts
  describe("hasPermission() with resourceId", () => {
    it("should return true when the composed permission matches", async () => {
      rbac.setUserRoles(["editor"]);

      expect(rbac.hasPermission("entries:write", "section-123")).toBe(true);
    });

    it("should return false when the composed permission does not match", async () => {
      rbac.setUserRoles(["editor"]);

      expect(rbac.hasPermission("entries:write", "section-999")).toBe(false);
    });

    it("should return false when only the unscoped action is granted", async () => {
      rbac.setUserRoles(["admin"]);

      // admin has "users:create" but not "users:create:section-123"
      expect(rbac.hasPermission("users:create", "section-123")).toBe(false);
    });

    it("should support a numeric resourceId", async () => {
      rbac.setUserRoles(["editor"]);

      expect(rbac.hasPermission("entries:archive", 42)).toBe(true);
      expect(rbac.hasPermission("entries:archive", 43)).toBe(false);
    });

    it("should behave exactly like the one-argument call when resourceId is omitted", async () => {
      rbac.setUserRoles(["editor"]);

      expect(rbac.hasPermission("posts:create")).toBe(true);
      expect(rbac.hasPermission("posts:create", undefined)).toBe(true);
    });
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run tests/permission-checks.spec.ts` (from `lib/`)
Expected: FAIL — `hasPermission("entries:write", "section-123")` returns `false` for all resourceId cases because the current implementation ignores the second argument entirely (it only ever checks `userPermissions.has(permission)`, and `"entries:write" !== "entries:write:section-123"`).

- [ ] **Step 3: Update the types**

In `lib/types/rbac.types.ts`, change line 23:

```ts
  hasPermission(permission: Permission): boolean;
```

to:

```ts
  hasPermission(permission: Permission, resourceId?: string | number): boolean;
```

And change line 34 (the same method on `IUseRBAC`):

```ts
  hasPermission(permission: Permission): boolean;
```

to:

```ts
  hasPermission(permission: Permission, resourceId?: string | number): boolean;
```

- [ ] **Step 4: Implement in `lib/rbac.ts`**

Replace the `hasPermission` method (lines 114-116):

```ts
    hasPermission(permission: Permission): boolean {
      return userPermissions.has(permission);
    },
```

with:

```ts
    hasPermission(permission: Permission, resourceId?: string | number): boolean {
      if (resourceId === undefined) {
        return userPermissions.has(permission);
      }
      return userPermissions.has(`${permission}:${resourceId}`);
    },
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm vitest run tests/permission-checks.spec.ts` (from `lib/`)
Expected: PASS — all tests in the file, including the new `describe("hasPermission() with resourceId", ...)` block.

- [ ] **Step 6: Run full test suite and type-check**

Run: `pnpm vitest run` and `pnpm tsc --noEmit` (from `lib/`)
Expected: PASS — no other file references `hasPermission` with an incompatible signature yet (directive and `RbacGuard` still only call it with one argument, which remains valid since `resourceId` is optional).

- [ ] **Step 7: Commit**

```bash
git add lib/types/rbac.types.ts lib/rbac.ts lib/tests/permission-checks.spec.ts
git commit -m "feat: support resource-scoped permission checks in hasPermission"
```

---

### Task 2: Directive — `v-rbac:resource` modifier

**Files:**
- Modify: `lib/utils/access-check.ts`
- Test: `lib/tests/directive.spec.ts`

**Interfaces:**
- Consumes: `RBAC.hasPermission(permission: Permission, resourceId?: string | number): boolean` from Task 1.
- Produces: `v-rbac:resource="[action, resourceId]"` directive usage, documented in Task 4.

- [ ] **Step 1: Write the failing tests**

Add a new `describe` block to `lib/tests/directive.spec.ts`, right after the `describe("Negation Check ...)` block closes (before `describe("Modifier-based Check", ...)`, around line 205):

```ts
  describe("Resource Permission Check (v-rbac:resource=\"[action, id]\")", () => {
    it("should grant access when the composed permission matches", () => {
      vi.mocked(mockRbac.hasPermission).mockReturnValue(true);

      const binding = createBinding(["entries:write", "section-123"], "resource");
      const result = checkAccess(binding, mockRbac);

      expect(mockRbac.hasPermission).toHaveBeenCalledWith(
        "entries:write",
        "section-123"
      );
      expect(result).toBe(true);
    });

    it("should deny access when the composed permission does not match", () => {
      vi.mocked(mockRbac.hasPermission).mockReturnValue(false);

      const binding = createBinding(["entries:write", "section-999"], "resource");
      const result = checkAccess(binding, mockRbac);

      expect(result).toBe(false);
    });

    it("should support a numeric resourceId", () => {
      vi.mocked(mockRbac.hasPermission).mockReturnValue(true);

      const binding = createBinding(["entries:archive", 42], "resource");
      const result = checkAccess(binding, mockRbac);

      expect(mockRbac.hasPermission).toHaveBeenCalledWith("entries:archive", 42);
      expect(result).toBe(true);
    });

    it("should return false when the value is not a 2-element array", () => {
      const binding = createBinding(["entries:write"], "resource");
      const result = checkAccess(binding, mockRbac);

      expect(result).toBe(false);
    });

    it("should return false when the first element is not a string", () => {
      const binding = createBinding([123, "section-123"], "resource");
      const result = checkAccess(binding, mockRbac);

      expect(result).toBe(false);
    });

    it("should return false for a non-array value", () => {
      const binding = createBinding("entries:write", "resource");
      const result = checkAccess(binding, mockRbac);

      expect(result).toBe(false);
    });
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run tests/directive.spec.ts` (from `lib/`)
Expected: FAIL — the `resource` modifier isn't handled by the switch in `checkAccess`, so it falls into the `default` case, which calls `hasPermission` with the raw array (not the tuple's first element) instead of the expected composed check — the "grant"/"deny"/"numeric" tests fail on the wrong `hasPermission` call arguments, and the "invalid" tests fail because the default case's array branch calls `hasAllPermissions` instead of returning `false` directly.

- [ ] **Step 3: Implement in `lib/utils/access-check.ts`**

Add a new `case "resource":` branch to the switch in `checkAccess`, right after the `case "not":` block (after line 74's `break;`, before `case "permission":`):

```ts
    case "resource":
      // v-rbac:resource="['entries:write', sectionId]"
      if (
        Array.isArray(value) &&
        value.length === 2 &&
        typeof value[0] === "string"
      ) {
        hasAccess = rbac.hasPermission(value[0], value[1]);
      } else {
        hasAccess = false;
      }
      break;
```

Also update the JSDoc example block at the top of the file (after the `v-rbac:not` example, around line 26) to document the new modifier:

```ts
 * @example
 * // Resource-scoped permission check
 * v-rbac:resource="['entries:write', sectionId]"
 *
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm vitest run tests/directive.spec.ts` (from `lib/`)
Expected: PASS — all tests in the file, including the new resource-check `describe` block.

- [ ] **Step 5: Run full test suite**

Run: `pnpm vitest run` (from `lib/`)
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/utils/access-check.ts lib/tests/directive.spec.ts
git commit -m "feat: add v-rbac:resource directive modifier for scoped permissions"
```

---

### Task 3: `RbacGuard` — `resource` prop

**Files:**
- Modify: `lib/components/rbac-guard.ts`
- Test: `lib/tests/rbac-guard.spec.ts`

**Interfaces:**
- Consumes: `IUseRBAC.hasPermission(permission: Permission, resourceId?: string | number): boolean` from Task 1; `logger.warn(...args: any[])` from `lib/utils/logger.ts` (already imported in this file).
- Produces: `<RbacGuard permission="..." resource="...">` usage, documented in Task 4.

- [ ] **Step 1: Write the failing tests**

Add a new `describe` block to `lib/tests/rbac-guard.spec.ts`, right after the `describe("prop: permission", ...)` block closes (before `describe("prop: any", ...)`, around line 125):

```ts
  describe("prop: resource", () => {
    it("should render slot when permission + resource match", () => {
      vi.mocked(mockRbac.hasPermission).mockReturnValue(true);

      const wrapper = mount(RbacGuard, {
        props: { permission: "entries:write", resource: "section-123" },
        slots: { default: defaultSlot },
      });

      expect(wrapper.find(".content").exists()).toBe(true);
      expect(mockRbac.hasPermission).toHaveBeenCalledWith(
        "entries:write",
        "section-123"
      );
    });

    it("should not render slot when permission + resource check fails", () => {
      vi.mocked(mockRbac.hasPermission).mockReturnValue(false);

      const wrapper = mount(RbacGuard, {
        props: { permission: "entries:write", resource: "section-999" },
        slots: { default: defaultSlot },
      });

      expect(wrapper.find(".content").exists()).toBe(false);
    });

    it("should support a numeric resource", () => {
      vi.mocked(mockRbac.hasPermission).mockReturnValue(true);

      mount(RbacGuard, {
        props: { permission: "entries:archive", resource: 42 },
        slots: { default: defaultSlot },
      });

      expect(mockRbac.hasPermission).toHaveBeenCalledWith("entries:archive", 42);
    });

    it("should warn and fall back to array (AND) semantics when permission is an array", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      vi.mocked(mockRbac.hasPermission).mockReturnValue(true);

      const wrapper = mount(RbacGuard, {
        props: {
          permission: ["entries:write", "entries:read"],
          resource: "section-123",
        },
        slots: { default: defaultSlot },
      });

      expect(warnSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining(
          '"resource" prop requires a single "permission" string'
        )
      );
      expect(mockRbac.hasPermission).toHaveBeenCalledWith("entries:write");
      expect(mockRbac.hasPermission).toHaveBeenCalledWith("entries:read");
      expect(wrapper.find(".content").exists()).toBe(true);

      warnSpy.mockRestore();
    });
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run tests/rbac-guard.spec.ts` (from `lib/`)
Expected: FAIL — `RbacGuard` has no `resource` prop yet, so `hasPermission` is always called with only one argument (`"entries:write"`, not `("entries:write", "section-123")`), and there's no warning logic for the array+resource combination.

- [ ] **Step 3: Implement in `lib/components/rbac-guard.ts`**

Add the `resource` prop to the `props` object, after the `all` prop (after line 30's closing `},`, before the `not` prop):

```ts
    resource: {
      type: [String, Number] as PropType<string | number>,
      default: undefined,
    },
```

Update the `isAllowed` function's `permission` branch (lines 65-67):

```ts
      if (props.permission !== undefined) {
        return toArray(props.permission).every((p) => rbac.hasPermission(p));
      }
```

to:

```ts
      if (props.permission !== undefined) {
        if (props.resource !== undefined) {
          if (typeof props.permission === "string") {
            return rbac.hasPermission(props.permission, props.resource);
          }
          logger.warn(
            '[RbacGuard] "resource" prop requires a single "permission" string, got an array. Ignoring "resource".'
          );
        }
        return toArray(props.permission).every((p) => rbac.hasPermission(p));
      }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm vitest run tests/rbac-guard.spec.ts` (from `lib/`)
Expected: PASS — all tests in the file, including the new `describe("prop: resource", ...)` block.

- [ ] **Step 5: Run full test suite**

Run: `pnpm vitest run` (from `lib/`)
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/components/rbac-guard.ts lib/tests/rbac-guard.spec.ts
git commit -m "feat: add resource prop to RbacGuard for scoped permission checks"
```

---

### Task 4: Documentation

**Files:**
- Modify: `docs/guide/api-reference.md`
- Modify: `docs/examples.md`

**Interfaces:**
- Consumes: the finished public API from Tasks 1-3 (`hasPermission(permission, resourceId?)`, `v-rbac:resource="[action, id]"`, `<RbacGuard permission resource>`). No code interfaces are produced by this task.

- [ ] **Step 1: Update the RBAC instance methods table**

In `docs/guide/api-reference.md`, replace line 76:

```
| `hasPermission(permission: Permission)`     | `(permission: string) => boolean`            | Check a single permission. Supports `resource:*` wildcards. |
```

with:

```
| `hasPermission(permission: Permission, resourceId?: string \| number)` | `(permission: string, resourceId?: string \| number) => boolean` | Check a permission. Pass `resourceId` to check a resource-scoped permission (matched as `` `${permission}:${resourceId}` ``). |
```

(This also corrects the pre-existing "Supports `resource:*` wildcards" claim, which does not reflect any matching logic currently in `lib/rbac.ts` — wildcard matching is tracked separately as issue #4 and not implemented yet.)

- [ ] **Step 2: Update the directive modifier table and usage example**

In the `## Directive: \`v-rbac\`` section, add a row to the modifier table (after the `not` row, around line 160):

```
| `resource` | `[string, string \| number]` | Checks a resource-scoped permission: `[action, resourceId]` |
```

And add a line to the usage example block (after the `v-rbac:not` line, around line 169):

```
<div v-rbac:resource="['entries:write', sectionId]">Edit Section</div>
```

- [ ] **Step 3: Update the `RbacGuard` props table**

In the `## Component: \`<RbacGuard>\`` section, add a row to the props table (after the `all` row, around line 199):

```
| `resource`   | `string \| number`      | Resource id to scope `permission` to (requires `permission` to be a single string, not an array) |
```

- [ ] **Step 4: Add a Resource-Scoped Permissions section**

Add a new section right before `## Symbols` (around line 229):

```markdown
## Resource-Scoped Permissions

Grant access to specific resource instances by listing the fully composed
permission string (`action:resourceId`) in a role's `permissions` array:

\`\`\`ts
roles: {
  editor: {
    permissions: ['entries:write:section-123', 'entries:write:section-456']
  }
}
\`\`\`

Then check it by passing the resource id as a second argument, wherever
`hasPermission` is used:

\`\`\`ts
rbac.hasPermission('entries:write', 'section-123') // true
rbac.hasPermission('entries:write', 'section-999') // false
\`\`\`

\`\`\`vue
<div v-rbac:resource="['entries:write', sectionId]">Edit Section</div>

<RbacGuard permission="entries:write" :resource="sectionId">
  <EditSectionForm />
</RbacGuard>
\`\`\`
```

- [ ] **Step 5: Add a directive example to `docs/examples.md`**

In `docs/examples.md`, add a new subsection to `## 2. Directive‑Based Control`, right after `### Negation (not)` (after line 63, before `## 3. Composition API with \`useRBAC\``):

```markdown
### Resource-scoped permission

\`\`\`vue
<div v-rbac:resource="['entries:write', sectionId]">
  Edit this section
</div>
\`\`\`
```

- [ ] **Step 6: Add a `RbacGuard` example to `docs/examples.md`**

In `## 8. RbacGuard Component`, add a new example inside the existing `<template>` block, after the "negation" example (after line 182, before the closing `</template>`):

```vue
  <!-- resource-scoped permission -->
  <RbacGuard permission="entries:write" :resource="sectionId">
    <EditSectionForm />
    <template #fallback><p>You can't edit this section.</p></template>
  </RbacGuard>
```

- [ ] **Step 7: Verify the docs build**

Run: `pnpm docs:build` (from `docs/`)
Expected: PASS — VitePress builds without errors (no broken Markdown, no dead internal links introduced).

- [ ] **Step 8: Commit**

```bash
git add docs/guide/api-reference.md docs/examples.md
git commit -m "docs: document resource-scoped permission checks"
```
