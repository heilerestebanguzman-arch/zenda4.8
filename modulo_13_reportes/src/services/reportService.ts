import { redisClient } from '../config/redis';
import { ReportRepository } from '../repositories/reportRepository';

export class ReportService {
  private repo: ReportRepository;

  constructor() {
    this.repo = new ReportRepository();
  }

  async getDashboard() {
    const cached = await redisClient.get('report:dashboard');
    if (cached) return JSON.parse(cached);

    const data = await this.repo.getDashboard();
    await redisClient.setEx('report:dashboard', 300, JSON.stringify(data));
    return data;
  }

  async getTrend(days: number = 30) {
    const key = `report:trend:${days}`;
    const cached = await redisClient.get(key);
    if (cached) return JSON.parse(cached);

    const data = await this.repo.getTrend(days);
    await redisClient.setEx(key, 600, JSON.stringify(data));
    return data;
  }
}
