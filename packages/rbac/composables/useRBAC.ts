import { inject } from "vue";
import { RBAC, type IUseRBAC } from "../types/rbac.types";
import { RBAC_SYMBOL } from "@/symbols";
import { logger } from "@/utils/logger";

/**
 * Provides access to the RBAC (Role-Based Access Control) context and utility methods.
 *
 * This composable injects the RBAC context and exposes state and helper functions
 * for managing user roles and checking permissions within a Vue application.
 *
 * @throws {Error} If the RBAC context is not found, indicating the plugin is not installed.
 * @returns {IUseRBAC} An object containing the RBAC state and utility methods:
 *   - `state`: The current RBAC state.
 *   - `setUserRoles`: Function to set user roles.
 *   - `hasAllPermissions`: Function to check if user has all specified permissions.
 *   - `hasAnyPermission`: Function to check if user has any of the specified permissions.
 *   - `hasPermission`: Function to check if user has a specific permission.
 *   - `hasRole`: Function to check if user has a specific role.
 */
export function useRBAC(): IUseRBAC {
  const rbac = inject<RBAC>(RBAC_SYMBOL);

  if (!rbac) {
    logger.error("RBAC context not found. Make sure the plugin is installed.");
    throw new Error(
      "[vue-rbac] RBAC context not found. Make sure the plugin is installed."
    );
  }

  return {
    state: rbac.state,
    setUserRoles: rbac.setUserRoles,
    hasAllPermissions: rbac.hasAllPermissions,
    hasAnyPermission: rbac.hasAnyPermission,
    hasPermission: rbac.hasPermission,
    hasRole: rbac.hasRole,
  };
}
