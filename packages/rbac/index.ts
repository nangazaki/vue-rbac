import type { App, Plugin } from "vue";
import { createRBACDirective } from "./directive";
import { VueRBACPluginOptions } from "./types/index";
import { logger, LogLevel } from "./utils/logger";
import { createRBAC } from "./rbac";
import { initializeLogger } from "./utils/initialize-logger";

export * from "./types";
export { LogLevel };

export const VueRBAC: Plugin = {
  install(app: App, options: VueRBACPluginOptions = {}) {
    initializeLogger(options);

    const rbac = createRBAC(options.config || {});

    app.directive("rbac", createRBACDirective(rbac));

    app.config.globalProperties.$rbac = rbac;

    app.provide("rbac", rbac);

    if (rbac.options.autoInit) {
      rbac.init().catch((error) => {
        logger.error("Failed to initialize RBAC: ", error);
      });

      logger.info("Vue RBAC plugin installed successfully.");
    }
  },
};

export { createRBAC };

export default VueRBAC;
