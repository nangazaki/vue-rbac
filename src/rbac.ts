import { RoleKey, Permission } from "./types/index";
import { defaultConfig } from "./config/default";
import { validateConfig } from "./config/schema";
import { createStore } from "./store";
import { CONFIG_MODE, type RBAC, type RBACConfig } from "./types";
import { loadStaticConfig } from "./loaders/static";
import { loadDynamicConfig } from "./loaders/dynamic";
import { gettAllPermissionForRole } from "./core/role";

export function createRBAC(config: Partial<RBACConfig> = {}): RBAC {
  const validatedConfig = validateConfig({
    ...defaultConfig,
    ...config,
  });

  const state = createStore(validatedConfig.roles || {});

  const rbac: RBAC = {
    options: validatedConfig as Required<RBACConfig>,
    state,

    async init() {
      if (this.state.isInitialized) {
        return this.state.roles;
      }

      switch (this.options.mode) {
        case CONFIG_MODE.STATIC:
          return loadStaticConfig(this.state, this.options);
        case CONFIG_MODE.DYNAMIC:
          return loadDynamicConfig(this.state, this.options);
        case CONFIG_MODE.HYBRID:
          await loadStaticConfig(this.state, this.options);
          return loadDynamicConfig(this.state, this.options, true);
      }
    },

    async fetchRolesAndPermissions() {
      return loadDynamicConfig(this.state, this.options);
    },

    setUserRoles(roles: RoleKey | RoleKey[]) {
      this.state.userRoles = Array.isArray(roles) ? roles : [roles];
    },

    hasPermission(permission: Permission): boolean {
      if (!this.state.isInitialized || this.state.userRoles.length === 0) {
        return false;
      }

      return this.state.userRoles.some((roleKey) => {
        const role = this.state.roles[roleKey];
        if (!role) return false;

        const allPermissions = gettAllPermissionForRole(
          roleKey,
          this.state.roles
        );
        return allPermissions.includes(permission);
      });
    },

    hasRole(role: RoleKey) {
      return this.state.userRoles.includes(role);
    },

    hasAnyPermission(permissions: Permission[]): boolean {
      console.log(permissions);
      return permissions.some((permission) => this.hasPermission(permission));
    },

    hasAllPermissions(permissions: Permission[]): boolean {
      return permissions.every((permission) => this.hasPermission(permission));
    },
  };

  return rbac;
}
