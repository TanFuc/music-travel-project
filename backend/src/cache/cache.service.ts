import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { Redis as UpstashRedis } from '@upstash/redis';
import { CACHE_TTL } from './cache-keys.constant';

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private client: Redis;
  private isConnected = false;

  constructor(private readonly configService: ConfigService) { }

  async onModuleInit() {
    const host = this.configService.get<string>('redis.host', 'localhost');
    const port = this.configService.get<number>('redis.port', 6379);
    const password = this.configService.get<string>('redis.password');
    const tls = this.configService.get('redis.tls');

    this.client = new Redis({
      host,
      port,
      password: password || undefined,
      tls,
      retryStrategy: (times) => {
        if (times > 3) {
          this.logger.warn('Redis connection failed, running without cache');
          return null;
        }
        return Math.min(times * 100, 3000);
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
    });

    this.client.on('connect', () => {
      this.isConnected = true;
      this.logger.log('Redis connected successfully');
    });

    this.client.on('error', (err) => {
      this.isConnected = false;
      this.logger.error(`Redis error: ${err.message}`);
    });

    this.client.on('close', () => {
      this.isConnected = false;
      this.logger.warn('Redis connection closed');
    });

    try {
      await this.client.connect();
    } catch (error) {
      this.logger.warn('Failed to connect to Redis, running without cache');
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
    }
  }

  /**
   * Check if Redis is available
   */
  isAvailable(): boolean {
    return this.isConnected;
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected) return null;

    try {
      const value = await this.client.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error(`Cache get error for key ${key}: ${error}`);
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   */
  async set<T>(key: string, value: T, ttl: number = CACHE_TTL.STANDARD): Promise<boolean> {
    if (!this.isConnected) return false;

    try {
      await this.client.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      this.logger.error(`Cache set error for key ${key}: ${error}`);
      return false;
    }
  }

  /**
   * Set value only if key doesn't exist (for locks)
   */
  async setNx<T>(key: string, value: T, ttl: number): Promise<boolean> {
    if (!this.isConnected) return false;

    try {
      const result = await this.client.set(key, JSON.stringify(value), 'EX', ttl, 'NX');
      return result === 'OK';
    } catch (error) {
      this.logger.error(`Cache setNx error for key ${key}: ${error}`);
      return false;
    }
  }

  /**
   * Delete a key
   */
  async del(key: string): Promise<boolean> {
    if (!this.isConnected) return false;

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      this.logger.error(`Cache del error for key ${key}: ${error}`);
      return false;
    }
  }

  /**
   * Delete multiple keys
   */
  async delMany(keys: string[]): Promise<boolean> {
    if (!this.isConnected || keys.length === 0) return false;

    try {
      await this.client.del(...keys);
      return true;
    } catch (error) {
      this.logger.error(`Cache delMany error: ${error}`);
      return false;
    }
  }

  /**
   * Delete keys matching a pattern
   */
  async delPattern(pattern: string): Promise<number> {
    if (!this.isConnected) return 0;

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) return 0;
      await this.client.del(...keys);
      return keys.length;
    } catch (error) {
      this.logger.error(`Cache delPattern error for pattern ${pattern}: ${error}`);
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    if (!this.isConnected) return false;

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Cache exists error for key ${key}: ${error}`);
      return false;
    }
  }

  /**
   * Get remaining TTL for a key
   */
  async ttl(key: string): Promise<number> {
    if (!this.isConnected) return -1;

    try {
      return await this.client.ttl(key);
    } catch (error) {
      this.logger.error(`Cache ttl error for key ${key}: ${error}`);
      return -1;
    }
  }

  /**
   * Extend TTL for a key
   */
  async expire(key: string, ttl: number): Promise<boolean> {
    if (!this.isConnected) return false;

    try {
      await this.client.expire(key, ttl);
      return true;
    } catch (error) {
      this.logger.error(`Cache expire error for key ${key}: ${error}`);
      return false;
    }
  }

  /**
   * Increment a counter
   */
  async incr(key: string, ttl?: number): Promise<number> {
    if (!this.isConnected) return 0;

    try {
      const value = await this.client.incr(key);
      if (ttl && value === 1) {
        await this.client.expire(key, ttl);
      }
      return value;
    } catch (error) {
      this.logger.error(`Cache incr error for key ${key}: ${error}`);
      return 0;
    }
  }

  /**
   * Decrement a counter
   */
  async decr(key: string): Promise<number> {
    if (!this.isConnected) return 0;

    try {
      return await this.client.decr(key);
    } catch (error) {
      this.logger.error(`Cache decr error for key ${key}: ${error}`);
      return 0;
    }
  }

  /**
   * Get or set pattern - fetch from cache or execute getter and cache result
   */
  async getOrSet<T>(
    key: string,
    getter: () => Promise<T>,
    ttl: number = CACHE_TTL.STANDARD,
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Execute getter and cache result
    const value = await getter();
    await this.set(key, value, ttl);
    return value;
  }

  /**
   * Hash operations - set field
   */
  async hset(key: string, field: string, value: unknown): Promise<boolean> {
    if (!this.isConnected) return false;

    try {
      await this.client.hset(key, field, JSON.stringify(value));
      return true;
    } catch (error) {
      this.logger.error(`Cache hset error for key ${key}: ${error}`);
      return false;
    }
  }

  /**
   * Hash operations - get field
   */
  async hget<T>(key: string, field: string): Promise<T | null> {
    if (!this.isConnected) return null;

    try {
      const value = await this.client.hget(key, field);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error(`Cache hget error for key ${key}: ${error}`);
      return null;
    }
  }

  /**
   * Hash operations - get all fields
   */
  async hgetall<T>(key: string): Promise<Record<string, T> | null> {
    if (!this.isConnected) return null;

    try {
      const data = await this.client.hgetall(key);
      if (!data || Object.keys(data).length === 0) return null;

      const result: Record<string, T> = {};
      for (const [field, value] of Object.entries(data)) {
        result[field] = JSON.parse(value) as T;
      }
      return result;
    } catch (error) {
      this.logger.error(`Cache hgetall error for key ${key}: ${error}`);
      return null;
    }
  }

  /**
   * Hash operations - delete field
   */
  async hdel(key: string, ...fields: string[]): Promise<boolean> {
    if (!this.isConnected) return false;

    try {
      await this.client.hdel(key, ...fields);
      return true;
    } catch (error) {
      this.logger.error(`Cache hdel error for key ${key}: ${error}`);
      return false;
    }
  }

  /**
   * List operations - push to left
   */
  async lpush(key: string, ...values: unknown[]): Promise<number> {
    if (!this.isConnected) return 0;

    try {
      const serialized = values.map((v) => JSON.stringify(v));
      return await this.client.lpush(key, ...serialized);
    } catch (error) {
      this.logger.error(`Cache lpush error for key ${key}: ${error}`);
      return 0;
    }
  }

  /**
   * List operations - get range
   */
  async lrange<T>(key: string, start: number, stop: number): Promise<T[]> {
    if (!this.isConnected) return [];

    try {
      const values = await this.client.lrange(key, start, stop);
      return values.map((v) => JSON.parse(v) as T);
    } catch (error) {
      this.logger.error(`Cache lrange error for key ${key}: ${error}`);
      return [];
    }
  }

  /**
   * Acquire a distributed lock
   */
  async acquireLock(lockKey: string, ttl: number = 30): Promise<string | null> {
    if (!this.isConnected) return null;

    const lockValue = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const acquired = await this.setNx(lockKey, lockValue, ttl);
    return acquired ? lockValue : null;
  }

  /**
   * Release a distributed lock
   */
  async releaseLock(lockKey: string, lockValue: string): Promise<boolean> {
    if (!this.isConnected) return false;

    try {
      // Use Lua script for atomic check-and-delete
      const script = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else
          return 0
        end
      `;
      const result = await this.client.eval(script, 1, lockKey, lockValue);
      return result === 1;
    } catch (error) {
      this.logger.error(`Cache releaseLock error for key ${lockKey}: ${error}`);
      return false;
    }
  }

  /**
   * Flush all keys (use with caution!)
   */
  async flushAll(): Promise<boolean> {
    if (!this.isConnected) return false;

    try {
      await this.client.flushall();
      this.logger.warn('Cache flushed');
      return true;
    } catch (error) {
      this.logger.error(`Cache flushAll error: ${error}`);
      return false;
    }
  }
}
