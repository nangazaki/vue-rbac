import { CONFIG_MODE, type RBACConfig } from "@/types";

export const defaultConfig: RBACConfig = {
  roles: {},
  mode: CONFIG_MODE.STATIC,
  apiEndpoint: "/api/rbac/permissions",
  fetchOptions: {},
  transformResponse: (data) => data,
  autoInit: true,
};
