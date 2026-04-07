import { describe, it, expect, vi, beforeEach } from "vitest";
import { inject } from "vue";
import { useRBAC } from "../composables/useRBAC";
import { RBAC_SYMBOL } from "../symbols";

// Mock Vue's inject function
vi.mock("vue", () => ({
  inject: vi.fn(),
}));

describe("useRBAC Composable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("When plugin is installed", () => {
    it("should return object with correct methods", () => {
      const mockRbac = {
        state: {
          roles: {},
          userRoles: [],
          isLoading: false,
          isInitialized: true,
        },
        setUserRoles: vi.fn(),
        hasAllPermissions: vi.fn(),
        hasAnyPermission: vi.fn(),
        hasPermission: vi.fn(),
        hasRole: vi.fn(),
      };

      vi.mocked(inject).mockReturnValue(mockRbac);

      const result = useRBAC();

      expect(inject).toHaveBeenCalledWith(RBAC_SYMBOL);
      expect(result).toHaveProperty("state");
      expect(result).toHaveProperty("setUserRoles");
      expect(result).toHaveProperty("hasAllPermissions");
      expect(result).toHaveProperty("hasAnyPermission");
      expect(result).toHaveProperty("hasPermission");
      expect(result).toHaveProperty("hasRole");
    });

    it("should return the correct state object", () => {
      const mockState = {
        roles: {
          admin: { permissions: ["admin:all"] },
        },
        userRoles: ["admin"],
        isLoading: false,
        isInitialized: true,
      };

      const mockRbac = {
        state: mockState,
        setUserRoles: vi.fn(),
        hasAllPermissions: vi.fn(),
        hasAnyPermission: vi.fn(),
        hasPermission: vi.fn(),
        hasRole: vi.fn(),
      };

      vi.mocked(inject).mockReturnValue(mockRbac);

      const result = useRBAC();

      expect(result.state).toBe(mockState);
      expect(result.state.userRoles).toEqual(["admin"]);
    });

    it("should return functional permission methods", () => {
      const mockRbac = {
        state: {
          roles: {},
          userRoles: [],
          isLoading: false,
          isInitialized: true,
        },
        setUserRoles: vi.fn(),
        hasAllPermissions: vi.fn().mockReturnValue(true),
        hasAnyPermission: vi.fn().mockReturnValue(true),
        hasPermission: vi.fn().mockReturnValue(true),
        hasRole: vi.fn().mockReturnValue(true),
      };

      vi.mocked(inject).mockReturnValue(mockRbac);

      const result = useRBAC();

      // Test that methods are callable and return expected values
      expect(result.hasPermission("test:permission")).toBe(true);
      expect(result.hasRole("admin")).toBe(true);
      expect(result.hasAnyPermission(["p1", "p2"])).toBe(true);
      expect(result.hasAllPermissions(["p1", "p2"])).toBe(true);
    });

    it("should allow setting user roles", () => {
      const setUserRolesMock = vi.fn();
      const mockRbac = {
        state: {
          roles: {},
          userRoles: [],
          isLoading: false,
          isInitialized: true,
        },
        setUserRoles: setUserRolesMock,
        hasAllPermissions: vi.fn(),
        hasAnyPermission: vi.fn(),
        hasPermission: vi.fn(),
        hasRole: vi.fn(),
      };

      vi.mocked(inject).mockReturnValue(mockRbac);

      const result = useRBAC();
      result.setUserRoles(["editor", "viewer"]);

      expect(setUserRolesMock).toHaveBeenCalledWith(["editor", "viewer"]);
    });
  });

  describe("When plugin is NOT installed", () => {
    it("should throw error when RBAC context is not found", () => {
      vi.mocked(inject).mockReturnValue(undefined);

      expect(() => useRBAC()).toThrow(
        "[vue-rbac] RBAC context not found. Make sure the plugin is installed."
      );
    });

    it("should throw error when inject returns null", () => {
      vi.mocked(inject).mockReturnValue(null);

      expect(() => useRBAC()).toThrow(
        "[vue-rbac] RBAC context not found. Make sure the plugin is installed."
      );
    });
  });
});
