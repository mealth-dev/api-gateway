import { env } from '@/config/env';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel = (env.LOG_LEVEL as LogLevel) || 'info';

function shouldLog(level: LogLevel): boolean {
  return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[currentLevel];
}

function formatMessage(level: LogLevel, context: Record<string, unknown>, message?: string): string {
  const entry: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    level,
    ...context,
  };
  if (message) {
    entry.msg = message;
  }
  return JSON.stringify(entry);
}

function log(level: LogLevel, contextOrMessage: Record<string, unknown> | string, message?: string): void {
  if (!shouldLog(level)) return;

  const context = typeof contextOrMessage === 'string' ? {} : contextOrMessage;
  const msg = typeof contextOrMessage === 'string' ? contextOrMessage : message;

  const formatted = formatMessage(level, context, msg);

  switch (level) {
    case 'error':
      console.error(formatted);
      break;
    case 'warn':
      console.warn(formatted);
      break;
    default:
      console.log(formatted);
  }
}

export const logger = {
  debug: (contextOrMessage: Record<string, unknown> | string, message?: string) =>
    log('debug', contextOrMessage, message),
  info: (contextOrMessage: Record<string, unknown> | string, message?: string) =>
    log('info', contextOrMessage, message),
  warn: (contextOrMessage: Record<string, unknown> | string, message?: string) =>
    log('warn', contextOrMessage, message),
  error: (contextOrMessage: Record<string, unknown> | string, message?: string) =>
    log('error', contextOrMessage, message),
};
