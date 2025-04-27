import type { App, Plugin } from "vue";
import { createRBACDirective } from "./directive";
import { createRBAC } from "./rbac";
import { VueRBACPluginOptions } from "./types/index";
import { logger, LogLevel } from "./utils/logger";

export * from "./types";
export { LogLevel };

export const VueRBAC: Plugin = {
  install(app: App, options: VueRBACPluginOptions = {}) {
    if (options.logLevel !== undefined) {
      logger.info(
        `Setting log level to: ${LogLevel[options.logLevel]}`
      );
    }

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
