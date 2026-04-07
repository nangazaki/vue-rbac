import { describe, it, expect, beforeEach, vi } from "vitest";
import { createRBAC, CONFIG_MODE, sessionStorageAdapter } from "../index";

const mockStorage = {
  get: vi.fn(),
  set: vi.fn(),
  remove: vi.fn(),
};

describe("createRBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with static mode", async () => {
    const rbac = createRBAC({
      mode: CONFIG_MODE.STATIC,
      roles: {
        admin: { permissions: ["read", "write"] },
      },
    });

    await rbac.init();

    expect(rbac.state.isInitialized).toBe(true);
    expect(rbac.state.roles.admin.permissions).toContain("read");
  });

  it("should persist user roles when using sessionStorageAdapter", () => {
    const spy = vi.spyOn(sessionStorageAdapter, "set");
    const rbac = createRBAC({
      roles: {
        admin: { permissions: ["read", "write"] },
      },
      storage: sessionStorageAdapter,
    });

    rbac.setUserRoles(["admin"]);

    expect(spy).toHaveBeenCalledWith(
      "vue-rbac@v1",
      expect.objectContaining({
        roles: {
          admin: { permissions: ["read", "write"] },
        },
        userRoles: expect.arrayContaining(["admin"]),
      })
    );
  });

  it("should load saved roles from storage", () => {
    mockStorage.get.mockReturnValueOnce(["guest"]);

    const rbac = createRBAC({
      storage: mockStorage,
    });

    expect(rbac.state.userRoles).toEqual([]);
  });

  it("should correctly compute user permissions", async () => {
    const rbac = createRBAC({
      mode: CONFIG_MODE.STATIC,
      roles: {
        admin: { permissions: ["manage:users", "delete:posts"] },
      },
    });

    await rbac.init();
    rbac.setUserRoles("admin");

    expect(rbac.hasPermission("manage:users")).toBe(true);
    expect(rbac.hasPermission("read:posts")).toBe(false);
  });
});
