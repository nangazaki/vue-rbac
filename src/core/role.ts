import type { Permission, RoleKey, RolesConfig } from "@/types";

export function gettAllPermissionForRole(
  roleKey: RoleKey,
  rolesConfig: RolesConfig,
  processedRoles: Set<RoleKey> = new Set()
): Permission[] {
  if (processedRoles.has(roleKey)) {
    return [];
  }

  const role = rolesConfig[roleKey];
  if (!role) return [];

  processedRoles.add(roleKey);

  const directPermissions = [...role.permissions];

  if (role.inherits && role.inherits.length > 0) {
    const inheritedPermissions = role.inherits.flatMap((inheritedRole) =>
      gettAllPermissionForRole(inheritedRole, rolesConfig, processedRoles)
    );

    // Combinar permissões diretas e herdadas, eliminando duplicatas
    return [...new Set([...directPermissions, ...inheritedPermissions])];
  }

  return directPermissions;
}
