import { describe, it, expect } from "vitest";
import { getAllPermissionsForRole } from "../core/role";
import type { RolesConfig } from "../types/roles.types";

describe("Role Inheritance", () => {
  describe("Simple Inheritance", () => {
    it("should inherit permissions from parent role", () => {
      const rolesConfig: RolesConfig = {
        viewer: { permissions: ["posts:view"] },
        editor: { permissions: ["posts:edit"], inherits: ["viewer"] },
      };

      const permissions = getAllPermissionsForRole("editor", rolesConfig);

      expect(permissions).toContain("posts:edit");
      expect(permissions).toContain("posts:view");
    });
  });

  describe("Multiple Inheritance", () => {
    it("should inherit permissions from multiple parent roles", () => {
      const rolesConfig: RolesConfig = {
        viewer: { permissions: ["posts:view"] },
        commenter: { permissions: ["comments:create"] },
        editor: {
          permissions: ["posts:edit"],
          inherits: ["viewer", "commenter"],
        },
      };

      const permissions = getAllPermissionsForRole("editor", rolesConfig);

      expect(permissions).toContain("posts:edit");
      expect(permissions).toContain("posts:view");
      expect(permissions).toContain("comments:create");
    });
  });

  describe("Deep Inheritance", () => {
    it("should handle deep inheritance chain (A -> B -> C -> D)", () => {
      const rolesConfig: RolesConfig = {
        level4: { permissions: ["level4:permission"] },
        level3: { permissions: ["level3:permission"], inherits: ["level4"] },
        level2: { permissions: ["level2:permission"], inherits: ["level3"] },
        level1: { permissions: ["level1:permission"], inherits: ["level2"] },
      };

      const permissions = getAllPermissionsForRole("level1", rolesConfig);

      expect(permissions).toContain("level1:permission");
      expect(permissions).toContain("level2:permission");
      expect(permissions).toContain("level3:permission");
      expect(permissions).toContain("level4:permission");
      expect(permissions).toHaveLength(4);
    });
  });

  describe("Circular Dependency Prevention", () => {
    it("should handle circular dependencies without infinite loop (A -> B -> A)", () => {
      const rolesConfig: RolesConfig = {
        roleA: { permissions: ["a:permission"], inherits: ["roleB"] },
        roleB: { permissions: ["b:permission"], inherits: ["roleA"] },
      };

      // Should not throw or cause infinite loop
      const permissionsA = getAllPermissionsForRole("roleA", rolesConfig);
      const permissionsB = getAllPermissionsForRole("roleB", rolesConfig);

      expect(permissionsA).toContain("a:permission");
      expect(permissionsA).toContain("b:permission");
      expect(permissionsB).toContain("a:permission");
      expect(permissionsB).toContain("b:permission");
    });

    it("should handle complex circular dependencies (A -> B -> C -> A)", () => {
      const rolesConfig: RolesConfig = {
        roleA: { permissions: ["a:permission"], inherits: ["roleB"] },
        roleB: { permissions: ["b:permission"], inherits: ["roleC"] },
        roleC: { permissions: ["c:permission"], inherits: ["roleA"] },
      };

      const permissions = getAllPermissionsForRole("roleA", rolesConfig);

      expect(permissions).toContain("a:permission");
      expect(permissions).toContain("b:permission");
      expect(permissions).toContain("c:permission");
    });
  });

  describe("Non-existent Role Error", () => {
    it("should throw error when role does not exist", () => {
      const rolesConfig: RolesConfig = {
        admin: { permissions: ["admin:all"] },
      };

      expect(() =>
        getAllPermissionsForRole("nonexistent", rolesConfig)
      ).toThrow("Role 'nonexistent' not defined in rolesConfig.");
    });

    it("should throw error when inherited role does not exist", () => {
      const rolesConfig: RolesConfig = {
        admin: { permissions: ["admin:all"], inherits: ["superadmin"] },
      };

      expect(() => getAllPermissionsForRole("admin", rolesConfig)).toThrow(
        "Role 'superadmin' not defined in rolesConfig."
      );
    });
  });

  describe("Cache Functionality", () => {
    it("should use cache for repeated calls", () => {
      const rolesConfig: RolesConfig = {
        viewer: { permissions: ["posts:view"] },
        editor: { permissions: ["posts:edit"], inherits: ["viewer"] },
      };

      const cache = new Map();

      // First call - should populate cache
      const permissions1 = getAllPermissionsForRole(
        "editor",
        rolesConfig,
        new Set(),
        cache
      );

      // Second call with same cache - should use cached value
      const permissions2 = getAllPermissionsForRole(
        "editor",
        rolesConfig,
        new Set(),
        cache
      );

      expect(permissions1).toEqual(permissions2);
      expect(cache.has("editor")).toBe(true);
    });
  });

  describe("Duplicate Permission Removal", () => {
    it("should remove duplicate permissions from inheritance", () => {
      const rolesConfig: RolesConfig = {
        viewer: { permissions: ["posts:view", "shared:permission"] },
        commenter: { permissions: ["comments:create", "shared:permission"] },
        editor: {
          permissions: ["posts:edit", "shared:permission"],
          inherits: ["viewer", "commenter"],
        },
      };

      const permissions = getAllPermissionsForRole("editor", rolesConfig);

      // Count occurrences of shared:permission
      const sharedCount = permissions.filter(
        (p) => p === "shared:permission"
      ).length;

      expect(sharedCount).toBe(1);
      expect(permissions).toContain("posts:view");
      expect(permissions).toContain("posts:edit");
      expect(permissions).toContain("comments:create");
    });

    it("should handle role with no inherits", () => {
      const rolesConfig: RolesConfig = {
        standalone: { permissions: ["standalone:permission"] },
      };

      const permissions = getAllPermissionsForRole("standalone", rolesConfig);

      expect(permissions).toEqual(["standalone:permission"]);
    });

    it("should handle role with empty permissions array", () => {
      const rolesConfig: RolesConfig = {
        empty: { permissions: [] },
      };

      const permissions = getAllPermissionsForRole("empty", rolesConfig);

      expect(permissions).toEqual([]);
    });
  });
});
