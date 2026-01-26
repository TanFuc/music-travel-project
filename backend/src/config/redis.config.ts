import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    return {
      host: process.env.UPSTASH_REDIS_HOST || process.env.REDIS_HOST,
      port: parseInt(process.env.UPSTASH_REDIS_PORT || process.env.REDIS_PORT || '6379', 10),
      password: process.env.UPSTASH_REDIS_PASSWORD || process.env.REDIS_PASSWORD,
      tls: { rejectUnauthorized: false }, // Upstash requires TLS
    };
  }

  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    tls: undefined,
  };
});
