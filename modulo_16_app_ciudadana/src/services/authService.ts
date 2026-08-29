import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE = 'http://192.168.100.10:8093';

export const authService = {
  saveSession: async (token: string, user: any) => {
    try {
      await AsyncStorage.setItem('@zenda_access_token', token);
      await AsyncStorage.setItem('@zenda_user', JSON.stringify(user));
      console.log('✅ Sesión guardada');
    } catch (error) {
      console.error('Error al guardar sesión:', error);
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
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      return null;
    }
  },

  validateToken: async (token: string): Promise<boolean> => {
    try {
      const response = await axios.get(`${API_BASE}/api/v1/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.success === true;
    } catch (error) {
      console.warn('⚠️ Token inválido');
      return false;
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem('@zenda_access_token');
      await AsyncStorage.removeItem('@zenda_user');
      console.log('✅ Sesión cerrada');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
};
