import Redis from 'ioredis';

const redis = new Redis({
  host: 'localhost',
  port: 6379,
  password: '123456',
});

async function clearCache() {
  console.log('🧹 Clearing Redis cache with authentication...');
  try {
    await redis.flushall();
    console.log('✅ Cache cleared successfully!');
  } catch (err) {
    console.error('❌ Failed to clear cache:', err);
  } finally {
    redis.disconnect();
  }
}

clearCache();
