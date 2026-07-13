import { ReportRepository } from '../repositories/ReportRepository';

export class ReportService {
  private repository: ReportRepository;

  constructor() {
    this.repository = new ReportRepository();
  }

  async getSummary(tenantId: string) {
    return await this.repository.getSummary(tenantId);
  }

  async getOrdersByStatus(tenantId: string) {
    return await this.repository.getOrdersByStatus(tenantId);
  }

  async getTopDrivers(tenantId: string, limit: number = 5) {
    return await this.repository.getTopDrivers(tenantId, limit);
  }

  async getMonthlyRevenue(tenantId: string, months: number = 6) {
    return await this.repository.getMonthlyRevenue(tenantId, months);
  }

  async getMTTR(tenantId: string) {
    return await this.repository.getMTTR(tenantId);
  }
}
