type Level = "info" | "warn" | "error" | "debug";

function log(level: Level, message: string, context?: Record<string, unknown>) {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` ${JSON.stringify(context)}` : "";
  console[level === "debug" ? "log" : level](
    `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`
  );
}

export const logger = {
  info: (msg: string, ctx?: Record<string, unknown>) => log("info", msg, ctx),
  warn: (msg: string, ctx?: Record<string, unknown>) => log("warn", msg, ctx),
  error: (msg: string, ctx?: Record<string, unknown>) => log("error", msg, ctx),
  debug: (msg: string, ctx?: Record<string, unknown>) => log("debug", msg, ctx),
};
