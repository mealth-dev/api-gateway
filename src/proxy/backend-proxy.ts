import { createProxyMiddleware } from 'http-proxy-middleware';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';

export const backendProxy = createProxyMiddleware({
  target: env.BACKEND_URL,
  changeOrigin: true,
  timeout: env.PROXY_TIMEOUT,
  proxyTimeout: env.PROXY_TIMEOUT,

  on: {
    proxyReq(proxyReq, req) {
      const requestId = (req as Express.Request & { requestId?: string }).requestId;
      if (requestId) {
        proxyReq.setHeader('X-Request-Id', requestId);
      }

      proxyReq.setHeader('X-Forwarded-For', req.socket.remoteAddress ?? '');
      proxyReq.setHeader('X-Forwarded-Host', req.headers.host ?? '');
      proxyReq.setHeader('X-Forwarded-Proto', (req as unknown as { protocol?: string }).protocol ?? 'http');

      logger.debug({
        requestId,
        target: env.BACKEND_URL,
        method: req.method,
        path: req.url,
      }, 'proxying request to backend');
    },

    proxyRes(proxyRes, req) {
      const requestId = (req as Express.Request & { requestId?: string }).requestId;
      logger.debug({
        requestId,
        status: proxyRes.statusCode,
        method: req.method,
        path: req.url,
      }, 'received response from backend');
    },

    error(err, req, res) {
      const requestId = (req as Express.Request & { requestId?: string }).requestId;
      logger.error({
        requestId,
        message: err.message,
        code: (err as NodeJS.ErrnoException).code,
        method: req.method,
        path: req.url,
      }, 'proxy error');

      if ('writeHead' in res && typeof res.writeHead === 'function') {
        const httpRes = res as import('http').ServerResponse;
        const isTimeout = (err as NodeJS.ErrnoException).code === 'ECONNRESET' || err.message.includes('timeout');
        const status = isTimeout ? 504 : 502;
        const message = isTimeout ? 'Gateway Timeout' : 'Bad Gateway';

        if (!httpRes.headersSent) {
          httpRes.writeHead(status, { 'Content-Type': 'application/json' });
          httpRes.end(JSON.stringify({ error: message }));
        }
      }
    },
  },
});
