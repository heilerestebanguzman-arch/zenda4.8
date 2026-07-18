import { reportsApi } from './api';

console.log('🔧 [reportService] Inicializado');

export const reportService = {
  async getSummary() {
    console.log('📊 [reportService] getSummary llamado');
    try {
      const response = await reportsApi.get('/api/v1/reports/summary');
      console.log('✅ [reportService] getSummary respuesta:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [reportService] getSummary error:', error);
      throw error;
    }
  },

  async getOrdersByStatus() {
    console.log('📊 [reportService] getOrdersByStatus llamado');
    try {
      const response = await reportsApi.get('/api/v1/reports/orders-by-status');
      console.log('✅ [reportService] getOrdersByStatus respuesta:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [reportService] getOrdersByStatus error:', error);
      throw error;
    }
  },

  async getTopDrivers(limit: number = 5) {
    const response = await reportsApi.get(`/api/v1/reports/top-drivers?limit=${limit}`);
    return response.data;
  },

  async getMonthlyRevenue(months: number = 6) {
    const response = await reportsApi.get(`/api/v1/reports/monthly-revenue?months=${months}`);
    return response.data;
  },

  async getMTTR() {
    const response = await reportsApi.get('/api/v1/reports/mttr');
    return response.data;
  },
};
