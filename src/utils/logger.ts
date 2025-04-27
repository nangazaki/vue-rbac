export enum LogLevel {
  DEBUG,
  INFO,
  WARN,
  ERROR,
  NONE,
}

export interface LoggerConfig {
  level: LogLevel;
  prefix: string;
}

export function createLogger(config: Partial<LoggerConfig> = {}) {
  const logConfig: LoggerConfig = {
    level: config.level ?? LogLevel.INFO,
    prefix: config.prefix ?? "[vue-rbac]",
  };

  return {
    debug(...args: any[]) {
      if (logConfig.level <= LogLevel.DEBUG) {
        console.debug(logConfig.prefix, ...args);
      }
    },

    info(...args: any[]) {
      if (logConfig.level <= LogLevel.INFO) {
        console.info(logConfig.prefix, ...args);
      }
    },

    warn(...args: any[]) {
      if (logConfig.level <= LogLevel.WARN) {
        console.warn(logConfig.prefix, ...args);
      }
    },

    error(...args: any[]) {
      if (logConfig.level <= LogLevel.ERROR) {
        console.error(logConfig.prefix, ...args);
      }
    },
  };
}

export const logger = createLogger();
