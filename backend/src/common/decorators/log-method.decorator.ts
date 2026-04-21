import { EnhancedLoggerService } from '../services/enhanced-logger.service';
import { LoggingConfigService } from '../config/logging.config';
export interface LogMethodOptions {
  logParams?: boolean;
  logResult?: boolean;
  sanitize?: boolean;
}
export function LogMethod(options: LogMethodOptions = {}): MethodDecorator {
  const { logParams = false, logResult = false, sanitize = true } = options;
  return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const className = target.constructor.name;
    const methodName = String(propertyKey);
    descriptor.value = async function (...args: any[]) {
      const config = LoggingConfigService.getConfig();
      if (!config.enableMethodLogging) {
        return originalMethod.apply(this, args);
      }
      const logger: EnhancedLoggerService = this.logger || new EnhancedLoggerService(className);
      const timer = logger.startTimer();
      try {
        if (logParams) {
          logger.logMethodEntry(`${className}.${methodName}`, args);
        } else {
          logger.logMethodEntry(`${className}.${methodName}`);
        }
        const result = await originalMethod.apply(this, args);
        const duration = timer.end();
        if (logResult) {
          logger.logMethodExit(`${className}.${methodName}`, duration, result);
        } else {
          logger.logMethodExit(`${className}.${methodName}`, duration);
        }
        return result;
      } catch (error) {
        if (logParams) {
          logger.logMethodError(`${className}.${methodName}`, error, args);
        } else {
          logger.logMethodError(`${className}.${methodName}`, error);
        }
        throw error;
      }
    };
    return descriptor;
  };
}
