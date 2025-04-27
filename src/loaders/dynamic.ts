import type { RBACConfig, RBACState, RolesConfig } from "@/types";

/**
 * Loads RBAC configuration from a remote endpoint and updates the state.
 * 
 * @param state - The current RBAC state object to be updated
 * @param options - Required configuration options including API endpoint and fetch options
 * @param mergeWithExisting - When true, merges the loaded config with existing roles. When false, replaces entirely
 * @returns Promise resolving to the updated roles configuration
 * @throws {Error} When the fetch request fails or returns a non-ok status
 * 
 * @example
 * ```typescript
 * const state = createRBACState();
 * const options = {
 *   apiEndpoint: 'https://api.example.com/rbac',
 *   fetchOptions: { headers: { 'Authorization': 'Bearer token' } },
 *   transformResponse: (data) => data
 * };
 * 
 * const roles = await loadDynamicConfig(state, options);
 * ```
 */
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