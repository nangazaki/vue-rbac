import { reactive } from "vue";
import type { RBACState, RolesConfig } from "./types";

export function createStore(initialRoles: RolesConfig = {}) {
  return reactive<RBACState>({
    roles: initialRoles,
    userRoles: [],
    isLoading: false,
    isInitialized: false
  })
}