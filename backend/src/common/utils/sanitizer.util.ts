/**
 * Sanitizer Utility
 * Removes sensitive data from logs to prevent security leaks
 */

export class Sanitizer {
  private static readonly SENSITIVE_PATTERNS = [
    // Authentication & Authorization
    /password/i,
    /passwd/i,
    /pwd/i,
    /secret/i,
    /token/i,
    /apikey/i,
    /api[_-]?key/i,
    /authorization/i,
    /auth/i,
    /bearer/i,
    /cookie/i,
    /session/i,
    /sessionid/i,
    /otp/i,
    /pin/i,

    // Payment Information
    /card[_-]?number/i,
    /cardnumber/i,
    /cvv/i,
    /cvc/i,
    /ccv/i,
    /credit[_-]?card/i,
    /debit[_-]?card/i,

    // Personal Information
    /ssn/i,
    /social[_-]?security/i,
    /id[_-]?card/i,
    /passport/i,
    /license/i,
  ];

  private static readonly PARTIAL_MASK_PATTERNS = [
    /phone/i,
    /mobile/i,
    /email/i,
  ];

  private static readonly REDACTED = '[REDACTED]';
  private static readonly MAX_DEPTH = 10;

  /**
   * Sanitize data by removing or masking sensitive fields
   */
  static sanitize(data: any, depth: number = 0): any {
    // Prevent infinite recursion
    if (depth > this.MAX_DEPTH) {
      return '[MAX_DEPTH_EXCEEDED]';
    }

    // Handle null/undefined
    if (data === null || data === undefined) {
      return data;
    }

    // Handle primitives
    if (typeof data !== 'object') {
      return data;
    }

    // Handle arrays
    if (Array.isArray(data)) {
      return data.map(item => this.sanitize(item, depth + 1));
    }

    // Handle objects
    const sanitized: any = {};

    for (const [key, value] of Object.entries(data)) {
      // Check if key matches sensitive pattern
      if (this.isSensitiveKey(key)) {
        sanitized[key] = this.REDACTED;
      }
      // Check if key matches partial mask pattern
      else if (this.isPartialMaskKey(key)) {
        sanitized[key] = this.partialMask(value);
      }
      // Recursively sanitize nested objects
      else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitize(value, depth + 1);
      }
      // Keep primitive values
      else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Check if a key name matches sensitive patterns
   */
  private static isSensitiveKey(key: string): boolean {
    return this.SENSITIVE_PATTERNS.some(pattern => pattern.test(key));
  }

  /**
   * Check if a key name matches partial mask patterns
   */
  private static isPartialMaskKey(key: string): boolean {
    return this.PARTIAL_MASK_PATTERNS.some(pattern => pattern.test(key));
  }

  /**
   * Partially mask a value (show first/last characters)
   */
  private static partialMask(value: any): any {
    if (typeof value !== 'string') {
      return value;
    }

    // Email: show first 2 chars and domain
    if (value.includes('@')) {
      const [local, domain] = value.split('@');
      if (local.length <= 2) {
        return `${local}***@${domain}`;
      }
      return `${local.substring(0, 2)}***@${domain}`;
    }

    // Phone: show last 4 digits
    if (value.length >= 8) {
      const lastFour = value.slice(-4);
      const masked = value.slice(0, -4).replace(/./g, '*');
      return `${masked}${lastFour}`;
    }

    // Short strings: just mask middle
    if (value.length > 2) {
      return `${value[0]}***${value[value.length - 1]}`;
    }

    return '***';
  }

  /**
   * Sanitize request/response headers
   */
  static sanitizeHeaders(headers: any): any {
    if (!headers || typeof headers !== 'object') {
      return headers;
    }

    const sanitized: any = {};

    for (const [key, value] of Object.entries(headers)) {
      const lowerKey = key.toLowerCase();

      // Always redact authorization headers
      if (lowerKey === 'authorization' || lowerKey === 'cookie') {
        sanitized[key] = this.REDACTED;
      }
      // Sanitize other sensitive headers
      else if (this.isSensitiveKey(key)) {
        sanitized[key] = this.REDACTED;
      }
      else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Truncate large data to prevent log overflow
   */
  static truncate(data: any, maxLength: number = 10000): any {
    const str = typeof data === 'string' ? data : JSON.stringify(data);

    if (str.length <= maxLength) {
      return data;
    }

    const truncated = str.substring(0, maxLength);
    return `${truncated}... [TRUNCATED ${str.length - maxLength} chars]`;
  }
}
