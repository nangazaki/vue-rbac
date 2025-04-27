import type { LogLevel } from "@/utils/logger";

export enum CONFIG_MODE {
  STATIC = "static",
  DYNAMIC = "dynamic",
  HYBRID = "hybrid",
}

export type Permission = string;

export type RoleKey = string;

export interface Role {
  permissions: Permission[];
  inherits?: RoleKey[];
}

export interface RolesConfig {
  [key: RoleKey]: Role;
}

export type ConfigMode = (typeof CONFIG_MODE)[keyof typeof CONFIG_MODE];

export interface FetchOptions extends RequestInit {}

export interface RBACConfig {
  roles?: RolesConfig;
  mode?: ConfigMode;
  apiEndpoint?: string;
  fetchOptions?: FetchOptions;
  transformResponse?: (data: any) => { roles: RolesConfig };
  autoInit?: boolean;
}

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
