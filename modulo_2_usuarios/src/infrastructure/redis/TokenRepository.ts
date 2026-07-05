import redis from '../../config/redis';

export class TokenRepository {
  private readonly PREFIX = 'refresh_token:';

  async save(userId: string, token: string, expiresIn: number): Promise<void> {
    const key = `${this.PREFIX}${token}`;
    await redis.setex(key, expiresIn, userId);
  }

  async findUserIdByToken(token: string): Promise<string | null> {
    const key = `${this.PREFIX}${token}`;
    return await redis.get(key);
  }

  async delete(token: string): Promise<void> {
    const key = `${this.PREFIX}${token}`;
    await redis.del(key);
  }

  async deleteAllByUserId(userId: string): Promise<void> {
    const keys = await redis.keys(`${this.PREFIX}*`);
    for (const key of keys) {
      const value = await redis.get(key);
      if (value === userId) {
        await redis.del(key);
      }
    }
  }
}
