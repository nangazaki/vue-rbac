import { createApp } from "vue";
import App from "./App.vue";
import "../index.css";

import {
  CONFIG_MODE,
  VueRBAC,
  type VueRBACPluginOptions,
} from "@nangazaki/vue-rbac";
import { router } from "./routes";

const app = createApp(App);

const rbacConfig: VueRBACPluginOptions = {
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
      editor: {
        permissions: ["update:posts"],
        inherits: ["viewer"],
      },
      viewer: {
        permissions: ["read:posts"],
      },
    },
  },
};

app.use(VueRBAC, rbacConfig);
app.use(router)
app.mount("#app");
