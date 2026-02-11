import type { Application } from 'express';
import healthRoutes from '@/routes/health';
import { backendProxy } from '@/proxy/backend-proxy';

export function registerRoutes(app: Application): void {
  // Gateway health check (handled locally, not proxied)
  app.use(healthRoutes);

  // Proxy all /v1/* requests to mealth-express-backend
  app.use('/v1', backendProxy);
}
