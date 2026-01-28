import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => {
  const host = process.env.REDIS_HOST || 'localhost';
  const port = parseInt(process.env.REDIS_PORT || '6379', 10);
  const password = process.env.REDIS_PASSWORD || undefined;
  const isProduction = process.env.NODE_ENV === 'production';

  // Check if Upstash REST API is configured (preferred for production)
  const upstashRestUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashRestToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashRestUrl && upstashRestToken) {
    return {
      type: 'upstash-rest' as const,
      url: upstashRestUrl,
      token: upstashRestToken,
      host,
      port,
      password,
      tls: isProduction ? { rejectUnauthorized: false } : undefined,
    };
  }

  // Fallback to ioredis for local development
  return {
    type: 'ioredis' as const,
    host,
    port,
    password,
    tls: isProduction ? { rejectUnauthorized: false } : undefined,
  };
});
