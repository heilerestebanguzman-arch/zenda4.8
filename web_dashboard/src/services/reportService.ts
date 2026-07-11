import api from './api';

export const reportService = {
  // Obtener dashboard de reportes
  async getDashboard() {
    const response = await api.get('/reports/dashboard');
    return response.data;
  },

  // Obtener tendencia de ingresos
  async getTrend(days: number = 30) {
    const response = await api.get(`/reports/trend?days=${days}`);
    return response.data;
  },

  // Obtener órdenes recientes
  async getRecentOrders(limit: number = 10) {
    const response = await api.get(`/reports/recent-orders?limit=${limit}`);
    return response.data;
  },
};
