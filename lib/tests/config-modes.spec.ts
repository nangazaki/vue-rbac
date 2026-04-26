import { describe, it, expect, beforeEach, vi } from "vitest";
import { createRBAC, CONFIG_MODE } from "../index";
import { validateConfig } from "../config/schema";
import * as dynamicLoader from "../loaders/dynamic";

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

  describe("Retry Mechanism", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should succeed on a later attempt after transient failures", async () => {
      const fetchRoles = vi
        .fn()
        .mockRejectedValueOnce(new Error("network error"))
        .mockRejectedValueOnce(new Error("network error"))
        .mockResolvedValueOnce({ admin: { permissions: ["admin:all"] } });

      const rbac = createRBAC({
        mode: CONFIG_MODE.DYNAMIC,
        storage: mockStorage,
        fetchRoles,
        retry: { attempts: 3, delay: 100, backoff: 1 },
      });

      const initPromise = rbac.init();
      await vi.runAllTimersAsync();
      await initPromise;

      expect(fetchRoles).toHaveBeenCalledTimes(3);
      expect(rbac.state.isInitialized).toBe(true);
      expect(rbac.state.roles.admin.permissions).toContain("admin:all");
    });

    it("should throw after all attempts are exhausted", async () => {
      const fetchRoles = vi.fn().mockRejectedValue(new Error("persistent error"));

      const rbac = createRBAC({
        mode: CONFIG_MODE.DYNAMIC,
        storage: mockStorage,
        fetchRoles,
        retry: { attempts: 3, delay: 100, backoff: 1 },
      });

      const initPromise = rbac.init();
      initPromise.catch(() => {}); // prevent unhandled rejection before expect
      await vi.runAllTimersAsync();

      await expect(initPromise).rejects.toThrow("persistent error");
      expect(fetchRoles).toHaveBeenCalledTimes(3);
    });

    it("should not retry when attempts is 1", async () => {
      const fetchRoles = vi.fn().mockRejectedValue(new Error("fail"));

      const rbac = createRBAC({
        mode: CONFIG_MODE.DYNAMIC,
        storage: mockStorage,
        fetchRoles,
        retry: { attempts: 1, delay: 100, backoff: 2 },
      });

      const initPromise = rbac.init();
      initPromise.catch(() => {}); // prevent unhandled rejection before expect
      await vi.runAllTimersAsync();

      await expect(initPromise).rejects.toThrow("fail");
      expect(fetchRoles).toHaveBeenCalledTimes(1);
    });

    it("should apply exponential backoff between attempts", async () => {
      const fetchRoles = vi
        .fn()
        .mockRejectedValueOnce(new Error("fail 1"))
        .mockRejectedValueOnce(new Error("fail 2"))
        .mockResolvedValueOnce({ viewer: { permissions: ["view"] } });

      const rbac = createRBAC({
        mode: CONFIG_MODE.DYNAMIC,
        storage: mockStorage,
        fetchRoles,
        retry: { attempts: 3, delay: 500, backoff: 2 },
      });

      const initPromise = rbac.init();

      // First attempt fails immediately, then waits 500ms (500 * 2^0)
      await vi.advanceTimersByTimeAsync(499);
      expect(fetchRoles).toHaveBeenCalledTimes(1);

      await vi.advanceTimersByTimeAsync(1);
      // Second attempt fires, fails, waits 1000ms (500 * 2^1)
      await vi.advanceTimersByTimeAsync(999);
      expect(fetchRoles).toHaveBeenCalledTimes(2);

      await vi.advanceTimersByTimeAsync(1);
      // Third attempt fires and succeeds
      await initPromise;
      expect(fetchRoles).toHaveBeenCalledTimes(3);
      expect(rbac.state.isInitialized).toBe(true);
    });

    it("should use default retry config when not specified", async () => {
      const fetchRoles = vi
        .fn()
        .mockRejectedValueOnce(new Error("fail"))
        .mockResolvedValueOnce({ admin: { permissions: ["admin:all"] } });

      const rbac = createRBAC({
        mode: CONFIG_MODE.DYNAMIC,
        storage: mockStorage,
        fetchRoles,
        // no retry config — defaults: attempts=3, delay=1000, backoff=2
      });

      const initPromise = rbac.init();
      await vi.runAllTimersAsync();
      await initPromise;

      expect(fetchRoles).toHaveBeenCalledTimes(2);
      expect(rbac.state.isInitialized).toBe(true);
    });

    it("should also retry in HYBRID mode", async () => {
      const fetchRoles = vi
        .fn()
        .mockRejectedValueOnce(new Error("fail"))
        .mockResolvedValueOnce({ dynamicRole: { permissions: ["dyn:perm"] } });

      const rbac = createRBAC({
        mode: CONFIG_MODE.HYBRID,
        storage: mockStorage,
        roles: { staticRole: { permissions: ["static:perm"] } },
        fetchRoles,
        retry: { attempts: 2, delay: 100, backoff: 1 },
      });

      const initPromise = rbac.init();
      await vi.runAllTimersAsync();
      await initPromise;

      expect(fetchRoles).toHaveBeenCalledTimes(2);
      expect(rbac.state.roles.staticRole).toBeDefined();
      expect(rbac.state.roles.dynamicRole).toBeDefined();
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
