import { defaultConfig } from "./config/default";
import { validateConfig } from "./config/schema";
import { getAllPermissionsForRole } from "./core/role";
import { loadDynamicConfig } from "./loaders/dynamic";
import { loadStaticConfig } from "./loaders/static";
import { createStore } from "./store";
import { CONFIG_MODE, type RBAC, type RBACConfig } from "./types";
import { Permission, RoleKey } from "./types/index";

export function createRBAC(config: Partial<RBACConfig> = {}): RBAC {
  const options = validateConfig({ ...defaultConfig, ...config });

  const storage = options.storage;
  const storageKey = options.storageKey ?? "vue-rbac@v1";

  const state = createStore(options.roles);

  if (storage) {
    const savedRoles = storage.get<RoleKey[]>(`${storageKey}:roles`);
    if (savedRoles && Array.isArray(savedRoles)) state.userRoles = savedRoles;
  }

  let userPermissions: Set<Permission> = new Set();

  function computeUserPermissions() {
    const perms = new Set<Permission>();
    for (const roleKey of state.userRoles) {
      const all = getAllPermissionsForRole(roleKey, state.roles);
      all.forEach((p) => perms.add(p));
    }
    userPermissions = perms;
  }

  const rbac: RBAC = {
    options: options as Required<RBACConfig>,
    state,

    async init() {
      if (!state.isInitialized) {
        state.isInitialized = true;
        switch (options.mode) {
          case CONFIG_MODE.STATIC:
            await loadStaticConfig(state, options as Required<RBACConfig>);
            break;
          case CONFIG_MODE.DYNAMIC:
            await loadDynamicConfig(state, options as Required<RBACConfig>);
            break;
          case CONFIG_MODE.HYBRID:
            await loadStaticConfig(state, options as Required<RBACConfig>);
            await loadDynamicConfig(
              state,
              options as Required<RBACConfig>,
              true
            );
            break;
        }
      }

      computeUserPermissions();
      return state.roles;
    },

    async fetchRolesAndPermissions() {
      await loadDynamicConfig(state, options as Required<RBACConfig>);
      computeUserPermissions();
      return state.roles;
    },

    setUserRoles(roles: RoleKey | RoleKey[]) {
      state.userRoles = Array.isArray(roles) ? roles : [roles];
      if (storage)
        storage.set(storageKey, Array.isArray(roles) ? roles : [roles]);
      computeUserPermissions();
    },

    hasPermission(permission: Permission): boolean {
      return userPermissions.has(permission);
    },

    hasRole(role: RoleKey): boolean {
      return state.userRoles.includes(role);
    },

    hasAnyPermission(permissions: Permission[]): boolean {
      return permissions.some((p) => userPermissions.has(p));
    },

    hasAllPermissions(permissions: Permission[]): boolean {
      return permissions.every((p) => userPermissions.has(p));
    },
  };

  return rbac;
}
