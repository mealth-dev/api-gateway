import express, { type Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from '@/config/env';
import { errorHandler } from '@/middleware/error-handler';
import { rateLimiter } from '@/middleware/rate-limiter';
import { requestLogger } from '@/middleware/request-logger';
import { registerRoutes } from '@/routes';

export const createApp = (): Application => {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS
  const origins = env.ALLOWED_ORIGINS === '*' ? '*' : env.ALLOWED_ORIGINS.split(',').map((o) => o.trim());
  app.use(
    cors({
      origin: origins,
      credentials: true,
    }),
  );

  // Request logging & tracing
  app.use(requestLogger);

  // Rate limiting
  app.use(rateLimiter);

  // Parse JSON only for gateway-local routes (health, etc.)
  // Proxied routes get raw body forwarded by http-proxy-middleware
  app.use('/health', express.json());

  // Register all routes (health + proxy)
  registerRoutes(app);

  // 404 for anything that didn't match
  app.use((_req, res) => {
    res.status(404).json({ error: 'Not Found' });
  });

  // Global error handler
  app.use(errorHandler);

  return app;
};
