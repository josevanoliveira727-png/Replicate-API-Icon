import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;

export const initializeRedis = async (): Promise<void> => {
  try {
    if (!process.env.REDIS_HOST) {
      console.log('⚠️  Redis not configured, caching disabled');
      return;
    }

    redisClient = createClient({
      socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
      password: process.env.REDIS_PASSWORD || undefined,
    });

    redisClient.on('error', (err) => console.error('Redis Client Error:', err));
    await redisClient.connect();
    console.log('✅ Redis connection established');
  } catch (error) {
    console.warn('⚠️  Redis connection failed, continuing without cache:', error);
    redisClient = null;
  }
};

export const getRedisClient = (): RedisClientType | null => {
  return redisClient;
};

export const closeRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
  }
};
