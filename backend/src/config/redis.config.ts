import { registerAs } from '@nestjs/config';
export default registerAs('redis', () => {
  const redisUrl = process.env.REDIS_URL;
  const host = process.env.REDIS_HOST || 'localhost';
  const port = parseInt(process.env.REDIS_PORT || '6379', 10);
  const password = process.env.REDIS_PASSWORD || undefined;
  const isProduction = process.env.NODE_ENV === 'production';
  const upstashRestUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashRestToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  const explicitEnabled = process.env.REDIS_ENABLED ?? process.env.CACHE_ENABLED;
  const hasExplicitRedisConfig = Boolean(
    redisUrl || process.env.REDIS_HOST || upstashRestUrl || upstashRestToken,
  );
  const enabled =
    explicitEnabled !== undefined ? explicitEnabled === 'true' : hasExplicitRedisConfig;
  const tls =
    process.env.REDIS_TLS === 'true' || redisUrl?.startsWith('rediss://')
      ? { rejectUnauthorized: false }
      : undefined;
  if (upstashRestUrl && upstashRestToken) {
    return {
      type: 'upstash-rest' as const,
      enabled,
      url: upstashRestUrl,
      token: upstashRestToken,
      host,
      port,
      password,
      tls,
    };
  }
  return {
    type: 'ioredis' as const,
    enabled,
    url: redisUrl,
    host,
    port,
    password,
    tls,
  };
});
