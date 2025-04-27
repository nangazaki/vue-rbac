import { CONFIG_MODE, type RBACConfig } from "@/types";

export function validateConfig(config: Partial<RBACConfig>): RBACConfig {
  const validatedConfig = { ...config };

  if (
    config.mode &&
    ![CONFIG_MODE.STATIC, CONFIG_MODE.DYNAMIC, CONFIG_MODE.HYBRID].includes(
      config.mode
    )
  ) {
    throw new Error(
      `Invalid Mode: ${config.mode}. Use 'static', 'dynamic' or 'hybrid'.`
    );
  }

  if (config.mode === CONFIG_MODE.DYNAMIC || config.mode === CONFIG_MODE.HYBRID) {
    if (!config.apiEndpoint) {
      console.warn('Dynamic/hybrid mode requires an apiEndpoint. Using default: /api/rbac/permissions');
    }
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
        
        role.inherits.forEach(inheritedRole => {
          if (!config.roles?.[inheritedRole]) {
            throw new Error(`Role '${roleKey}' inherits from '${inheritedRole}' which is not defined.`);
          }
        });
      }
    });
  }
  
  return validatedConfig as RBACConfig;
}
