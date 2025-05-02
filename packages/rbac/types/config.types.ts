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
  apiEndpoint?: string;
  fetchOptions?: FetchOptions;
  transformResponse?: (data: any) => { roles: RolesConfig };
  autoInit?: boolean;
  // storage: StorageAdapter;
  // storageKey?: string;
}
