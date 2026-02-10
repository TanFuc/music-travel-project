/**
 * Enhanced Logger Service
 * Wraps NestJS Logger with structured logging, correlation IDs, and sanitization
 */

import { Injectable, LoggerService, Logger, Optional } from '@nestjs/common';
import { Sanitizer } from '../utils/sanitizer.util';
import { LoggingConfigService } from '../config/logging.config';
import { getCorrelationId, getRequestContext } from '../constants/async-context';

export interface LogMetadata {
  [key: string]: any;
}

export interface TimerResult {
  duration: number;
  end: () => number;
}

@Injectable()
export class EnhancedLoggerService implements LoggerService {
  private readonly logger: Logger;
  private readonly context: string;

  constructor(@Optional() context: string = 'Application') {
    this.logger = new Logger(context);
    this.context = context;
  }

  /**
   * Create a child logger with a specific context
   */
  createChild(context: string): EnhancedLoggerService {
    return new EnhancedLoggerService(context);
  }

  /**
   * Log a message with optional metadata
   */
  log(message: string, metadata?: LogMetadata): void {
    if (!LoggingConfigService.shouldLog('log')) {
      return;
    }
    this.logger.log(this.formatMessage(message, metadata));
  }

  /**
   * Log an error with optional metadata
   */
  error(message: string, trace?: string, metadata?: LogMetadata): void {
    if (!LoggingConfigService.shouldLog('error')) {
      return;
    }
    this.logger.error(this.formatMessage(message, metadata), trace);
  }

  /**
   * Log a warning with optional metadata
   */
  warn(message: string, metadata?: LogMetadata): void {
    if (!LoggingConfigService.shouldLog('warn')) {
      return;
    }
    this.logger.warn(this.formatMessage(message, metadata));
  }

  /**
   * Log a debug message with optional metadata
   */
  debug(message: string, metadata?: LogMetadata): void {
    if (!LoggingConfigService.shouldLog('debug')) {
      return;
    }
    this.logger.debug(this.formatMessage(message, metadata));
  }

  /**
   * Log a verbose message with optional metadata
   */
  verbose(message: string, metadata?: LogMetadata): void {
    this.logger.verbose(this.formatMessage(message, metadata));
  }

  /**
   * Start a timer for performance measurement
   */
  startTimer(): TimerResult {
    const startTime = Date.now();

    return {
      duration: 0,
      end: (): number => {
        const duration = Date.now() - startTime;
        return duration;
      },
    };
  }

  /**
   * Log method entry
   */
  logMethodEntry(methodName: string, params?: any): void {
    if (!LoggingConfigService.getConfig().enableMethodLogging) {
      return;
    }

    const sanitizedParams = this.sanitizeIfNeeded(params);
    this.debug(`[${methodName}] --> Entry`, {
      params: sanitizedParams,
    });
  }

  /**
   * Log method exit
   */
  logMethodExit(methodName: string, duration: number, result?: any): void {
    if (!LoggingConfigService.getConfig().enableMethodLogging) {
      return;
    }

    this.debug(`[${methodName}] <-- Exit - duration: ${duration}ms`, {
      duration,
      hasResult: result !== undefined,
    });
  }

  /**
   * Log method error
   */
  logMethodError(methodName: string, error: any, params?: any): void {
    const sanitizedParams = this.sanitizeIfNeeded(params);

    this.error(
      `[${methodName}] Method execution failed`,
      error?.stack,
      {
        error: error?.message || String(error),
        params: sanitizedParams,
      },
    );
  }

  /**
   * Format message with correlation ID and metadata
   */
  private formatMessage(message: string, metadata?: LogMetadata): string {
    const correlationId = getCorrelationId();
    const parts: string[] = [];

    // Add correlation ID if available
    if (correlationId) {
      parts.push(`[${correlationId}]`);
    }

    // Add message
    parts.push(message);

    // Add metadata if provided
    if (metadata && Object.keys(metadata).length > 0) {
      const sanitized = this.sanitizeIfNeeded(metadata);
      const truncated = Sanitizer.truncate(
        sanitized,
        LoggingConfigService.getConfig().maxBodySize,
      );
      parts.push(`\n  ${JSON.stringify(truncated, null, 2)}`);
    }

    return parts.join(' ');
  }

  /**
   * Sanitize data if sanitization is enabled
   */
  private sanitizeIfNeeded(data: any): any {
    if (!data) {
      return data;
    }

    const config = LoggingConfigService.getConfig();
    if (config.sanitizeSensitive) {
      return Sanitizer.sanitize(data);
    }

    return data;
  }

  /**
   * Get current request context for logging
   */
  getRequestContext(): any {
    const context = getRequestContext();
    if (!context) {
      return {};
    }

    return {
      correlationId: context.correlationId,
      userId: context.userId,
      userRole: context.userRole,
      ip: context.ip,
      method: context.method,
      url: context.url,
    };
  }

  /**
   * Log with full request context
   */
  logWithContext(message: string, metadata?: LogMetadata): void {
    const context = this.getRequestContext();
    this.log(message, { ...context, ...metadata });
  }
}
