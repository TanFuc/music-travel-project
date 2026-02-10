/**
 * Logging Configuration
 * Environment-based logging settings with feature flags
 */

export interface LoggingConfig {
  // Log level: 'debug' | 'log' | 'warn' | 'error' | 'verbose'
  logLevel: string;

  // Feature flags
  enableMethodLogging: boolean;
  enableRequestBodyLogging: boolean;
  enableResponseBodyLogging: boolean;
  enableDbQueryLogging: boolean;
  sanitizeSensitive: boolean;

  // Performance settings
  maxBodySize: number; // Max characters to log for request/response bodies
  slowQueryThreshold: number; // Milliseconds - queries slower than this are logged as warnings

  // Sensitive field patterns (can be extended via environment)
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
      // Log level - default to 'debug' in dev, 'warn' in production
      logLevel: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'warn'),

      // Feature flags - enabled by default in development
      enableMethodLogging: this.parseBoolean(
        process.env.ENABLE_METHOD_LOGGING,
        isDevelopment,
      ),
      enableRequestBodyLogging: this.parseBoolean(
        process.env.ENABLE_REQUEST_BODY_LOGGING,
        isDevelopment,
      ),
      enableResponseBodyLogging: this.parseBoolean(
        process.env.ENABLE_RESPONSE_BODY_LOGGING,
        false, // Disabled by default even in dev (can be verbose)
      ),
      enableDbQueryLogging: this.parseBoolean(
        process.env.ENABLE_DB_QUERY_LOGGING,
        isDevelopment,
      ),
      sanitizeSensitive: this.parseBoolean(
        process.env.LOG_SANITIZE_SENSITIVE,
        true, // Always enabled by default for security
      ),

      // Performance settings
      maxBodySize: parseInt(process.env.LOG_MAX_BODY_SIZE || '10000', 10),
      slowQueryThreshold: parseInt(
        process.env.LOG_SLOW_QUERY_THRESHOLD_MS || '100',
        10,
      ),

      // Custom sensitive patterns (comma-separated)
      customSensitivePatterns: process.env.LOG_CUSTOM_SENSITIVE_PATTERNS
        ? process.env.LOG_CUSTOM_SENSITIVE_PATTERNS.split(',')
        : [],
    };
  }

  private static parseBoolean(
    value: string | undefined,
    defaultValue: boolean,
  ): boolean {
    if (value === undefined) {
      return defaultValue;
    }

    const lowerValue = value.toLowerCase();
    return lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes';
  }

  /**
   * Check if a specific log level should be logged based on current config
   */
  static shouldLog(level: 'debug' | 'log' | 'warn' | 'error'): boolean {
    const config = this.getConfig();
    const levels = ['debug', 'log', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(config.logLevel);
    const requestedLevelIndex = levels.indexOf(level);

    return requestedLevelIndex >= currentLevelIndex;
  }
}
