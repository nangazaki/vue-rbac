import type { RBACConfig } from "./config.types";
import type { Permission, RoleKey, RolesConfig } from "./roles.types";
import type { LogLevel } from "./utils.types";

export interface RBACState {
  roles: RolesConfig;
  userRoles: RoleKey[];
  isLoading: boolean;
  isInitialized: boolean;
}

export interface VueRBACPluginOptions {
  config?: Partial<RBACConfig>;
  logLevel?: LogLevel;
}

export interface RBAC {
  options: Required<RBACConfig>;
  state: RBACState;
  init(): Promise<RolesConfig>;
  fetchRolesAndPermissions(): Promise<RolesConfig>;
  setUserRoles(roles: RoleKey | RoleKey[]): void;
  hasPermission(permission: Permission): boolean;
  hasRole(role: RoleKey): boolean;
  hasAnyPermission(permissions: Permission[]): boolean;
  hasAllPermissions(permissions: Permission[]): boolean;
}

export interface IUseRBAC {
  state: RBACState;
  setUserRoles(roles: RoleKey | RoleKey[]): void;
  hasRole(role: RoleKey): boolean;
  hasPermission(permission: Permission): boolean;
  hasAnyPermission(permissions: Permission[]): boolean;
  hasAllPermissions(permissions: Permission[]): boolean;
}
