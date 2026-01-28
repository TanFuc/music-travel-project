import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => {
  // Check if Upstash REST API is configured (preferred for production)
  const upstashRestUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashRestToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashRestUrl && upstashRestToken) {
    return {
      type: 'upstash-rest' as const,
      url: upstashRestUrl,
      token: upstashRestToken,
    };
  }

  // Fallback to ioredis for local development
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    type: 'ioredis' as const,
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    tls: isProduction ? { rejectUnauthorized: false } : undefined,
  };
});
