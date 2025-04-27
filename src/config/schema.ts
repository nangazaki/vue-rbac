import { CONFIG_MODE, type RBACConfig } from "@/types";

const VALID_MODES = [
  CONFIG_MODE.STATIC,
  CONFIG_MODE.DYNAMIC,
  CONFIG_MODE.HYBRID,
] as const;

/**
 * Validates the RBAC configuration object.
 *
 * @param config - Partial configuration object to validate
 * @throws {Error} When mode is invalid (must be 'static', 'dynamic' or 'hybrid')
 * @throws {Error} When permissions for a role is not an array
 * @throws {Error} When role inheritance is not an array
 * @throws {Error} When inherited role doesn't exist in config
 * @returns {RBACConfig} Validated configuration object
 *
 * @remarks
 * This function performs several validations:
 * - Validates mode is one of: static, dynamic, or hybrid
 * - Warns if apiEndpoint is missing for dynamic/hybrid modes
 * - Validates roles structure including:
 *   - Permissions array format
 *   - Role inheritance references
 */
export function validateConfig(config: Partial<RBACConfig>): RBACConfig {
  const validatedConfig = { ...config };

  if (config.mode && !VALID_MODES.includes(config.mode)) {
    throw new Error(
      `Invalid Mode: ${config.mode}. Use 'static', 'dynamic' or 'hybrid'.`
    );
  }

  if (
    (config.mode === CONFIG_MODE.DYNAMIC ||
      config.mode === CONFIG_MODE.HYBRID) &&
    !config.apiEndpoint
  ) {
    console.warn(
      "Dynamic/hybrid mode requires an apiEndpoint. Using default: /api/rbac/permissions"
    );
  }

  if (config.roles) {
    // Check roles structure
    Object.entries(config.roles).forEach(([roleKey, role]) => {
      if (!Array.isArray(role.permissions)) {
        throw new Error(`Permissions for role '${roleKey}' must be an array.`);
      }

      // Check inheritance references
      if (role.inherits) {
        if (!Array.isArray(role.inherits)) {
          throw new Error(`'inherits' for role '${roleKey}' must be an array.`);
        }

        role.inherits.forEach((inheritedRole) => {
          if (!config.roles?.[inheritedRole]) {
            throw new Error(
              `Role '${roleKey}' inherits from '${inheritedRole}' which is not defined.`
            );
          }
        });
      }
    });
  }

  return validatedConfig as RBACConfig;
}
