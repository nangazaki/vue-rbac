import type { Plugin, App } from "vue";
import type { RBACConfig } from "./types";
import { logger, LogLevel } from "./utils/logger";
import { createRBAC } from "./rbac";
import { createRBACDirective } from "./directive";

export * from './types';
export { LogLevel };

export interface VueRBACPluginOptions {
  config?: Partial<RBACConfig>;
  logLevel?: LogLevel;
}

export const VueRBAC: Plugin = {
  install(app: App, options: VueRBACPluginOptions = {}) {
    if (options.logLevel !== undefined) {
      logger.info(
        `Configurando nivel de log para: ${LogLevel[options.logLevel]}`
      );
    }

    const rbac = createRBAC(options.config || {});

    app.directive("rbac", createRBACDirective(rbac));

    app.config.globalProperties.$rbac = rbac;

    app.provide("rbac", rbac);

    if (rbac.options.autoInit) {
      rbac.init().catch((error) => {
        logger.error("Falha ao inicializar RBAC: ", error);
      });

      logger.info("Plugin Vue RBAC instalado com sucesso.");
    }
  },
};

export { createRBAC };

export default VueRBAC;
