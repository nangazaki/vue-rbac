---
title: Why Vue RBAC?
layout: doc
---

# Why Vue RBAC?

As Vue.js applications grow in complexity, managing **who can access what** becomes essential. Whether you're building a dashboard, CMS, or any multi-user platform, controlling access to routes, components, or features is critical for **security**, **user experience**, and **maintainability**.

## The Importance of Role-Based Access Control (RBAC)

Role‑Based Access Control (RBAC) assigns permissions to users based on their **roles**, instead of managing individual permissions per user. This approach helps you:

- ✅ **Reduce complexity** in access logic  
- ✅ **Centralize** permission management  
- ✅ **Prevent** bugs and unauthorized access  
- ✅ **Scale** safely as your app grows 

Example roles might include: `admin`, `editor`, `viewer`, `guest`, etc. Each role defines what actions a user can perform or which UI sections they can see.

## Why Use Vue RBAC?

**Vue RBAC** is a **lightweight**, **fully‑typed**, and **dependency‑free** RBAC toolkit built specifically for Vue 3. It lets you control access **declaratively** (via directives) or **programmatically** (via composables) with minimal setup.

### Built for Vue 3

- Leverages the Composition API  
- Seamlessly integrates via `v-rbac` directive and `useRBAC()` composable  

```vue
<!-- Conditionally render elements -->
<button v-rbac="'create:user'">Create User</button>
```

Or via logic:

```ts
import { useRBAC } from '@nangazaki/vue-rbac'

const { hasPermission } = useRBAC()
if (hasPermission('delete:post')) {
  // user can delete
}
```

## Configurable & Scalable

You can define roles statically in your config or load them dynamically from an API — perfect for apps with server-defined permissions.

## Optional Persistence

Need to persist user roles across reloads? Vue RBAC supports LocalStorage, Cookies, and custom adapters for maximum flexibility.

## Type-Safe & Testable

Written in TypeScript with a clean API, Vue RBAC helps you avoid errors and ensures better DX and testability.


## When Should You Use Vue RBAC?

Use Vue RBAC if your app:
- Has multiple user types with different access levels
- Requires secure UI logic based on permissions
- Needs centralized and maintainable access control
- Fetches roles and permissions from the backend
- Uses Vue 3 with Composition API

With Vue RBAC, access control is no longer scattered—it becomes a consistent, secure, and declarative part of your architecture.

Ready to secure your app? [Start here →](/getting-started)