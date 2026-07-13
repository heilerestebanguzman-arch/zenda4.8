import { ordersApi } from './api';

export const orderService = {
  // Obtener todas las órdenes
  async getOrders() {
    const response = await ordersApi.get('/api/v1/orders');
    return response.data;
  },

  // Crear una nueva orden
  async createOrder(orderData: any) {
    const response = await ordersApi.post('/api/v1/orders', orderData);
    return response.data;
  },

  // Obtener estado de una orden
  async getOrderStatus(requestId: string) {
    const response = await ordersApi.get(`/api/v1/orders/status/${requestId}`);
    return response.data;
  },
};
