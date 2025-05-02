---
title: API Reference
layout: doc
---

# API Reference

This page documents all exported functions, objects, directives and types provided by **@nangazaki/vue‑rbac**.


## Plugin

### `VueRBAC`  
A Vue 3 plugin object. Install with:

```ts
import { createApp } from 'vue'
import { VueRBAC } from '@nangazaki/vue-rbac'

const app = createApp(App)
app.use(VueRBAC, {
  config: { /* see RBACConfig below */ },
  logLevel: LogLevel.INFO
})
```

| Option         | Type                          | Default    | Description                           |
| -------------- | ----------------------------- | ---------- | ------------------------------------- |
| `config`       | `Partial<RBACConfig>`         | `{}`       | RBAC configuration (modes, roles…)    |
| `logLevel`     | `LogLevel`                    | `LogLevel.WARN` | Controls internal logging verbosity |


## createRBAC()

Create a standalone RBAC instance (without plugin):

```ts
import { createRBAC } from '@nangazaki/vue-rbac'

const rbac = createRBAC({
  mode: 'static',
  roles: { /* … */ },
  storage: localStorageAdapter,
})

await rbac.init()
```

Signature

```ts
function createRBAC(config?: Partial<RBACConfig>): RBAC
```

- **Returns**: RBAC instance with methods described below.


## RBAC Instance

An object implementing the RBAC interface.

### Proprieties

| Name         | Type           | Description                         |
| ------------ | -------------- | ----------------------------------- |
| `options`    | `Required<RBACConfig>` | Resolved configuration         |
| `state`      | `RBACState`    | Reactive roles & userRoles state     |

### Methods

| Method                                | Signature                                        | Description                                  |
| ------------------------------------- | ------------------------------------------------ | -------------------------------------------- |
| `init()`                              | `(): Promise<RolesConfig>`                       | Load roles & permissions (static/dynamic).   |
| `fetchRolesAndPermissions()`          | `(): Promise<RolesConfig>`                       | Force dynamic reload from API.               |
| `setUserRoles(roles: RoleKey \| RoleKey[])` | `void`                                      | Assign one or more roles to the current user.|
| `hasPermission(permission: Permission)`     | `(permission: string) => boolean`            | Check a single permission.                   |
| `hasAnyPermission(permissions: Permission[])` | `(permissions: string[]) => boolean`      | True if user has at least one.               |
| `hasAllPermissions(permissions: Permission[])` | `(permissions: string[]) => boolean`      | True if user has every permission.           |
| `hasRole(role: RoleKey)`              | `(role: string) => boolean`                     | Check if user has a specific role.           |


## Types

Import all types from the root:

```ts
import {
  RBACConfig,
  RBACState,
  RoleKey,
  Permission,
  RolesConfig,
  ConfigMode,
  VueRBACPluginOptions,
  StorageAdapter
} from '@nangazaki/vue-rbac'
```

#### RBACConfig

| Property            | Type                                   | Default       | Description                                          |
| ------------------- | -------------------------------------- | ------------- | ---------------------------------------------------- |
| `roles?`            | `RolesConfig`                          | `{}`          | Static roles & permissions map                       |
| `mode?`             | `"static" \| "dynamic" \| "hybrid"`    | `"static"`    | Load strategy                                        |
| `apiEndpoint?`      | `string`                               | `undefined`   | URL for dynamic fetch                                |
| `fetchOptions?`     | `RequestInit`                          | `{}`          | Options for `fetch` when in dynamic mode             |
| `transformResponse?`| `(data: any) => { roles: RolesConfig }` | identity     | Map API response to `{ roles }`                      |
| `autoInit?`         | `boolean`                              | `false`       | Call `init()` automatically on plugin install        |
| `storage?`          | `StorageAdapter`                       | `undefined`   | Persist user roles                                    |
| `storageKey?`       | `string`                               | `"vue-rbac"`  | Key under which roles are stored in storage          |


#### RolesConfig

```ts
type RolesConfig = Record<RoleKey, { permissions: Permission[]; inherits?: RoleKey[] }>
```


#### RBACState

```ts
interface RBACState {
  roles: RolesConfig
  userRoles: RoleKey[]
  isLoading: boolean
  isInitialized: boolean
}
```


#### VueRBACPluginOptions

```ts
interface VueRBACPluginOptions {
  config?: Partial<RBACConfig>
  logLevel?: LogLevel
}
```

## Directive: `v-rbac`

Control element visibility based on roles/permissions

| Modifier   | Value type        | Behavior                                             |
| ---------- | ----------------- | ---------------------------------------------------- |
| _(none)_   | `string \| string[]` | Checks permission(s) (all)                       |
| `role`     | `string`          | Checks user role                                    |
| `any`      | `string[] \| string` | True if user has _any_ of the permissions         |
| `all`      | `string[] \| string` | True if user has _all_ of the permissions         |
| `not`      | `string[] \| string` | Negates the check (no permission or role)         |

#### Usage

```vue
<button v-rbac="'posts:create'">Create</button>
<div v-rbac:role="'admin'">Admin Panel</div>
<div v-rbac:any="['edit','delete']">Edit/Delete</div>
<div v-rbac:all="['read','write']">Read & Write</div>
<div v-rbac:not="'delete'">Cannot Delete</div>
```

## Composable: `useRBAC()`

Retrieve the RBAC instance in `<script setup>` or Composition API:

```ts
import { useRBAC } from '@nangazaki/vue-rbac'

const { setUserRoles, hasPermission } = useRBAC()

setUserRoles('editor')
if (hasPermission('edit')) { … }
```

**Returns**: the full RBAC instance.


## Symbols

`RBAC_SYMBOL`

```ts
const RBAC_SYMBOL = Symbol.for('vue-rbac')
```

Use this key if you need to manually inject:

```ts
import { inject } from 'vue'
import { RBAC_SYMBOL } from '@nangazaki/vue-rbac'

const rbac = inject(RBAC_SYMBOL)
```

That completes the API surface for **@nangazaki/vue‑rbac**. If you need further examples, see the [Examples](/examples) page or the [Configuration guide](/guide/configuration).