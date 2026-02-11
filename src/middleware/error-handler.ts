import type { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

export function errorHandler(err: Error & { status?: number; code?: string }, _req: Request, res: Response, _next: NextFunction): void {
  const status = err.status ?? 500;

  logger.error({
    status,
    code: err.code,
    message: err.message,
    stack: err.stack,
  }, 'Unhandled error');

  res.status(status).json({
    error: status >= 500 ? 'Internal Server Error' : err.message,
    ...(err.code && { code: err.code }),
  });
}
