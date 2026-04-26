import type { RolesConfig } from "./roles.types";
import type { StorageAdapter } from "./storage-adapter.types";

export enum CONFIG_MODE {
  STATIC = "static",
  DYNAMIC = "dynamic",
  HYBRID = "hybrid",
}

export type ConfigMode = (typeof CONFIG_MODE)[keyof typeof CONFIG_MODE];

export interface FetchOptions extends RequestInit {}

export interface RBACConfig {
  roles?: RolesConfig;
  mode?: ConfigMode;

  /**
   * @deprecated Since v1.0.6. Will be removed in v2.0.0.
   * Use `fetchRoles` instead.
   *
   * @example
   * // Before (deprecated):
   * apiEndpoint: '/api/roles'
   *
   * // After (recommended):
   * fetchRoles: async () => {
   *   const response = await fetch('/api/roles');
   *   return response.json();
   * }
   */
  apiEndpoint?: string;

  /**
   * @deprecated Since v1.0.6. Will be removed in v2.0.0.
   * Pass options directly inside `fetchRoles`.
   *
   * @example
   * // Before (deprecated):
   * fetchOptions: { headers: { Authorization: 'Bearer token' } }
   *
   * // After (recommended):
   * fetchRoles: async () => {
   *   const response = await fetch('/api/roles', {
   *     headers: { Authorization: 'Bearer token' }
   *   });
   *   return response.json();
   * }
   */
  fetchOptions?: FetchOptions;

  /**
   * @deprecated Since v1.0.6. Will be removed in v2.0.0.
   * Handle transformation inside `fetchRoles`.
   *
   * @example
   * // Before (deprecated):
   * transformResponse: (data) => ({ roles: data.roles })
   *
   * // After (recommended):
   * fetchRoles: async () => {
   *   const response = await fetch('/api/roles');
   *   const data = await response.json();
   *   return data.roles; // Transform here
   * }
   */
  transformResponse?: (data: any) => { roles: RolesConfig };

  /**
   * Function to fetch roles dynamically. This is the recommended approach
   * for loading roles from an API or any async source.
   *
   * @example
   * fetchRoles: async () => {
   *   const response = await fetch('/api/roles', {
   *     headers: { Authorization: `Bearer ${getToken()}` }
   *   });
   *   const data = await response.json();
   *   return data.roles;
   * }
   */
  fetchRoles?: (ctx?: any) => Promise<RolesConfig> | RolesConfig;
  autoInit?: boolean;
  storage: StorageAdapter;
  storageKey?: string;
  cacheTtl?: number;
  retry?: RetryConfig;
}

export interface RetryConfig {
  /** Total number of attempts (initial + retries). Default: 3 */
  attempts?: number;
  /** Base delay in ms between attempts. Default: 1000 */
  delay?: number;
  /** Exponential backoff multiplier applied per attempt. Default: 2 */
  backoff?: number;
}
