---
title: Examples
layout: doc
---

# Examples

Practical recipes for using **Vue RBAC** in your Vue 3 app.

## 1. Basic Setup

```ts
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import { VueRBAC, CONFIG_MODE } from '@nangazaki/vue-rbac'

const app = createApp(App)

app.use(VueRBAC, {
  config: {
    mode: CONFIG_MODE.STATIC,
    roles: {
      admin: { permissions: ['create', 'edit', 'delete'] },
      user:  { permissions: ['read'] }
    }
  }
})

app.mount('#app')
```

## 2. Directive‑Based Control

### Single permission

```vue
<button v-rbac="'create'">Create</button>
```

### Any of multiple permissions

```vue
<div v-rbac:any="['edit', 'delete']">
  You can edit or delete
</div>
```

### All permissions required

```vue
<div v-rbac:all="['read', 'write']">
  Read & Write Access
</div>
```

### Negation (not)

```vue
<div v-rbac:not="'delete'">
  You cannot delete
</div>
```

## 3. Composition API with `useRBAC`

```ts
<script setup lang="ts">
import { useRBAC } from '@nangazaki/vue-rbac'

const rbac = useRBAC()
rbac.setUserRoles('editor')

const canPublish = rbac.hasPermission('publish')
</script>

<template>
  <button v-if="canPublish">Publish</button>
</template>
```

## 4. Dynamic Roles from API (⚠️ Deprecated)

```ts
const rbac = createRBAC({
  mode: CONFIG_MODE.DYNAMIC,
  apiEndpoint: '/api/roles',
  transformResponse(data) {
    return { roles: data.roles }
  }
})

await rbac.init()
```

## 5. Hybrid Mode (⚠️ Deprecated)

Combine static defaults with dynamic overrides:

```ts
const rbac = createRBAC({
  mode: CONFIG_MODE.HYBRID,
  roles: { viewer: { permissions: ['read'] } },
  apiEndpoint: '/api/user-roles',
  transformResponse(data) {
    return { roles: data.roles }
  }
})

await rbac.init()
```

## 6. Agnostic Dynamic/Hybrid Mode

You can fetch roles from any source, not only a REST API:

```ts
  const rbac = createRBAC({
  mode: CONFIG_MODE.HYBRID,
  roles: { guest: { permissions: ['read'] } },
  fetchRoles: async () => ({
    admin: { permissions: ['create', 'edit'] }
  }),
  storage: localStorageAdapter
})

await rbac.init()

```

## 7. Route Guards with Vue Router

```ts
// router.ts
import { createRouter, createWebHistory } from 'vue-router'
import { useRBAC } from '@nangazaki/vue-rbac'

const routes = [
  { path: '/', component: Home },
  { path: '/admin', component: Admin, meta: { requiresRole: 'admin' } }
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach((to, from, next) => {
  const rbac = useRBAC()
  const role = to.meta.requiresRole as string
  if (role && !rbac.hasRole(role)) {
    return next('/')
  }
  next()
})

export default router
```

---

📚 See the [API Reference](/guide/api-reference) for full details on methods and types.

