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
   * (Deprecated) API Endpoit to fetch roles
   * ⚠️ Use only for compatibility on olders versions
   */
  apiEndpoint?: string;

  /**
   * (Deprecated) Options to fetch when `apiEndpoint` is used
   */
  fetchOptions?: FetchOptions;

  /**
   * (Deprecated) transform the response
   */
  transformResponse?: (data: any) => { roles: RolesConfig };

  fetchRoles?: (ctx?: any) => Promise<RolesConfig> | RolesConfig;
  autoInit?: boolean;
  storage: StorageAdapter;
  storageKey?: string;
}
