import { CONFIG_MODE, type RBACConfig } from "@/types";

/**
 * Default configuration object for RBAC (Role-Based Access Control)
 * @interface RBACConfig
 * @property {Record<string, Role>} roles - Object containing role definitions
 * @property {CONFIG_MODE} mode - Operation mode of RBAC (STATIC or API)
 * @property {string} apiEndpoint - API endpoint for fetching permissions
 * @property {RequestInit} fetchOptions - Options for fetch API when making HTTP requests
 * @property {(data: any) => any} transformResponse - Function to transform API response data
 * @property {boolean} autoInit - Flag to enable/disable automatic initialization
 */
export const defaultConfig: RBACConfig = {
  roles: {},
  mode: CONFIG_MODE.STATIC,
  apiEndpoint: "/api/rbac/permissions",
  fetchOptions: {},
  transformResponse: (data) => data,
  autoInit: true,
};
