import type { RBACConfig, RBACState, RolesConfig } from "@/types";

export async function loadDynamicConfig(
  state: RBACState,
  options: Required<RBACConfig>,
  mergeWithExisting = false
): Promise<RolesConfig> {
  state.isLoading = true;
  
  try {
    const response = await fetch(options.apiEndpoint, options.fetchOptions);
    if (!response.ok) {
      throw new Error(`Falha ao carregar configuração: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const transformed = options.transformResponse(data);
    
    if (mergeWithExisting) {
      // Hybrid Mode: merge with existing configuration
      state.roles = {
        ...state.roles,
        ...transformed.roles
      };
    } else {
      // Dynamic Mode: completely replace
      state.roles = transformed.roles;
    }
    
    state.isInitialized = true;
    return state.roles;
  } catch (error) {
    console.error('Erro ao carregar configuração RBAC:', error);
    throw error;
  } finally {
    state.isLoading = false;
  }
}