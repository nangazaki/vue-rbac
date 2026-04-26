import { logger } from "@/utils/logger";
import type { RBACConfig, RBACState, RolesConfig } from "../types/index";

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry<T>(
  fn: () => Promise<T>,
  attempts: number,
  delay: number,
  backoff: number
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < attempts) {
        const wait = delay * Math.pow(backoff, attempt - 1);
        logger.warn(
          `RBAC dynamic load failed (attempt ${attempt}/${attempts}). Retrying in ${wait}ms...`
        );
        await sleep(wait);
      }
    }
  }

  throw lastError;
}

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

  const { attempts = 3, delay = 1000, backoff = 2 } = options.retry ?? {};

  try {
    let roles: RolesConfig = {};

    if (typeof options.fetchRoles === "function") {
      roles = await withRetry(() => Promise.resolve(options.fetchRoles()), attempts, delay, backoff);
    } else if (options.apiEndpoint) {
      logger.warn("`apiEndpoint` is deprecated, use `fetchRoles` instead");

      roles = await withRetry(async () => {
        const response = await fetch(options.apiEndpoint, options.fetchOptions);
        if (!response.ok) {
          throw new Error(
            `Failed to load configuration: ${response.status} ${response.statusText}`
          );
        }
        const data = await response.json();
        return options.transformResponse(data).roles;
      }, attempts, delay, backoff);
    }

    if (!roles) {
      logger.error(
        "No valid configuration loader provided (fetchRoles or apiEndpoint)"
      );
    }

    if (mergeWithExisting) {
      state.roles = { ...state.roles, ...roles };
    } else {
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
