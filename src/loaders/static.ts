import type { RBACConfig, RBACState, RolesConfig } from "@/types";

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