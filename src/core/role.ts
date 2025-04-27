import type { Permission, RoleKey, RolesConfig } from "@/types";

/**
 * Retrieves all permissions associated with a specific role, including inherited permissions.
 * This function handles role inheritance by recursively collecting permissions from parent roles
 * while preventing circular dependencies.
 *
 * @param roleKey - The key identifier of the role to get permissions for
 * @param rolesConfig - The configuration object containing all roles and their permissions
 * @param processedRoles - A Set to track processed roles and prevent circular dependencies
 * @returns An array of unique permissions associated with the role and its inherited roles
 *
 * @example
 * ```typescript
 * const permissions = getAllPermissionsForRole('admin', rolesConfig);
 * ```
 *
 * @remarks
 * - The function uses recursion to traverse the role hierarchy
 * - Duplicate permissions are automatically removed from the final result
 * - Circular role dependencies are handled by tracking processed roles
 */
export function getAllPermissionsForRole(
  roleKey: RoleKey,
  rolesConfig: RolesConfig,
  processed: Set<RoleKey> = new Set(),
  cache: Map<RoleKey, Permission[]> = new Map()
): Permission[] {
  if (cache.has(roleKey)) {
    return cache.get(roleKey)!;
  }

  if (processed.has(roleKey)) {
    return [];
  }

  const role = rolesConfig[roleKey];
  if (!role) {
    throw new Error(`Role '${roleKey}' not defined in rolesConfig.`);
  }

  processed.add(roleKey);

  const resultSet = new Set<Permission>(role.permissions);

  for (const parent of role.inherits ?? []) {
    const perms = getAllPermissionsForRole(
      parent,
      rolesConfig,
      new Set(processed),
      cache
    );
    perms.forEach((p) => resultSet.add(p));
  }

  const result = Array.from(resultSet);
  cache.set(roleKey, result);
  return result;
}
