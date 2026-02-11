import 'dotenv/config';

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optional(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const env = {
  NODE_ENV: optional('NODE_ENV', 'development'),
  GATEWAY_PORT: Number(optional('GATEWAY_PORT', '4001')),
  LOG_LEVEL: optional('LOG_LEVEL', 'info'),

  // Upstream service URLs
  BACKEND_URL: required('BACKEND_URL'),

  // CORS
  ALLOWED_ORIGINS: optional('ALLOWED_ORIGINS', '*'),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: Number(optional('RATE_LIMIT_WINDOW_MS', '600000')),
  RATE_LIMIT_MAX: Number(optional('RATE_LIMIT_MAX', '200')),

  // Proxy
  PROXY_TIMEOUT: Number(optional('PROXY_TIMEOUT', '30000')),
} as const;
