import type { RBAC } from "@/types";
import type { DirectiveBinding } from "vue";

/**
 * Checks if the current user has access based on the provided directive binding and RBAC configuration.
 *
 * @param binding - Vue directive binding object containing modifiers and values
 * @param rbac - RBAC instance for permission/role checking
 * @returns boolean indicating if access is granted
 *
 * @example
 * // Role check
 * v-rbac:role="'admin'"
 *
 * @example
 * // Any permission check
 * v-rbac:any="['users:create', 'users:edit']"
 *
 * @example
 * // All permissions check
 * v-rbac:all="['users:create', 'users:edit']"
 *
 * @example
 * // Negated permission check
 * v-rbac:not="'users:delete'"
 *
 * @example
 * // Default permission check
 * v-rbac="'users:create'"
 */
export function checkAccess(binding: DirectiveBinding, rbac: RBAC): boolean {
  const modifier =
    binding.arg || Object.keys(binding.modifiers)[0] || "permission";
  const value = binding.value;
  let hasAccess = false;

  switch (modifier) {
    case "role":
      // v-rbac:role="'admin'"
      hasAccess = typeof value === "string" ? rbac.hasRole(value) : false;
      break;

    case "any":
      // v-rbac:any="['users:create', 'users:edit']"
      if (Array.isArray(value)) {
        hasAccess = rbac.hasAnyPermission(value);
      } else if (typeof value === "string") {
        hasAccess = rbac.hasPermission(value);
      } else {
        hasAccess = false;
      }
      break;

    case "all":
      // v-rbac:all="['users:create', 'users:edit']"
      if (Array.isArray(value)) {
        hasAccess = rbac.hasAllPermissions(value);
      } else if (typeof value === "string") {
        hasAccess = rbac.hasPermission(value);
      } else {
        hasAccess = false;
      }
      break;

    case "not":
      // v-rbac:not="'users:delete'"
      if (typeof value === "string") {
        hasAccess = !rbac.hasPermission(value);
      } else if (Array.isArray(value)) {
        hasAccess = !rbac.hasAnyPermission(value);
      } else {
        hasAccess = false;
      }
      break;

    case "permission":
    default:
      // v-rbac="'users:create'"
      if (typeof value === "string") {
        hasAccess = rbac.hasPermission(value);
      } else if (Array.isArray(value)) {
        hasAccess = rbac.hasAllPermissions(value);
      } else {
        hasAccess = false;
      }
      break;
  }

  return hasAccess;
}
