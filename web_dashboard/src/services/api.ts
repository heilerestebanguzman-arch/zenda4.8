import axios from 'axios';
import { toast } from 'react-hot-toast';

// URL fija para M12
const API_URL = 'http://localhost:8093';

console.log('🔍 [API] Configurando API con URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
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
      console.log('🔑 [API] Token agregado a la petición');
    } else {
      console.log('⚠️ [API] No hay token disponible');
    }
    return config;
  },
  (error) => {
    console.error('❌ [API] Error en request interceptor:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => {
    console.log('✅ [API] Respuesta exitosa:', response.status);
    return response;
  },
  (error) => {
    console.error('❌ [API] Error en respuesta:', error);
    if (error.code === 'ERR_NETWORK') {
      toast.error('No se puede conectar al servidor. Verifica que M12 esté corriendo.');
    } else if (error.response?.status === 401) {
      toast.error('Sesión expirada. Inicia sesión nuevamente.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      toast.error('No tienes permisos para realizar esta acción.');
    } else if (error.response?.status === 500) {
      toast.error('Error interno del servidor. Intenta más tarde.');
    }
    return Promise.reject(error);
  }
);

export default api;
