/**
 * Enhanced Logging Interceptor
 * Logs HTTP requests and responses with full details
 * Includes correlation ID, user context, sanitized bodies, and performance metrics
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Sanitizer } from '../utils/sanitizer.util';
import { LoggingConfigService } from '../config/logging.config';
import { getCorrelationId, setContextValue } from '../constants/async-context';

@Injectable()
export class EnhancedLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const ctx = context.switchToHttp();
    const request = ctx.getRequest<any>();
    const response = ctx.getResponse<any>();
    const startTime = Date.now();

    // Extract user info from request (if authenticated)
    const user = request.user;
    if (user) {
      setContextValue('userId', user.id);
      setContextValue('userRole', user.role);
    }

    // Log incoming request
    this.logRequest(request, user);

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - startTime;
        this.logResponse(request, response, duration, data);
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        this.logError(request, response, duration, error);
        throw error;
      }),
    );
  }

  /**
   * Log incoming HTTP request
   */
  private logRequest(request: any, user?: any): void {
    const config = LoggingConfigService.getConfig();
    const correlationId = getCorrelationId();

    // Extract request details (compatible with both Express and Fastify)
    const method = request.method;
    const url = request.url || request.raw?.url;
    const query = request.query;
    const headers = request.headers;
    const body = request.body;
    const ip = request.ip || request.raw?.ip || request.socket?.remoteAddress;

    // Build request log parts
    const parts: string[] = [];

    // First line: method and URL
    parts.push(`[${correlationId}] --> ${method} ${url}`);

    // User context
    if (user) {
      parts.push(
        `  userId: ${user.id}, role: ${user.role}, ip: ${ip}`,
      );
    } else {
      parts.push(`  ip: ${ip}`);
    }

    // Query parameters
    if (query && Object.keys(query).length > 0) {
      const sanitizedQuery = config.sanitizeSensitive
        ? Sanitizer.sanitize(query)
        : query;
      parts.push(`  query: ${JSON.stringify(sanitizedQuery)}`);
    }

    // Headers (sanitized)
    const relevantHeaders = this.extractRelevantHeaders(headers);
    const sanitizedHeaders = Sanitizer.sanitizeHeaders(relevantHeaders);
    parts.push(`  headers: ${JSON.stringify(sanitizedHeaders)}`);

    // Request body
    if (config.enableRequestBodyLogging && body && Object.keys(body).length > 0) {
      const sanitizedBody = config.sanitizeSensitive
        ? Sanitizer.sanitize(body)
        : body;
      const truncatedBody = Sanitizer.truncate(sanitizedBody, config.maxBodySize);
      parts.push(`  body: ${JSON.stringify(truncatedBody, null, 2)}`);
    }

    this.logger.log(parts.join('\n'));
  }

  /**
   * Log outgoing HTTP response
   */
  private logResponse(
    request: any,
    response: any,
    duration: number,
    data?: any,
  ): void {
    const config = LoggingConfigService.getConfig();
    const correlationId = getCorrelationId();
    const method = request.method;
    const url = request.url || request.raw?.url;
    const statusCode = response.statusCode || response.raw?.statusCode;

    // Build response log parts
    const parts: string[] = [];

    // First line: method, URL, status, duration
    parts.push(
      `[${correlationId}] <-- ${method} ${url} ${statusCode} - ${duration}ms`,
    );

    // Response body (only for errors or if explicitly enabled)
    if (config.enableResponseBodyLogging && data) {
      const sanitizedData = config.sanitizeSensitive
        ? Sanitizer.sanitize(data)
        : data;
      const truncatedData = Sanitizer.truncate(sanitizedData, config.maxBodySize);
      parts.push(`  response: ${JSON.stringify(truncatedData, null, 2)}`);
    }

    // Log level based on status code
    if (statusCode >= 500) {
      this.logger.error(parts.join('\n'));
    } else if (statusCode >= 400) {
      this.logger.warn(parts.join('\n'));
    } else {
      this.logger.log(parts.join('\n'));
    }
  }

  /**
   * Log error responses
   */
  private logError(
    request: any,
    response: any,
    duration: number,
    error: any,
  ): void {
    const config = LoggingConfigService.getConfig();
    const correlationId = getCorrelationId();
    const method = request.method;
    const url = request.url || request.raw?.url;
    const body = request.body;
    const statusCode = error.status || 500;

    // Build error log parts
    const parts: string[] = [];

    // First line: method, URL, status, duration
    parts.push(
      `[${correlationId}] <-- ${method} ${url} ${statusCode} - ${duration}ms`,
    );

    // Error details
    parts.push(`  error: ${error.message || 'Unknown error'}`);

    // Request context
    if (config.enableRequestBodyLogging && body) {
      const sanitizedBody = config.sanitizeSensitive
        ? Sanitizer.sanitize(body)
        : body;
      const truncatedBody = Sanitizer.truncate(sanitizedBody, config.maxBodySize);
      parts.push(`  requestBody: ${JSON.stringify(truncatedBody, null, 2)}`);
    }

    // Error stack (only in development)
    if (process.env.NODE_ENV === 'development' && error.stack) {
      parts.push(`  stack: ${error.stack}`);
    }

    this.logger.error(parts.join('\n'));
  }

  /**
   * Extract relevant headers for logging
   */
  private extractRelevantHeaders(headers: any): any {
    const relevant = [
      'content-type',
      'accept',
      'user-agent',
      'origin',
      'referer',
      'x-forwarded-for',
      'x-real-ip',
    ];

    const filtered: any = {};
    for (const key of relevant) {
      if (headers[key]) {
        filtered[key] = headers[key];
      }
    }

    return filtered;
  }
}
