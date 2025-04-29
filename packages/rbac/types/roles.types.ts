export type Permission = string;

export type RoleKey = string;

export interface Role {
  permissions: Permission[];
  inherits?: RoleKey[];
}

export interface RolesConfig {
  [key: RoleKey]: Role;
}