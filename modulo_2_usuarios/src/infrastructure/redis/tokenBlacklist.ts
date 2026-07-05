import redis from '../../config/redis';

export class TokenBlacklist {
  static async add(token: string, ttlSeconds: number = 7 * 24 * 3600): Promise<void> {
    const key = `blacklist:${token}`;
    await redis.setex(key, ttlSeconds, 'true');
  }

  static async isBlacklisted(token: string): Promise<boolean> {
    const key = `blacklist:${token}`;
    const result = await redis.get(key);
    return result !== null;
  }
}
