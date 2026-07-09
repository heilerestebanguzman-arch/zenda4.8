const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8093/api/v1';

export const orderService = {
  // Obtener todas las órdenes
  async getOrders(token: string) {
    const response = await fetch(`${API_URL}/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // Crear una nueva orden
  async createOrder(token: string, orderData: any) {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });
    return response.json();
  },

  // Obtener estado de una orden
  async getOrderStatus(token: string, orderId: string) {
    const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },
};
