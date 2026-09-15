# Resource-Scoped Permissions — Design

- **Issue:** [#3 — Add support for resource allocation](https://github.com/nangazaki/vue-rbac/issues/3)
- **Status:** Approved, pending implementation plan
- **Date:** 2026-09-15

## Problem

`vue-rbac` currently checks permissions as flat strings (`"users:create"`) via an
exact match against a `Set<Permission>` computed from the user's roles
(`lib/rbac.ts`, `hasPermission`). There is no way to scope a permission to a
specific resource instance, e.g. "can write to section `section-123`" as
opposed to "can write to any section." Issue #3 requests support for
patterns like `entries:write:[sectionId]`.

## Key insight

The existing match engine is already resource-scoping-capable: it is a plain
`Set.has(string)` check, so a role permission list can already contain fully
composed strings such as `"entries:write:section-123"` and `hasPermission`
will match them correctly today, with zero code changes. What's missing is
**ergonomics**: a typed way to compose and check `action + resourceId` pairs
from the directive, the `RbacGuard` component, and `useRBAC`, instead of
requiring consumers to hand-build template strings everywhere.

This reframes the feature from "build a new matching engine" to "add a thin,
typed convenience layer on top of the existing exact-match engine."

## Approaches considered

1. **Wildcard/pattern matching engine** (e.g. role declares `entries:write:*`
   and a resolver checks resource membership at runtime). Rejected for this
   issue: it's materially more complex (needs a segment-aware matcher) and
   overlaps with issue #4 (wildcard permissions). Should be designed once,
   later, as a generalization that also benefits scoped permissions — not
   bundled here.
2. **Resolver/callback API** (`config.resourceResolver: (resourceId, roles) =>
   boolean`) for fully custom ownership logic. Rejected: bigger API surface
   than the issue asks for, and pushes matching semantics outside the
   library's simple, predictable model.
3. **Ergonomic two-argument overload on top of exact-match** (chosen). Roles
   declare scoped permissions as explicit strings (e.g.
   `"entries:write:section-123"`), one per granted resource. Consumers call
   `hasPermission('entries:write', 'section-123')` and the library composes
   the same string internally. No changes to the matching engine, no new
   config, no new concepts — just typed sugar around string composition.

## Design

### Core (`lib/types/rbac.types.ts`, `lib/rbac.ts`)

`hasPermission` gains an optional second parameter:

```ts
hasPermission(permission: Permission, resourceId?: string | number): boolean
```

- When `resourceId` is `undefined`: unchanged behavior — `userPermissions.has(permission)`.
- When `resourceId` is provided: compose `` `${permission}:${resourceId}` `` and check
  `userPermissions.has(composed)`.

`IUseRBAC.hasPermission` mirrors the same signature. `useRBAC.ts` needs no
body changes — it already passes `rbac.hasPermission` through by reference.

`hasAnyPermission` / `hasAllPermissions` are **not** extended to accept
resource ids. They operate on plain permission lists; scoped checks are a
single-permission concept for this iteration (YAGNI — nothing in issue #3
asks for bulk scoped checks).

### Directive (`lib/utils/access-check.ts`)

New modifier `resource`:

```html
<button v-rbac:resource="['entries:write', sectionId]">Edit section</button>
```

`binding.value` must be a 2-element tuple `[action: string, resourceId: string | number]`.
Validation mirrors the existing switch's fail-closed style: if the value
isn't an array of length 2 or the first element isn't a string, `hasAccess =
false` — no warning, consistent with how other malformed bindings (e.g.
`v-rbac:role="123"`) are already handled today.

```ts
case "resource":
  // v-rbac:resource="['entries:write', sectionId]"
  if (Array.isArray(value) && value.length === 2 && typeof value[0] === "string") {
    hasAccess = rbac.hasPermission(value[0], value[1]);
  } else {
    hasAccess = false;
  }
  break;
```

This is a new, distinct modifier rather than an overload of `default`/`any`/
`all`, because those already treat 2-element string arrays as permission
*lists* (AND/OR semantics) — reusing that shape for a tuple would be
ambiguous.

### `RbacGuard` (`lib/components/rbac-guard.ts`)

New prop:

```ts
resource: {
  type: [String, Number] as PropType<string | number>,
  default: undefined,
},
```

Behavior in `isAllowed()`:

- If `props.permission` is a string **and** `props.resource` is defined:
  `rbac.hasPermission(props.permission, props.resource)`.
- If `props.permission` is an array **and** `props.resource` is defined:
  not a supported combination — log a warning (same style as
  `warnMultipleProps`) and fall back to the existing array behavior
  (`.every(hasPermission)`), ignoring `resource`.
- If `props.resource` is defined without `props.permission`: no-op, falls
  through to existing behavior (`resource` is only meaningful paired with
  `permission`).

`resource` is not added to `ACCESS_PROPS` — it's a modifier on the
`permission` prop, not a competing top-level access mode, so it doesn't
participate in `warnMultipleProps`'s mutual-exclusion check.

### Out of scope

- Wildcard/prefix matching (issue #4) — a future matcher generalization can
  transparently benefit scoped permissions too, since they're just strings,
  but is not built here.
- Resolver/callback-based custom ownership logic.
- Configurable separator (hardcoded `:`, consistent with existing
  `"resource:action"` convention already used throughout the library and
  docs).
- Resource-scoping for `hasAnyPermission` / `hasAllPermissions`.

## Testing

- `lib/tests/permission-checks.spec.ts`: `hasPermission(action, resourceId)`
  matches when the composed string is in the role's permission list, and
  returns `false` when it isn't (including when only the unscoped `action`
  is granted).
- `lib/tests/directive.spec.ts`: `v-rbac:resource` with a valid tuple grants/
  denies correctly; malformed values (wrong length, non-string action)
  resolve to `false`.
- `lib/tests/rbac-guard.spec.ts`: `permission` + `resource` combo grants/
  denies correctly; `permission` array + `resource` logs a warning and falls
  back to array (AND) semantics.

## Documentation

Update `docs/guide/api-reference.md` (new `hasPermission` overload, new
directive modifier, new `RbacGuard` prop) and `docs/examples.md` (a
resource-scoped example, e.g. section-level edit access) to document the
`action:resourceId` composition convention.

## Error handling

Fail-closed throughout, consistent with the rest of the library: any
malformed resource-scoped input (wrong tuple shape, wrong types) resolves to
denied access rather than throwing.
