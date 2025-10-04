---
# Page frontmatter
title: Getting Started
layout: doc
---

# Getting Started

Vue RBAC is a lightweight, flexible, and fully typed Role-Based Access Control (RBAC) library for Vue 3 applications.

## Installation

You can install the library using your preferred package manager:

```bash
npm install @nangazaki/vue-rbac
# or
pnpm add @nangazaki/vue-rbac
# or
yarn add @nangazaki/vue-rbac
```

## Basic Usage

### Setup

First, create an RBAC instance and provide it to your Vue application:

```ts
// main.ts
import { createApp } from "vue";
import App from "./App.vue";

import { CONFIG_MODE, VueRBAC } from "@nangazaki/vue-rbac";

const app = createApp(App);

app.use(VueRBAC, {
  config: {
    mode: CONFIG_MODE.STATIC, // can be STATIC, DYNAMIC, or HYBRID
    autoInit: true,
    roles: {
      admin: {
        permissions: [
          "create:posts",
          "delete:posts",
          "read:posts",
          "update:posts",
        ],
      },
      // others roles
    },
    
    // Optional: persist user roles using a storage adapter
    storage: localStorageAdapter,

    // Optional: fetch roles dynamically from any source
    fetchRoles: async () => ({
      editor: { permissions: ["edit:posts"] },
      moderator: { permissions: ["delete:comments"] }
    }),
  }
});

app.mount("#app");
```

### Use the Directive

You can use the v-rbac directive to conditionally render elements based on permissions:

```vue
<template>
  <button v-rbac="'create'">Create Post</button>
</template>
```

You can also use advanced modifiers:

- v-rbac:any="['edit:posts','delete:posts']" – render if user has any of the listed permissions
- v-rbac:all="['read:posts','update:posts']" – render if user has all permissions
- v-rbac:not="'delete:posts'" – render if user does not have the permission
- v-rbac:role="'admin'" – render if user has the role

### Use the Composable

Access roles and permissions programmatically using the useRBAC() composable:

```vue
<script setup lang="ts">
import { useRBAC } from '@nangazaki/vue-rbac'

const { hasPermission } = useRBAC()

if (hasPermission('delete')) {
  console.log('User can delete')
}
</script>
```

## Configuration Modes

Vue RBAC supports three configuration modes:

- **static:** Define all roles and permissions locally.
- **dynamic:** Load roles and permissions from an external source or via the **fetchRoles** function.
- **hybrid:** Combine static and dynamic sources.

## Storage Adapters

Persist user roles with one of the built-in adapters:

```ts
import { localStorageAdapter, sessionStorageAdapter, cookieStorageAdapter } from '@nangazaki/vue-rbac'

app.use(VueRBAC, {
  config: {
    storage: localStorageAdapter, // or sessionStorageAdapter / cookieStorageAdapter
  }
})
```

Learn more in the [API Reference](/guide/api-reference).