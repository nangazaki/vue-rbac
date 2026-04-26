import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { h } from "vue";
import { RbacGuard } from "../components";

import type { IUseRBAC } from "../types/rbac.types";

vi.mock("../composables/index", () => ({
  useRBAC: () => mockRbac,
}));

let mockRbac: IUseRBAC;

beforeEach(() => {
  mockRbac = {
    state: { isLoading: false, isInitialized: true, roles: {}, userRoles: [] },
    hasPermission: vi.fn(),
    hasRole: vi.fn(),
    hasAnyPermission: vi.fn(),
    hasAllPermissions: vi.fn(),
  } as unknown as IUseRBAC;
});

const defaultSlot = () => h("span", { class: "content" }, "conteúdo protegido");
const fallbackSlot = () => h("span", { class: "fallback" }, "sem acesso");

describe("RbacGuard", () => {
  describe("prop: role", () => {
    it("should render slot when user has the role", () => {
      vi.mocked(mockRbac.hasRole).mockReturnValue(true);

      const wrapper = mount(RbacGuard, {
        props: { role: "admin" },
        slots: { default: defaultSlot },
      });

      expect(wrapper.find(".content").exists()).toBe(true);
      expect(mockRbac.hasRole).toHaveBeenCalledWith("admin");
    });

    it("should not render slot when user does not have the role", () => {
      vi.mocked(mockRbac.hasRole).mockReturnValue(false);

      const wrapper = mount(RbacGuard, {
        props: { role: "admin" },
        slots: { default: defaultSlot },
      });

      expect(wrapper.find(".content").exists()).toBe(false);
    });

    it("should render slot when user has at least one role in array", () => {
      vi.mocked(mockRbac.hasRole).mockImplementation(
        (r: string) => r === "editor",
      );

      const wrapper = mount(RbacGuard, {
        props: { role: ["admin", "editor"] },
        slots: { default: defaultSlot },
      });

      expect(wrapper.find(".content").exists()).toBe(true);
    });

    it("should not render slot when user has none of the roles in array", () => {
      vi.mocked(mockRbac.hasRole).mockReturnValue(false);

      const wrapper = mount(RbacGuard, {
        props: { role: ["admin", "editor"] },
        slots: { default: defaultSlot },
      });

      expect(wrapper.find(".content").exists()).toBe(false);
    });
  });

  describe("prop: permission", () => {
    it("should render slot when user has the permission", () => {
      vi.mocked(mockRbac.hasPermission).mockReturnValue(true);

      const wrapper = mount(RbacGuard, {
        props: { permission: "posts:edit" },
        slots: { default: defaultSlot },
      });

      expect(wrapper.find(".content").exists()).toBe(true);
      expect(mockRbac.hasPermission).toHaveBeenCalledWith("posts:edit");
    });

    it("should not render slot when user does not have the permission", () => {
      vi.mocked(mockRbac.hasPermission).mockReturnValue(false);

      const wrapper = mount(RbacGuard, {
        props: { permission: "posts:edit" },
        slots: { default: defaultSlot },
      });

      expect(wrapper.find(".content").exists()).toBe(false);
    });

    it("should require all permissions in array", () => {
      vi.mocked(mockRbac.hasPermission).mockImplementation(
        (p: string) => p === "posts:edit",
      );

      const wrapper = mount(RbacGuard, {
        props: { permission: ["posts:edit", "posts:delete"] },
        slots: { default: defaultSlot },
      });

      expect(wrapper.find(".content").exists()).toBe(false);
    });

    it("should render slot when user has all permissions in array", () => {
      vi.mocked(mockRbac.hasPermission).mockReturnValue(true);

      const wrapper = mount(RbacGuard, {
        props: { permission: ["posts:edit", "posts:delete"] },
        slots: { default: defaultSlot },
      });

      expect(wrapper.find(".content").exists()).toBe(true);
    });
  });

  describe("prop: any", () => {
    it("should render slot when user has at least one permission", () => {
      vi.mocked(mockRbac.hasAnyPermission).mockReturnValue(true);

      const wrapper = mount(RbacGuard, {
        props: { any: ["posts:edit", "posts:delete"] },
        slots: { default: defaultSlot },
      });

      expect(wrapper.find(".content").exists()).toBe(true);
      expect(mockRbac.hasAnyPermission).toHaveBeenCalledWith([
        "posts:edit",
        "posts:delete",
      ]);
    });

    it("should not render slot when user has none of the permissions", () => {
      vi.mocked(mockRbac.hasAnyPermission).mockReturnValue(false);

      const wrapper = mount(RbacGuard, {
        props: { any: ["posts:edit", "posts:delete"] },
        slots: { default: defaultSlot },
      });

      expect(wrapper.find(".content").exists()).toBe(false);
    });

    it("should normalize string value to array", () => {
      vi.mocked(mockRbac.hasAnyPermission).mockReturnValue(true);

      mount(RbacGuard, {
        props: { any: "posts:edit" },
        slots: { default: defaultSlot },
      });

      expect(mockRbac.hasAnyPermission).toHaveBeenCalledWith(["posts:edit"]);
    });
  });

  describe("prop: all", () => {
    it("should render slot when user has all permissions", () => {
      vi.mocked(mockRbac.hasAllPermissions).mockReturnValue(true);

      const wrapper = mount(RbacGuard, {
        props: { all: ["posts:edit", "posts:delete"] },
        slots: { default: defaultSlot },
      });

      expect(wrapper.find(".content").exists()).toBe(true);
      expect(mockRbac.hasAllPermissions).toHaveBeenCalledWith([
        "posts:edit",
        "posts:delete",
      ]);
    });

    it("should not render slot when user is missing any permission", () => {
      vi.mocked(mockRbac.hasAllPermissions).mockReturnValue(false);

      const wrapper = mount(RbacGuard, {
        props: { all: ["posts:edit", "posts:delete"] },
        slots: { default: defaultSlot },
      });

      expect(wrapper.find(".content").exists()).toBe(false);
    });

    it("should normalize string value to array", () => {
      vi.mocked(mockRbac.hasAllPermissions).mockReturnValue(true);

      mount(RbacGuard, {
        props: { all: "posts:edit" },
        slots: { default: defaultSlot },
      });

      expect(mockRbac.hasAllPermissions).toHaveBeenCalledWith(["posts:edit"]);
    });
  });

  describe("prop: not", () => {
    it("should render slot when user does NOT have the role or permission", () => {
      vi.mocked(mockRbac.hasRole).mockReturnValue(false);
      vi.mocked(mockRbac.hasPermission).mockReturnValue(false);

      const wrapper = mount(RbacGuard, {
        props: { not: "admin" },
        slots: { default: defaultSlot },
      });

      expect(wrapper.find(".content").exists()).toBe(true);
    });

    it("should not render slot when user has the role", () => {
      vi.mocked(mockRbac.hasRole).mockReturnValue(true);

      const wrapper = mount(RbacGuard, {
        props: { not: "admin" },
        slots: { default: defaultSlot },
      });

      expect(wrapper.find(".content").exists()).toBe(false);
    });

    it("should not render slot when user has the permission", () => {
      vi.mocked(mockRbac.hasRole).mockReturnValue(false);
      vi.mocked(mockRbac.hasPermission).mockReturnValue(true);

      const wrapper = mount(RbacGuard, {
        props: { not: "posts:edit" },
        slots: { default: defaultSlot },
      });

      expect(wrapper.find(".content").exists()).toBe(false);
    });

    it("should not render slot when user has any value in array", () => {
      vi.mocked(mockRbac.hasRole).mockImplementation(
        (r: string) => r === "admin",
      );
      vi.mocked(mockRbac.hasPermission).mockReturnValue(false);

      const wrapper = mount(RbacGuard, {
        props: { not: ["admin", "editor"] },
        slots: { default: defaultSlot },
      });

      expect(wrapper.find(".content").exists()).toBe(false);
    });
  });

  describe("slot: fallback", () => {
    it("should render fallback slot when access is denied", () => {
      vi.mocked(mockRbac.hasPermission).mockReturnValue(false);

      const wrapper = mount(RbacGuard, {
        props: { permission: "posts:edit" },
        slots: { default: defaultSlot, fallback: fallbackSlot },
      });

      expect(wrapper.find(".fallback").exists()).toBe(true);
      expect(wrapper.find(".content").exists()).toBe(false);
    });

    it("should not render fallback slot when access is granted", () => {
      vi.mocked(mockRbac.hasPermission).mockReturnValue(true);

      const wrapper = mount(RbacGuard, {
        props: { permission: "posts:edit" },
        slots: { default: defaultSlot, fallback: fallbackSlot },
      });

      expect(wrapper.find(".fallback").exists()).toBe(false);
      expect(wrapper.find(".content").exists()).toBe(true);
    });

    it("should render nothing when access is denied and no fallback slot is provided", () => {
      vi.mocked(mockRbac.hasPermission).mockReturnValue(false);

      const wrapper = mount(RbacGuard, {
        props: { permission: "posts:edit" },
      });

      expect(wrapper.html()).toBe("");
    });
  });

  describe("slot: loading", () => {
    const loadingSlot = () => h("span", { class: "loading" }, "a carregar...");

    it("should render loading slot when state.isLoading is true", () => {
      mockRbac.state.isLoading = true;
      vi.mocked(mockRbac.hasPermission).mockReturnValue(true);

      const wrapper = mount(RbacGuard, {
        props: { permission: "posts:edit" },
        slots: { default: defaultSlot, loading: loadingSlot },
      });

      expect(wrapper.find(".loading").exists()).toBe(true);
      expect(wrapper.find(".content").exists()).toBe(false);
    });

    it("should render nothing when loading and no loading slot is provided", () => {
      mockRbac.state.isLoading = true;

      const wrapper = mount(RbacGuard, {
        props: { permission: "posts:edit" },
        slots: { default: defaultSlot },
      });

      expect(wrapper.html()).toBe("");
    });

    it("should not render loading slot once loading is complete", () => {
      mockRbac.state.isLoading = false;
      vi.mocked(mockRbac.hasPermission).mockReturnValue(true);

      const wrapper = mount(RbacGuard, {
        props: { permission: "posts:edit" },
        slots: { default: defaultSlot, loading: loadingSlot },
      });

      expect(wrapper.find(".loading").exists()).toBe(false);
      expect(wrapper.find(".content").exists()).toBe(true);
    });
  });

  describe("multiple access props", () => {
    it("should warn when more than one access prop is provided", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      vi.mocked(mockRbac.hasRole).mockReturnValue(true);

      mount(RbacGuard, {
        props: { role: "admin", permission: "posts:edit" },
        slots: { default: defaultSlot },
      });

      expect(warnSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining("Multiple access props detected")
      );

      warnSpy.mockRestore();
    });

    it("should only evaluate the first prop when multiple are provided", () => {
      vi.mocked(mockRbac.hasRole).mockReturnValue(true);
      vi.mocked(mockRbac.hasPermission).mockReturnValue(false);

      const wrapper = mount(RbacGuard, {
        props: { role: "admin", permission: "posts:edit" },
        slots: { default: defaultSlot },
      });

      // role is evaluated first — grants access despite permission returning false
      expect(wrapper.find(".content").exists()).toBe(true);
      expect(mockRbac.hasPermission).not.toHaveBeenCalled();
    });
  });

  describe("Invalid values", () => {
    it("should not render slot when no props are passed", () => {
      const wrapper = mount(RbacGuard, {
        slots: { default: defaultSlot },
      });

      expect(wrapper.find(".content").exists()).toBe(false);
    });
  });
});
