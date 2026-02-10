/**
 * Correlation ID Middleware
 * Generates or extracts correlation ID for each request
 * Stores in AsyncLocalStorage for access throughout request lifecycle
 * Compatible with both Express and Fastify
 */

import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  asyncContext,
  RequestContext,
} from '../constants/async-context';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void): void {
    // Extract or generate correlation ID
    const correlationId =
      (req.headers['x-correlation-id'] as string) ||
      (req.headers['x-request-id'] as string) ||
      randomUUID();

    // Create request context
    const context: RequestContext = {
      correlationId,
      requestId: correlationId,
      method: req.method,
      url: req.url || req.raw?.url,
      ip: req.ip || req.raw?.ip || req.socket?.remoteAddress,
      userAgent: req.headers['user-agent'],
      startTime: Date.now(),
    };

    // Store context in AsyncLocalStorage
    asyncContext.run(context, () => {
      // Add correlation ID to response headers
      if (res.setHeader) {
        // Express
        res.setHeader('X-Correlation-ID', correlationId);
      } else if (res.header) {
        // Fastify
        res.header('X-Correlation-ID', correlationId);
      }

      // Continue with request
      next();
    });
  }
}
