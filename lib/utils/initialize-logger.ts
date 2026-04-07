import type { VueRBACPluginOptions } from "@/types";
import { logger, LogLevel } from "./logger";

export function initializeLogger(options: VueRBACPluginOptions) {
  if (options.logLevel !== undefined) {
    logger.info(`Setting log level to: ${LogLevel[options.logLevel as keyof typeof LogLevel]}`);
  }
}