---
title: Configuration
layout: doc
---

# Configuration

Configure **Vue RBAC** by passing a `config` object when installing the plugin or creating an instance. This page details every option in the `RBACConfig` interface, explains the available modes, and shows how to integrate with backends and custom storage.

## RBACConfig Options

```ts
interface RBACConfig {
  /**
   * Define your roles and their permissions.
   * Keyed by role name. Used in `static` and `hybrid` modes.
   */
  roles?: RolesConfig;

  /**
   * Loading strategy:
   * - `'static'` – roles come solely from `roles`.
   * - `'dynamic'` – roles are fetched from `apiEndpoint`.
   * - `'hybrid'` – load `roles` first, then merge with remote.
   */
  mode?: 'static' | 'dynamic' | 'hybrid';

  /**
   * URL to fetch roles/permissions in `dynamic` or `hybrid` modes.
   * Should return JSON matching `{ roles: RolesConfig }`.
   */
  apiEndpoint?: string;

  /**
   * Options passed to `fetch()` when loading dynamically.
   */
  fetchOptions?: RequestInit;

  /**
   * Transform the raw API response into `{ roles: RolesConfig }`.
   * Useful if your endpoint wraps roles in another envelope.
   */
  transformResponse?: (data: any) => { roles: RolesConfig };

  /**
   * Automatically call `rbac.init()` when the plugin installs.
   */
  autoInit?: boolean;

}
```

  <!-- /**
   * Persist user roles between page reloads. Provide a custom adapter
   * or use the built‑in `localStorageAdapter` or `cookieAdapter`.
   */
  storage?: StorageAdapter;

  /**
   * Key under which roles are saved in the chosen storage.
   */
  storageKey?: string; -->

> All options are optional—defaults are used when you omit them.


## Modes Explained

### 🔹 Static Mode

- **`mode: 'static'`**
- Roles and permissions come exclusively from the `roles` map.
- No network requests.
- Use when your access rules are fixed at build time.

```ts
createRBAC({
  mode: 'static',
  roles: {
    admin: { permissions: ['create', 'edit'] },
    user:  { permissions: ['read'] }
  }
})
```

### 🔹 Dynamic Mode

- **`mode: 'dynamic'`**
- Fetches roles from `apiEndpoint` each time you call `init()` or `fetchRolesAndPermissions()`.
- Does not use the `roles` map.
- Ideal for server‑driven, frequently changing permissions.

```ts
createRBAC({
  mode: 'dynamic',
  apiEndpoint: '/api/roles',
  transformResponse: resp => ({ roles: resp.data })
})
```

### 🔹 Hybrid Mode

- **`mode: 'hybrid'`**
- Loads static `roles` first, then merges or overrides with remote data.
- Offers sensible defaults plus server updates.

```ts
createRBAC({
  mode: 'hybrid',
  roles: { guest: { permissions: ['read'] } },
  apiEndpoint: '/api/roles'
})
```


## Integrating with Backends

1. **Expose an endpoint** (e.g. `/api/roles`) that returns:
   ```json
   { "roles": { "admin": { "permissions": ["read","write"] }, … } }
   ```
2. Use `transformResponse` if your JSON is nested:
   ```ts
   transformResponse(data) {
     return { roles: data.payload.roles };
   }
   ```
3. Secure your endpoint (e.g. JWT, session) so only authorized clients can fetch roles.


<!-- ## Custom Storage Adapters

By default, user roles reset on page reload. To persist them, pass a `storage` adapter:

- **LocalStorage** (built‑in):
  ```ts
  import { localStorageAdapter } from '@nangazaki/vue-rbac';
  createRBAC({ storage: localStorageAdapter });
  ```

- **Cookies** (built‑in):
  ```ts
  import { cookieAdapter } from '@nangazaki/vue-rbac';
  createRBAC({ storage: cookieAdapter, storageKey: 'my-roles' });
  ```

- **Custom**:
  ```ts
  const myAdapter = {
    get: key => /* ... */,
    set: (key,value) => /* ... */,
    remove: key => /* ... */
  };
  createRBAC({ storage: myAdapter });
  ``` -->


> Ready to see code in action? Check out the [Examples](/examples) page.

