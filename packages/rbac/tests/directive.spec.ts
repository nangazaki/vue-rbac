import { describe, it, expect, beforeEach, vi } from "vitest";
import { checkAccess } from "../utils/access-check";
import type { RBAC } from "../types/rbac.types";
import type { DirectiveBinding } from "vue";

describe("v-rbac Directive", () => {
  let mockRbac: RBAC;

  beforeEach(() => {
    mockRbac = {
      hasPermission: vi.fn(),
      hasRole: vi.fn(),
      hasAnyPermission: vi.fn(),
      hasAllPermissions: vi.fn(),
    } as unknown as RBAC;
  });

  const createBinding = (
    value: any,
    arg?: string,
    modifiers: Record<string, boolean> = {}
  ): DirectiveBinding => ({
    value,
    arg,
    modifiers,
    oldValue: undefined,
    instance: null,
    dir: {} as any,
  });

  describe("Default Permission Check (v-rbac=\"'permission'\")", () => {
    it("should grant access when user has the permission", () => {
      vi.mocked(mockRbac.hasPermission).mockReturnValue(true);

      const binding = createBinding("users:create");
      const result = checkAccess(binding, mockRbac);

      expect(mockRbac.hasPermission).toHaveBeenCalledWith("users:create");
      expect(result).toBe(true);
    });

    it("should deny access when user does not have the permission", () => {
      vi.mocked(mockRbac.hasPermission).mockReturnValue(false);

      const binding = createBinding("users:delete");
      const result = checkAccess(binding, mockRbac);

      expect(mockRbac.hasPermission).toHaveBeenCalledWith("users:delete");
      expect(result).toBe(false);
    });

    it("should use hasAllPermissions for array value", () => {
      vi.mocked(mockRbac.hasAllPermissions).mockReturnValue(true);

      const binding = createBinding(["users:create", "users:edit"]);
      const result = checkAccess(binding, mockRbac);

      expect(mockRbac.hasAllPermissions).toHaveBeenCalledWith([
        "users:create",
        "users:edit",
      ]);
      expect(result).toBe(true);
    });
  });

  describe("Role Check (v-rbac:role=\"'admin'\")", () => {
    it("should grant access when user has the role", () => {
      vi.mocked(mockRbac.hasRole).mockReturnValue(true);

      const binding = createBinding("admin", "role");
      const result = checkAccess(binding, mockRbac);

      expect(mockRbac.hasRole).toHaveBeenCalledWith("admin");
      expect(result).toBe(true);
    });

    it("should deny access when user does not have the role", () => {
      vi.mocked(mockRbac.hasRole).mockReturnValue(false);

      const binding = createBinding("superadmin", "role");
      const result = checkAccess(binding, mockRbac);

      expect(mockRbac.hasRole).toHaveBeenCalledWith("superadmin");
      expect(result).toBe(false);
    });

    it("should return false for non-string value", () => {
      const binding = createBinding(123, "role");
      const result = checkAccess(binding, mockRbac);

      expect(result).toBe(false);
    });
  });

  describe("Any Permission Check (v-rbac:any=\"['p1', 'p2']\")", () => {
    it("should grant access when user has at least one permission", () => {
      vi.mocked(mockRbac.hasAnyPermission).mockReturnValue(true);

      const binding = createBinding(["users:create", "users:edit"], "any");
      const result = checkAccess(binding, mockRbac);

      expect(mockRbac.hasAnyPermission).toHaveBeenCalledWith([
        "users:create",
        "users:edit",
      ]);
      expect(result).toBe(true);
    });

    it("should deny access when user has none of the permissions", () => {
      vi.mocked(mockRbac.hasAnyPermission).mockReturnValue(false);

      const binding = createBinding(["admin:all", "superadmin:all"], "any");
      const result = checkAccess(binding, mockRbac);

      expect(result).toBe(false);
    });

    it("should fallback to hasPermission for string value", () => {
      vi.mocked(mockRbac.hasPermission).mockReturnValue(true);

      const binding = createBinding("users:create", "any");
      const result = checkAccess(binding, mockRbac);

      expect(mockRbac.hasPermission).toHaveBeenCalledWith("users:create");
      expect(result).toBe(true);
    });
  });

  describe("All Permissions Check (v-rbac:all=\"['p1', 'p2']\")", () => {
    it("should grant access when user has all permissions", () => {
      vi.mocked(mockRbac.hasAllPermissions).mockReturnValue(true);

      const binding = createBinding(["users:create", "users:edit"], "all");
      const result = checkAccess(binding, mockRbac);

      expect(mockRbac.hasAllPermissions).toHaveBeenCalledWith([
        "users:create",
        "users:edit",
      ]);
      expect(result).toBe(true);
    });

    it("should deny access when user is missing any permission", () => {
      vi.mocked(mockRbac.hasAllPermissions).mockReturnValue(false);

      const binding = createBinding(["users:create", "admin:all"], "all");
      const result = checkAccess(binding, mockRbac);

      expect(result).toBe(false);
    });

    it("should fallback to hasPermission for string value", () => {
      vi.mocked(mockRbac.hasPermission).mockReturnValue(true);

      const binding = createBinding("users:create", "all");
      const result = checkAccess(binding, mockRbac);

      expect(mockRbac.hasPermission).toHaveBeenCalledWith("users:create");
      expect(result).toBe(true);
    });
  });

  describe("Negation Check (v-rbac:not=\"'permission'\")", () => {
    it("should grant access when user does NOT have the permission", () => {
      vi.mocked(mockRbac.hasPermission).mockReturnValue(false);

      const binding = createBinding("admin:all", "not");
      const result = checkAccess(binding, mockRbac);

      expect(mockRbac.hasPermission).toHaveBeenCalledWith("admin:all");
      expect(result).toBe(true);
    });

    it("should deny access when user HAS the permission", () => {
      vi.mocked(mockRbac.hasPermission).mockReturnValue(true);

      const binding = createBinding("users:view", "not");
      const result = checkAccess(binding, mockRbac);

      expect(result).toBe(false);
    });

    it("should use hasAnyPermission negation for array value", () => {
      vi.mocked(mockRbac.hasAnyPermission).mockReturnValue(false);

      const binding = createBinding(["admin:all", "superadmin:all"], "not");
      const result = checkAccess(binding, mockRbac);

      expect(mockRbac.hasAnyPermission).toHaveBeenCalledWith([
        "admin:all",
        "superadmin:all",
      ]);
      expect(result).toBe(true);
    });

    it("should deny access when user has any of the negated permissions", () => {
      vi.mocked(mockRbac.hasAnyPermission).mockReturnValue(true);

      const binding = createBinding(["admin:all", "users:view"], "not");
      const result = checkAccess(binding, mockRbac);

      expect(result).toBe(false);
    });
  });

  describe("Modifier-based Check", () => {
    it("should support permission modifier as fallback", () => {
      vi.mocked(mockRbac.hasPermission).mockReturnValue(true);

      const binding = createBinding("users:create", undefined, {
        permission: true,
      });
      const result = checkAccess(binding, mockRbac);

      expect(mockRbac.hasPermission).toHaveBeenCalledWith("users:create");
      expect(result).toBe(true);
    });
  });

  describe("Invalid Values", () => {
    it("should return false for undefined value in permission check", () => {
      const binding = createBinding(undefined);
      const result = checkAccess(binding, mockRbac);

      expect(result).toBe(false);
    });

    it("should return false for null value in permission check", () => {
      const binding = createBinding(null);
      const result = checkAccess(binding, mockRbac);

      expect(result).toBe(false);
    });

    it("should return false for number value in any check", () => {
      const binding = createBinding(123, "any");
      const result = checkAccess(binding, mockRbac);

      expect(result).toBe(false);
    });

    it("should return false for object value in all check", () => {
      const binding = createBinding({ permission: "test" }, "all");
      const result = checkAccess(binding, mockRbac);

      expect(result).toBe(false);
    });

    it("should return false for invalid value in not check", () => {
      const binding = createBinding(123, "not");
      const result = checkAccess(binding, mockRbac);

      expect(result).toBe(false);
    });
  });
});
