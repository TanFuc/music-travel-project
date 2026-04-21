export class Sanitizer {
  private static readonly SENSITIVE_PATTERNS = [
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
    /card[_-]?number/i,
    /cardnumber/i,
    /cvv/i,
    /cvc/i,
    /ccv/i,
    /credit[_-]?card/i,
    /debit[_-]?card/i,
    /ssn/i,
    /social[_-]?security/i,
    /id[_-]?card/i,
    /passport/i,
    /license/i,
  ];
  private static readonly PARTIAL_MASK_PATTERNS = [/phone/i, /mobile/i, /email/i];
  private static readonly REDACTED = '[REDACTED]';
  private static readonly MAX_DEPTH = 10;
  static sanitize(data: any, depth: number = 0): any {
    if (depth > this.MAX_DEPTH) {
      return '[MAX_DEPTH_EXCEEDED]';
    }
    if (data === null || data === undefined) {
      return data;
    }
    if (typeof data !== 'object') {
      return data;
    }
    if (Array.isArray(data)) {
      return data.map((item) => this.sanitize(item, depth + 1));
    }
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (this.isSensitiveKey(key)) {
        sanitized[key] = this.REDACTED;
      } else if (this.isPartialMaskKey(key)) {
        sanitized[key] = this.partialMask(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitize(value, depth + 1);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
  private static isSensitiveKey(key: string): boolean {
    return this.SENSITIVE_PATTERNS.some((pattern) => pattern.test(key));
  }
  private static isPartialMaskKey(key: string): boolean {
    return this.PARTIAL_MASK_PATTERNS.some((pattern) => pattern.test(key));
  }
  private static partialMask(value: any): any {
    if (typeof value !== 'string') {
      return value;
    }
    if (value.includes('@')) {
      const [local, domain] = value.split('@');
      if (local.length <= 2) {
        return `${local}***@${domain}`;
      }
      return `${local.substring(0, 2)}***@${domain}`;
    }
    if (value.length >= 8) {
      const lastFour = value.slice(-4);
      const masked = value.slice(0, -4).replace(/./g, '*');
      return `${masked}${lastFour}`;
    }
    if (value.length > 2) {
      return `${value[0]}***${value[value.length - 1]}`;
    }
    return '***';
  }
  static sanitizeHeaders(headers: any): any {
    if (!headers || typeof headers !== 'object') {
      return headers;
    }
    const sanitized: any = {};
    for (const [key, value] of Object.entries(headers)) {
      const lowerKey = key.toLowerCase();
      if (lowerKey === 'authorization' || lowerKey === 'cookie') {
        sanitized[key] = this.REDACTED;
      } else if (this.isSensitiveKey(key)) {
        sanitized[key] = this.REDACTED;
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
  static truncate(data: any, maxLength: number = 10000): any {
    const str = typeof data === 'string' ? data : JSON.stringify(data);
    if (str.length <= maxLength) {
      return data;
    }
    const truncated = str.substring(0, maxLength);
    return `${truncated}... [TRUNCATED ${str.length - maxLength} chars]`;
  }
}
