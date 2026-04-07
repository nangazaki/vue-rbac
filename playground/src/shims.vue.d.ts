import type { RBAC } from '@nangazaki/vue-rbac';

declare module 'vue' {
  interface ComponentCustomProperties {
    $rbac: RBAC;
  }
}