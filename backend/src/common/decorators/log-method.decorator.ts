/**
 * LogMethod Decorator
 * Automatically logs method entry, exit, duration, and errors
 * Supports parameter and result logging with sanitization
 */

import { EnhancedLoggerService } from '../services/enhanced-logger.service';
import { LoggingConfigService } from '../config/logging.config';

export interface LogMethodOptions {
  logParams?: boolean; // Log method parameters
  logResult?: boolean; // Log method result
  sanitize?: boolean; // Sanitize parameters and result
}

/**
 * Method decorator for automatic logging
 *
 * @example
 * @LogMethod({ logParams: true, sanitize: true })
 * async create(userId: number, dto: CreateDto) {
 *   // method implementation
 * }
 */
export function LogMethod(options: LogMethodOptions = {}): MethodDecorator {
  const { logParams = false, logResult = false, sanitize = true } = options;

  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    const className = target.constructor.name;
    const methodName = String(propertyKey);

    descriptor.value = async function (...args: any[]) {
      // Check if method logging is enabled
      const config = LoggingConfigService.getConfig();
      if (!config.enableMethodLogging) {
        return originalMethod.apply(this, args);
      }

      // Get logger instance from the class
      const logger: EnhancedLoggerService =
        this.logger || new EnhancedLoggerService(className);

      // Start timer
      const timer = logger.startTimer();

      try {
        // Log method entry
        if (logParams) {
          logger.logMethodEntry(`${className}.${methodName}`, args);
        } else {
          logger.logMethodEntry(`${className}.${methodName}`);
        }

        // Execute original method
        const result = await originalMethod.apply(this, args);

        // Log method exit
        const duration = timer.end();
        if (logResult) {
          logger.logMethodExit(`${className}.${methodName}`, duration, result);
        } else {
          logger.logMethodExit(`${className}.${methodName}`, duration);
        }

        return result;
      } catch (error) {
        // Log method error
        if (logParams) {
          logger.logMethodError(`${className}.${methodName}`, error, args);
        } else {
          logger.logMethodError(`${className}.${methodName}`, error);
        }

        // Re-throw error
        throw error;
      }
    };

    return descriptor;
  };
}
