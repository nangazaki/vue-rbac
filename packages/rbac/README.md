# Vue RBAC

Vue RBAC is a flexible and lightweight Role-Based Access Control (RBAC) library for Vue 3 applications. It supports static and dynamic role configurations, including role inheritance and directive-based permission control.

## 🚀 Features

- ✅ Role and permission system with inheritance
- 💡 Supports static, dynamic, and hybrid config modes
- 🔐 Custom directives (`v-rbac`, `v-rbac:role`, `v-rbac:any`)
- 🧠 Programmatic access to permissions and roles
- 🌐 API integration for dynamic role loading
- 🪝 Built-in Vue plugin and easy setup

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
import { createApp } from 'vue';
import App from './App.vue';
import { VueRBAC, CONFIG_MODE } from '@nangazaki/vue-rbac';

const app = createApp(App);

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
      },
      viewer: {
        permissions: ['posts:view'],
      },
    },
  },
});

app.mount('#app');
```

### Dynamic Configuration (From API)

```ts
app.use(VueRBAC, {
  config: {
    mode: CONFIG_MODE.DYNAMIC,
    apiEndpoint: 'https://api.example.com/roles',
    autoInit: true,
    fetchOptions: {
      method: "GET",
      headers: {
        Authorization: "Bearer your-token",
      },
    },
    transformResponse(data) {
      return {
        roles: data.roles,
      };
    },
  },
});
```

---

## ✨ Directives

### `v-rbac`
Check for a single permission:

```vue
<button v-rbac="'users:create'">Add User</button>
```

### `v-rbac:role`
Check for a specific role:

```vue
<div v-rbac:role="'admin'">Admin Panel</div>
```

### `v-rbac:any`
Check for any permission in a list:

```vue
<div v-rbac:any="['posts:edit', 'posts:create']">
  Editor or Admin Access
</div>
```

---

## 🧠 Programmatic Access

```ts
import { inject } from 'vue';
import type { RBAC } from '@nangazaki/vue-rbac';

const rbac = inject<RBAC>('rbac');

if (rbac?.hasPermission('posts:create')) {
  console.log('User can create posts');
}
```

---

## 🔌 Nuxt Integration

### Add Plugin to `plugins/vue-rbac.client.ts`

```ts
import { defineNuxtPlugin } from '#app';
import { VueRBAC, CONFIG_MODE } from '@nangazaki/vue-rbac';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueRBAC, {
    config: {
      mode: CONFIG_MODE.DYNAMIC,
      apiEndpoint: '/api/roles',
      autoInit: true,
      transformResponse: (data) => ({ roles: data.roles }),
    },
  });
});
```

---

## 📄 Types & IntelliSense

For full TypeScript support, ensure your app includes a declaration:

```ts
// shims-vue.d.ts
import type { RBAC } from '@nangazaki/vue-rbac';

declare module 'vue' {
  interface ComponentCustomProperties {
    $rbac: RBAC;
  }
}
```

---

## 🧪 Example

```vue
<template>
  <div>
    <button v-rbac="'users:create'">Add User</button>
    <div v-rbac:role="'admin'">Admin Panel</div>
    <div v-rbac:any="['posts:edit', 'posts:create']">Post Management</div>
  </div>
</template>
```

---

## 🛠 Development

```bash
npm install
npm run dev
```

---

## 📃 License

MIT License © 2025 [@nangazaki](https://github.com/nangazaki)

