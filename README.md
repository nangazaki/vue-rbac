# Vue RBAC

Vue RBAC is a flexible and lightweight Role-Based Access Control (RBAC) library for Vue 3 applications. It supports static and dynamic role configurations, including role inheritance, directive-based permission control, caching with TTL, and storage persistence.

## 🚀 Features

- ✅ Role and permission system with inheritance
- 💡 Supports static, dynamic, and hybrid config modes
- 🔐 Custom directives (`v-rbac`, `v-rbac:role`, `v-rbac:any`, `v-rbac:all`, `v-rbac:not`)
- 🧩 `<RbacGuard>` component with fallback and loading slots
- 🧠 Programmatic access via `useRBAC()` composable
- 🗄 Built-in storage adapters (localStorage, sessionStorage, cookies)
- ⏱ TTL-based caching for dynamic configurations
- 🔁 Configurable retry with exponential backoff
- 📝 Configurable log levels

---

## 📦 Installation

```bash
pnpm add @nangazaki/vue-rbac
```

---

## 🔧 Usage

### Basic Setup (Static Configuration)

```ts
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import { VueRBAC, CONFIG_MODE } from '@nangazaki/vue-rbac'

const app = createApp(App)

app.use(VueRBAC, {
  config: {
    mode: CONFIG_MODE.STATIC,
    autoInit: true,
    roles: {
      admin: {
        permissions: ['users:create', 'posts:create'],
        inherits: ['editor'],
      },
      editor: {
        permissions: ['posts:edit'],
        inherits: ['viewer'],
      },
      viewer: {
        permissions: ['posts:view'],
      },
    },
  },
})

app.mount('#app')
```

### Dynamic Configuration (From API)

Use `fetchRoles` to load roles from any async source.

```ts
import { VueRBAC, CONFIG_MODE, localStorageAdapter } from '@nangazaki/vue-rbac'

app.use(VueRBAC, {
  config: {
    mode: CONFIG_MODE.DYNAMIC,
    autoInit: true,
    fetchRoles: async () => {
      const res = await fetch('/api/roles', {
        headers: { Authorization: `Bearer ${token}` },
      })
      return res.json()
    },
    storage: localStorageAdapter,
    cacheTtl: 30 * 60 * 1000, // 30 minutes
    retry: {
      attempts: 3,
      delay: 1000,
      backoff: 2,
    },
  },
})
```

### Hybrid Configuration

Combines static roles with dynamic ones fetched from an API.

```ts
app.use(VueRBAC, {
  config: {
    mode: CONFIG_MODE.HYBRID,
    autoInit: true,
    roles: {
      viewer: { permissions: ['posts:view'] },
    },
    fetchRoles: async () => {
      const res = await fetch('/api/roles')
      return res.json()
    },
  },
})
```

---

## 🗄 Storage Adapters

Built-in adapters to persist roles and permissions across sessions.

```ts
import { localStorageAdapter, sessionStorageAdapter, cookieStorageAdapter } from '@nangazaki/vue-rbac'

app.use(VueRBAC, {
  config: {
    mode: CONFIG_MODE.DYNAMIC,
    storage: localStorageAdapter,
    storageKey: 'my-app:rbac', // optional, default: "vue-rbac@v1"
  },
})
```

### Available Adapters

| Adapter | Persistence | Notes |
|---|---|---|
| `localStorageAdapter` | Survives restart | Not cleared on tab close |
| `sessionStorageAdapter` | Tab session only | Default adapter |
| `cookieStorageAdapter` | Configurable (7d default) | Server-accessible, Secure + SameSite=Strict |

You can also create a custom adapter by implementing the `StorageAdapter` interface:

```ts
interface StorageAdapter {
  get<T>(key: string): T | null
  set<T>(key: string, value: T): void
  remove(key: string): void
}
```

---

## ⏱ Cache & Retry

### TTL Cache

Dynamic and hybrid modes cache the fetched config to avoid redundant requests.

```ts
{
  cacheTtl: 60 * 60 * 1000, // 1 hour (default)
  // cacheTtl: 0              // disables caching
}
```

To manually invalidate the cache:

```ts
const { invalidateCache } = useRBAC()
invalidateCache() // next access will re-fetch
```

### Retry with Exponential Backoff

```ts
{
  retry: {
    attempts: 3,  // total attempts (default: 3)
    delay: 1000,  // base delay in ms (default: 1000)
    backoff: 2,   // multiplier per retry (default: 2)
  }
}
// Retry delays: 1s → 2s → 4s
```

---

## ✨ Directives

### `v-rbac`
Checks if the user has a specific permission:

```vue
<button v-rbac="'users:create'">Add User</button>
```

### `v-rbac:role`
Checks if the user has a specific role:

```vue
<div v-rbac:role="'admin'">Admin Panel</div>
```

### `v-rbac:any`
Shows the element if the user has **at least one** of the given permissions:

```vue
<div v-rbac:any="['posts:edit', 'posts:create']">Editor or Admin</div>
```

### `v-rbac:all`
Shows the element only if the user has **all** of the given permissions:

```vue
<div v-rbac:all="['posts:edit', 'posts:publish']">Full Editor Access</div>
```

### `v-rbac:not`
Hides the element if the user has the given role or permission:

```vue
<div v-rbac:not="'users:delete'">Visible to non-admins</div>
<div v-rbac:not="['admin', 'moderator']">Visible to regular users</div>
```

---

## 🧩 RbacGuard Component

A component-based alternative to directives, with support for fallback and loading states.

```vue
<template>
  <RbacGuard permission="users:create">
    <button>Add User</button>

    <template #fallback>
      <span>Access denied</span>
    </template>

    <template #loading>
      <span>Loading...</span>
    </template>
  </RbacGuard>
</template>
```

### Props

| Prop | Type | Description |
|---|---|---|
| `role` | `string \| string[]` | Check for a specific role |
| `permission` | `string \| string[]` | Check all permissions (AND) |
| `any` | `string \| string[]` | Check any permission (OR) |
| `all` | `string \| string[]` | Check all permissions (AND) |
| `not` | `string \| string[]` | Deny if user has role or permission |

> Only one prop should be used at a time. If multiple are provided, only the first is evaluated.

### Slots

| Slot | Description |
|---|---|
| `default` | Rendered when access is granted |
| `fallback` | Rendered when access is denied |
| `loading` | Rendered while roles are loading |

---

## 🧠 useRBAC Composable

```ts
import { useRBAC } from '@nangazaki/vue-rbac'

const {
  state,
  setUserRoles,
  hasRole,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  invalidateCache,
} = useRBAC()

// Reactive state
state.isLoading       // boolean
state.isInitialized   // boolean
state.userRoles       // RoleKey[]
state.roles           // RolesConfig

// Methods
setUserRoles('admin')
setUserRoles(['admin', 'editor'])

hasRole('admin')                               // boolean
hasPermission('posts:create')                  // boolean
hasAnyPermission(['posts:edit', 'posts:view']) // boolean
hasAllPermissions(['posts:edit', 'posts:publish']) // boolean

invalidateCache() // clears cache, next fetch will re-fetch
```

---

## 📄 Types & IntelliSense

```ts
// shims-vue.d.ts
import type { RBAC } from '@nangazaki/vue-rbac'

declare module 'vue' {
  interface ComponentCustomProperties {
    $rbac: RBAC
  }
}
```

---

## 🔌 Nuxt Integration

```ts
// plugins/vue-rbac.client.ts
import { defineNuxtPlugin } from '#app'
import { VueRBAC, CONFIG_MODE } from '@nangazaki/vue-rbac'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueRBAC, {
    config: {
      mode: CONFIG_MODE.DYNAMIC,
      autoInit: true,
      fetchRoles: async () => {
        const res = await fetch('/api/roles')
        return res.json()
      },
    },
  })
})
```

---

## 📝 Logging

```ts
import { VueRBAC, LogLevel } from '@nangazaki/vue-rbac'

app.use(VueRBAC, {
  logLevel: LogLevel.WARN, // DEBUG | INFO | WARN | ERROR | NONE
  config: { ... },
})
```

---

## 🧪 Example

```vue
<template>
  <div>
    <!-- Directive-based -->
    <button v-rbac="'users:create'">Add User</button>
    <div v-rbac:role="'admin'">Admin Panel</div>
    <div v-rbac:any="['posts:edit', 'posts:create']">Post Management</div>
    <div v-rbac:all="['posts:edit', 'posts:publish']">Full Editor</div>
    <div v-rbac:not="'admin'">Non-admin content</div>

    <!-- Component-based -->
    <RbacGuard permission="users:create">
      <CreateUserForm />
      <template #fallback><p>No access.</p></template>
    </RbacGuard>
  </div>
</template>
```

---

## 🛠 Development

```bash
pnpm install
pnpm dev
```

---

## 📃 License

MIT License © 2026 [@nangazaki](https://github.com/nangazaki)
