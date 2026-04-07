import { logger } from "@/utils/logger";
import type { RBACConfig, RBACState, RolesConfig } from "../types/index";

/**
 * Loads RBAC configuration dynamically using a user-provided resolver.
 *
 * @param state - The current RBAC state object to be updated
 * @param options - RBAC configuration including the resolver function
 * @param mergeWithExisting - When true, merges the loaded config with existing roles. When false, replaces entirely
 * @returns Promise resolving to the updated roles configuration
 * @throws Error if configuration loading fails or no valid loader is provided
 */
export async function loadDynamicConfig(
  state: RBACState,
  options: Required<RBACConfig>,
  mergeWithExisting = false
): Promise<RolesConfig> {
  state.isLoading = true;

  try {
    let roles: RolesConfig = {};

    if (typeof options.fetchRoles === "function") {
      roles = await options.fetchRoles();
    } else if (options.apiEndpoint) {
      logger.warn("`apiEndpoint` is deprecated, use `fetchRoles` instead");

      const response = await fetch(options.apiEndpoint, options.fetchOptions);
      if (!response.ok) {
        logger.error(
          `Failed to load configuration: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      const transformed = options.transformResponse(data);
      roles = transformed.roles;
    }

    if (!roles) {
      logger.error(
        "No valid configuration loader provided (fetchRoles or apiEndpoint)"
      );
    }

    if (mergeWithExisting) {
      // Hybrid Mode: merge with existing configuration
      state.roles = {
        ...state.roles,
        ...roles,
      };
    } else {
      // Dynamic Mode: completely replace
      state.roles = roles;
    }

    state.isInitialized = true;
    return state.roles;
  } catch (error) {
    logger.error("Error loading RBAC configuration:", error);
    throw error;
  } finally {
    state.isLoading = false;
  }
}
