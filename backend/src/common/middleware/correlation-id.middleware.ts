import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { asyncContext, RequestContext } from '../constants/async-context';
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void): void {
    const correlationId =
      (req.headers['x-correlation-id'] as string) ||
      (req.headers['x-request-id'] as string) ||
      randomUUID();
    const context: RequestContext = {
      correlationId,
      requestId: correlationId,
      method: req.method,
      url: req.url || req.raw?.url,
      ip: req.ip || req.raw?.ip || req.socket?.remoteAddress,
      userAgent: req.headers['user-agent'],
      startTime: Date.now(),
    };
    asyncContext.run(context, () => {
      if (res.setHeader) {
        res.setHeader('X-Correlation-ID', correlationId);
      } else if (res.header) {
        res.header('X-Correlation-ID', correlationId);
      }
      next();
    });
  }
}
