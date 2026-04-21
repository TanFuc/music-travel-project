export interface LoggingConfig {
  logLevel: string;
  enableMethodLogging: boolean;
  enableRequestBodyLogging: boolean;
  enableResponseBodyLogging: boolean;
  enableDbQueryLogging: boolean;
  sanitizeSensitive: boolean;
  maxBodySize: number;
  slowQueryThreshold: number;
  customSensitivePatterns: string[];
}
export class LoggingConfigService {
  private static instance: LoggingConfig;
  static getConfig(): LoggingConfig {
    if (!this.instance) {
      this.instance = this.loadConfig();
    }
    return this.instance;
  }
  private static loadConfig(): LoggingConfig {
    const nodeEnv = process.env.NODE_ENV || 'development';
    const isDevelopment = nodeEnv === 'development';
    return {
      logLevel: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'warn'),
      enableMethodLogging: this.parseBoolean(process.env.ENABLE_METHOD_LOGGING, isDevelopment),
      enableRequestBodyLogging: this.parseBoolean(
        process.env.ENABLE_REQUEST_BODY_LOGGING,
        isDevelopment,
      ),
      enableResponseBodyLogging: this.parseBoolean(process.env.ENABLE_RESPONSE_BODY_LOGGING, false),
      enableDbQueryLogging: this.parseBoolean(process.env.ENABLE_DB_QUERY_LOGGING, isDevelopment),
      sanitizeSensitive: this.parseBoolean(process.env.LOG_SANITIZE_SENSITIVE, true),
      maxBodySize: parseInt(process.env.LOG_MAX_BODY_SIZE || '10000', 10),
      slowQueryThreshold: parseInt(process.env.LOG_SLOW_QUERY_THRESHOLD_MS || '100', 10),
      customSensitivePatterns: process.env.LOG_CUSTOM_SENSITIVE_PATTERNS
        ? process.env.LOG_CUSTOM_SENSITIVE_PATTERNS.split(',')
        : [],
    };
  }
  private static parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
    if (value === undefined) {
      return defaultValue;
    }
    const lowerValue = value.toLowerCase();
    return lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes';
  }
  static shouldLog(level: 'debug' | 'log' | 'warn' | 'error'): boolean {
    const config = this.getConfig();
    const levels = ['debug', 'log', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(config.logLevel);
    const requestedLevelIndex = levels.indexOf(level);
    return requestedLevelIndex >= currentLevelIndex;
  }
}
