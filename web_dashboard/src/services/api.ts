import axios from 'axios';
import { toast } from 'react-hot-toast';

// Usar la URL fija de M13 (Reportes)
const API_BASE_URL = 'http://localhost:8094';

console.log('🔍 [FRONTEND] API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ [FRONTEND] Error en API:', error);
    if (error.response?.status === 401) {
      toast.error('Sesión expirada. Inicia sesión nuevamente.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
