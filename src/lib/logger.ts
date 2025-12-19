type LogLevel = "debug" | "info" | "warn" | "error";

const shouldLog = (level: LogLevel): boolean => {
  if (process.env.NODE_ENV === "development") {
    return true;
  }
  return level === "warn" || level === "error";
};

const createLogger = (level: LogLevel) => {
  return (...args: unknown[]) => {
    if (shouldLog(level)) {
      console[level === "debug" ? "log" : level](...args);
    }
  };
};

export const logger = {
  debug: createLogger("debug"),
  info: createLogger("info"),
  warn: createLogger("warn"),
  error: createLogger("error"),
};
