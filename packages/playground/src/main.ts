import { createApp } from "vue";
import App from "./App.vue";
import "./style.css";

import {
  CONFIG_MODE,
  VueRBAC,
  type VueRBACPluginOptions,
} from "@nangazaki/vue-rbac";

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
app.mount("#app");
