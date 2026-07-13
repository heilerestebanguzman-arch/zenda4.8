import axios from 'axios';
import { toast } from 'react-hot-toast';

// 🔹 M12 - API Pública (Órdenes)
const API_ORDERS_URL = 'http://localhost:8093';

// 🔹 M13 - Reportes
const API_REPORTS_URL = 'http://localhost:8094';

console.log('🔍 [API] URLs configuradas:');
console.log('   📦 Órdenes:', API_ORDERS_URL);
console.log('   📊 Reportes:', API_REPORTS_URL);

// Cliente para órdenes (M12)
export const ordersApi = axios.create({
  baseURL: API_ORDERS_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Cliente para reportes (M13)
export const reportsApi = axios.create({
  baseURL: API_REPORTS_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor común para agregar token
const authInterceptor = (config: any) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

ordersApi.interceptors.request.use(authInterceptor);
reportsApi.interceptors.request.use(authInterceptor);

// Interceptor común para errores
const errorInterceptor = (error: any) => {
  console.error('❌ [API] Error:', error);
  if (error.response?.status === 401) {
    toast.error('Sesión expirada. Inicia sesión nuevamente.');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
  return Promise.reject(error);
};

ordersApi.interceptors.response.use((response) => response, errorInterceptor);
reportsApi.interceptors.response.use((response) => response, errorInterceptor);

export default ordersApi;
