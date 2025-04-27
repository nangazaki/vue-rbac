import type { RBACConfig, RBACState, RolesConfig } from "@/types";

/**
 * Loads static RBAC configuration into the state.
 * 
 * @param state - The current RBAC state object
 * @param options - The required RBAC configuration options
 * @returns A Promise that resolves to the roles configuration
 * 
 * @remarks
 * This function updates the state with roles from the provided options and marks the state as initialized.
 */
export async function loadStaticConfig(
  state: RBACState,
  options: Required<RBACConfig>
): Promise<RolesConfig> {
  if (options.roles) {
    state.roles = { ...options.roles };
  }
  
  state.isInitialized = true;
  return state.roles;
}