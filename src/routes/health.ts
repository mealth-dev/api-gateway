import { Router } from 'express';
import axios from 'axios';
import { env } from '@/config/env';

const router = Router();

router.get('/health', async (_req, res) => {
  const gateway = { status: 'healthy' };

  let backend: { status: string; latency?: string; error?: string } = { status: 'unknown' };

  try {
    const start = Date.now();
    const response = await axios.get(`${env.BACKEND_URL}/health`, { timeout: 5000 });
    const latency = Date.now() - start;
    backend = {
      status: response.status === 200 ? 'healthy' : 'degraded',
      latency: `${latency}ms`,
    };
  } catch (err) {
    backend = {
      status: 'unhealthy',
      error: err instanceof Error ? err.message : 'Connection failed',
    };
  }

  const overallHealthy = backend.status === 'healthy';

  res.status(overallHealthy ? 200 : 503).json({
    status: overallHealthy ? 'healthy' : 'degraded',
    gateway,
    services: {
      'mealth-express-backend': backend,
    },
  });
});

export default router;
