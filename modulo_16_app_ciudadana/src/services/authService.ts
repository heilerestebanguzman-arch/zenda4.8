import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE = 'http://192.168.1.67:8093';

export const authService = {
  saveSession: async (token: string, user: any) => {
    try {
      if (!token || !user) {
        console.error('❌ Error: token o usuario vacío');
        return false;
      }
      await AsyncStorage.setItem('@zenda_access_token', token);
      await AsyncStorage.setItem('@zenda_user', JSON.stringify(user));
      console.log('✅ Sesión guardada correctamente');
      return true;
    } catch (error) {
      console.error('Error al guardar sesión:', error);
      return false;
    }
  },

  getToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem('@zenda_access_token');
    } catch (error) {
      console.error('Error al obtener token:', error);
      return null;
    }
  },

  getUser: async (): Promise<any | null> => {
    try {
      const userStr = await AsyncStorage.getItem('@zenda_user');
      if (!userStr) return null;
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      return null;
    }
  },

  validateToken: async (token: string): Promise<boolean> => {
    if (!token) return false;
    try {
      const response = await axios.get(`${API_BASE}/api/v1/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data?.success === true;
    } catch (error) {
      console.warn('⚠️ Token inválido o expirado');
      return false;
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem('@zenda_access_token');
      await AsyncStorage.removeItem('@zenda_user');
      console.log('✅ Sesión cerrada correctamente');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
};
