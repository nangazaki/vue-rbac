import { describe, it, expect, beforeEach } from "vitest";
import { createRBAC, CONFIG_MODE } from "../index";
import type { RBAC } from "../types/rbac.types";

describe("Permission Checks", () => {
  let rbac: RBAC;

  const mockStorage = {
    get: () => null,
    set: () => {},
    remove: () => {},
  };

  beforeEach(async () => {
    rbac = createRBAC({
      mode: CONFIG_MODE.STATIC,
      storage: mockStorage,
      roles: {
        admin: {
          permissions: ["users:create", "users:read", "users:update", "users:delete"],
          inherits: ["editor"],
        },
        editor: {
          permissions: ["posts:create", "posts:edit"],
          inherits: ["viewer"],
        },
        viewer: {
          permissions: ["posts:view", "comments:view"],
        },
        guest: {
          permissions: [],
        },
      },
    });
    await rbac.init();
  });

  describe("hasPermission()", () => {
    it("should return true when user has the permission", async () => {
      rbac.setUserRoles(["admin"]);

      expect(rbac.hasPermission("users:create")).toBe(true);
      expect(rbac.hasPermission("users:delete")).toBe(true);
    });

    it("should return true for inherited permissions", async () => {
      rbac.setUserRoles(["admin"]);

      // Admin inherits from editor, which inherits from viewer
      expect(rbac.hasPermission("posts:view")).toBe(true);
      expect(rbac.hasPermission("posts:edit")).toBe(true);
    });

    it("should return false when user does not have the permission", async () => {
      rbac.setUserRoles(["viewer"]);

      expect(rbac.hasPermission("users:create")).toBe(false);
      expect(rbac.hasPermission("posts:edit")).toBe(false);
    });

    it("should return false when user has no roles assigned", async () => {
      // No roles set
      expect(rbac.hasPermission("users:create")).toBe(false);
      expect(rbac.hasPermission("posts:view")).toBe(false);
    });

    it("should return false when user has role with empty permissions", async () => {
      rbac.setUserRoles(["guest"]);

      expect(rbac.hasPermission("users:create")).toBe(false);
      expect(rbac.hasPermission("posts:view")).toBe(false);
    });
  });

  describe("hasRole()", () => {
    it("should return true when user has the role", async () => {
      rbac.setUserRoles(["admin", "editor"]);

      expect(rbac.hasRole("admin")).toBe(true);
      expect(rbac.hasRole("editor")).toBe(true);
    });

    it("should return false when user does not have the role", async () => {
      rbac.setUserRoles(["viewer"]);

      expect(rbac.hasRole("admin")).toBe(false);
      expect(rbac.hasRole("editor")).toBe(false);
    });

    it("should return false when user has no roles", async () => {
      // No roles set
      expect(rbac.hasRole("admin")).toBe(false);
      expect(rbac.hasRole("viewer")).toBe(false);
    });
  });

  describe("hasAnyPermission()", () => {
    it("should return true when user has at least one permission", async () => {
      rbac.setUserRoles(["viewer"]);

      expect(rbac.hasAnyPermission(["posts:view", "users:create"])).toBe(true);
      expect(rbac.hasAnyPermission(["users:delete", "comments:view"])).toBe(true);
    });

    it("should return false when user has none of the permissions", async () => {
      rbac.setUserRoles(["viewer"]);

      expect(rbac.hasAnyPermission(["users:create", "users:delete"])).toBe(false);
      expect(rbac.hasAnyPermission(["posts:edit", "posts:create"])).toBe(false);
    });

    it("should return false when permissions array is empty", async () => {
      rbac.setUserRoles(["admin"]);

      expect(rbac.hasAnyPermission([])).toBe(false);
    });

    it("should return true when user has all permissions", async () => {
      rbac.setUserRoles(["viewer"]);

      expect(rbac.hasAnyPermission(["posts:view", "comments:view"])).toBe(true);
    });
  });

  describe("hasAllPermissions()", () => {
    it("should return true when user has all permissions", async () => {
      rbac.setUserRoles(["viewer"]);

      expect(rbac.hasAllPermissions(["posts:view", "comments:view"])).toBe(true);
    });

    it("should return true for inherited permissions", async () => {
      rbac.setUserRoles(["admin"]);

      // Admin should have all these through inheritance chain
      expect(
        rbac.hasAllPermissions(["users:create", "posts:edit", "posts:view"])
      ).toBe(true);
    });

    it("should return false when user is missing some permissions", async () => {
      rbac.setUserRoles(["viewer"]);

      expect(rbac.hasAllPermissions(["posts:view", "users:create"])).toBe(false);
    });

    it("should return false when user has none of the permissions", async () => {
      rbac.setUserRoles(["viewer"]);

      expect(rbac.hasAllPermissions(["users:create", "users:delete"])).toBe(false);
    });

    it("should return true when permissions array is empty", async () => {
      rbac.setUserRoles(["viewer"]);

      // Every permission check should pass when array is empty
      expect(rbac.hasAllPermissions([])).toBe(true);
    });

    it("should return true for empty array even with no roles", async () => {
      // No roles set
      expect(rbac.hasAllPermissions([])).toBe(true);
    });
  });

  describe("Multiple Roles", () => {
    it("should combine permissions from multiple roles", async () => {
      rbac.setUserRoles(["viewer", "guest"]);

      expect(rbac.hasPermission("posts:view")).toBe(true);
      expect(rbac.hasPermission("comments:view")).toBe(true);
    });

    it("should handle setUserRoles with single role as string", async () => {
      rbac.setUserRoles("admin");

      expect(rbac.hasRole("admin")).toBe(true);
      expect(rbac.hasPermission("users:create")).toBe(true);
    });
  });
});
