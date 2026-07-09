const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8093/api/v1';
const AUTH_URL = import.meta.env.VITE_AUTH_URL || 'http://localhost:3000/api/v1';

console.log('🔍 API_URL:', API_URL);
console.log('🔍 AUTH_URL:', AUTH_URL);

export const api = {
  async login(email: string, password: string) {
    console.log('📤 Enviando login a:', `${AUTH_URL}/auth/login`);
    try {
      const response = await fetch(`${AUTH_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      console.log('📥 Respuesta status:', response.status);
      const data = await response.json();
      console.log('📥 Respuesta data:', data);
      return data;
    } catch (error) {
      console.error('❌ Error en login:', error);
      throw error;
    }
  },

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

  async health() {
    const response = await fetch(`${API_URL}/health`);
    return response.json();
  },
};
