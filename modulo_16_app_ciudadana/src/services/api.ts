import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// La IP debe coincidir con tu máquina
const API_BASE = 'http://192.168.1.62:8093'; // API Gateway

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Interceptor para agregar token a todas las peticiones
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔑 Token agregado a la petición');
      } else {
        console.log('⚠️ No hay token disponible');
      }
    } catch (error) {
      console.error('❌ Error obteniendo token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      console.log('🔴 Token expirado o inválido');
      await AsyncStorage.removeItem('accessToken');
      // Puedes agregar navegación a login aquí
    }
    return Promise.reject(error);
  }
);

export default api;