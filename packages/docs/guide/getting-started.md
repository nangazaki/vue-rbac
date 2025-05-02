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
    mode: CONFIG_MODE.STATIC,
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
- **dynamic:** Load roles and permissions from an external source.
- **hybrid:** Combine static and dynamic sources.

Learn more in the [API Reference](/guide/api-reference).