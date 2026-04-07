import { describe, it, expect, beforeEach, vi } from "vitest";
import { createRBAC, CONFIG_MODE } from "../index";
import { validateConfig } from "../config/schema";

describe("Configuration Modes", () => {
  const mockStorage = {
    get: vi.fn(() => null),
    set: vi.fn(),
    remove: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("STATIC Mode", () => {
    it("should initialize correctly with static roles", async () => {
      const rbac = createRBAC({
        mode: CONFIG_MODE.STATIC,
        storage: mockStorage,
        roles: {
          admin: { permissions: ["users:create", "users:delete"] },
          viewer: { permissions: ["posts:view"] },
        },
      });

      await rbac.init();

      expect(rbac.state.isInitialized).toBe(true);
      expect(rbac.state.roles.admin).toBeDefined();
      expect(rbac.state.roles.admin.permissions).toContain("users:create");
      expect(rbac.state.roles.viewer.permissions).toContain("posts:view");
    });

    it("should work without explicit mode (defaults to STATIC)", async () => {
      const rbac = createRBAC({
        storage: mockStorage,
        roles: {
          admin: { permissions: ["admin:all"] },
        },
      });

      await rbac.init();

      expect(rbac.state.isInitialized).toBe(true);
      expect(rbac.options.mode).toBe(CONFIG_MODE.STATIC);
    });
  });

  describe("DYNAMIC Mode", () => {
    it("should initialize with fetchRoles function", async () => {
      const fetchRoles = vi.fn().mockResolvedValue({
        admin: { permissions: ["dynamic:permission"] },
      });

      const rbac = createRBAC({
        mode: CONFIG_MODE.DYNAMIC,
        storage: mockStorage,
        fetchRoles,
      });

      await rbac.init();

      expect(fetchRoles).toHaveBeenCalled();
      expect(rbac.state.isInitialized).toBe(true);
      expect(rbac.state.roles.admin.permissions).toContain("dynamic:permission");
    });

    it("should handle async fetchRoles", async () => {
      const fetchRoles = vi.fn().mockImplementation(async () => {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 10));
        return {
          editor: { permissions: ["posts:edit"] },
        };
      });

      const rbac = createRBAC({
        mode: CONFIG_MODE.DYNAMIC,
        storage: mockStorage,
        fetchRoles,
      });

      await rbac.init();

      expect(rbac.state.roles.editor.permissions).toContain("posts:edit");
    });
  });

  describe("HYBRID Mode", () => {
    it("should merge static and dynamic roles", async () => {
      const fetchRoles = vi.fn().mockResolvedValue({
        dynamicRole: { permissions: ["dynamic:permission"] },
      });

      const rbac = createRBAC({
        mode: CONFIG_MODE.HYBRID,
        storage: mockStorage,
        roles: {
          staticRole: { permissions: ["static:permission"] },
        },
        fetchRoles,
      });

      await rbac.init();

      expect(rbac.state.roles.staticRole).toBeDefined();
      expect(rbac.state.roles.dynamicRole).toBeDefined();
      expect(rbac.state.roles.staticRole.permissions).toContain("static:permission");
      expect(rbac.state.roles.dynamicRole.permissions).toContain("dynamic:permission");
    });

    it("should override static roles with dynamic roles of same name", async () => {
      const fetchRoles = vi.fn().mockResolvedValue({
        admin: { permissions: ["admin:dynamic"] },
      });

      const rbac = createRBAC({
        mode: CONFIG_MODE.HYBRID,
        storage: mockStorage,
        roles: {
          admin: { permissions: ["admin:static"] },
        },
        fetchRoles,
      });

      await rbac.init();

      // Dynamic should override static
      expect(rbac.state.roles.admin.permissions).toContain("admin:dynamic");
      expect(rbac.state.roles.admin.permissions).not.toContain("admin:static");
    });
  });

  describe("Invalid Configuration", () => {
    it("should throw error for invalid mode", () => {
      expect(() =>
        validateConfig({
          // @ts-ignore - Testing invalid input
          mode: "invalid-mode",
        })
      ).toThrow("Invalid Mode: invalid-mode. Use 'static', 'dynamic' or 'hybrid'.");
    });

    it("should throw error when permissions is not an array", () => {
      expect(() =>
        validateConfig({
          roles: {
            // @ts-ignore - Testing invalid input
            admin: { permissions: "not-an-array" },
          },
        })
      ).toThrow("Permissions for role 'admin' must be an array.");
    });

    it("should throw error when inherits is not an array", () => {
      expect(() =>
        validateConfig({
          roles: {
            admin: {
              permissions: ["admin:all"],
              // @ts-ignore - Testing invalid input
              inherits: "viewer",
            },
          },
        })
      ).toThrow("'inherits' for role 'admin' must be an array.");
    });

    it("should throw error when inherited role does not exist", () => {
      expect(() =>
        validateConfig({
          roles: {
            admin: {
              permissions: ["admin:all"],
              inherits: ["superadmin"],
            },
          },
        })
      ).toThrow("Role 'admin' inherits from 'superadmin' which is not defined.");
    });
  });

  describe("Valid Configuration Edge Cases", () => {
    it("should accept valid mode values", () => {
      expect(() =>
        validateConfig({ mode: CONFIG_MODE.STATIC })
      ).not.toThrow();

      expect(() =>
        validateConfig({ mode: CONFIG_MODE.DYNAMIC })
      ).not.toThrow();

      expect(() =>
        validateConfig({ mode: CONFIG_MODE.HYBRID })
      ).not.toThrow();
    });

    it("should accept empty roles object", () => {
      expect(() =>
        validateConfig({
          mode: CONFIG_MODE.STATIC,
          roles: {},
        })
      ).not.toThrow();
    });

    it("should accept roles with empty permissions array", () => {
      expect(() =>
        validateConfig({
          roles: {
            guest: { permissions: [] },
          },
        })
      ).not.toThrow();
    });

    it("should accept roles with valid inheritance", () => {
      expect(() =>
        validateConfig({
          roles: {
            viewer: { permissions: ["view"] },
            editor: { permissions: ["edit"], inherits: ["viewer"] },
          },
        })
      ).not.toThrow();
    });
  });

  describe("Double Initialization Prevention", () => {
    it("should not reinitialize if already initialized", async () => {
      const fetchRoles = vi.fn().mockResolvedValue({
        admin: { permissions: ["admin:all"] },
      });

      const rbac = createRBAC({
        mode: CONFIG_MODE.DYNAMIC,
        storage: mockStorage,
        fetchRoles,
      });

      await rbac.init();
      await rbac.init(); // Second call

      // fetchRoles should only be called once
      expect(fetchRoles).toHaveBeenCalledTimes(1);
    });
  });
});
