import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// ✅ IP CORRECTA (la que usa tu máquina actualmente)
const API_BASE = 'http://:8093';
const API_USERS = 'http://:3000';

export const authService = {
  async saveSession(token: string, user: any) {
    try {
      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('user_data', JSON.stringify(user));
      return { success: true };
    } catch (error) {
      console.error('Error guardando sesión:', error);
      return { success: false, error: 'No se pudo guardar la sesión' };
    }
  },

  async login(email: string, password: string) {
    try {
      console.log('📡 Intentando login a:', `${API_BASE}/api/v1/auth/login`);
      
      const response = await axios.post(`${API_BASE}/api/v1/auth/login`, {
        email,
        password,
      });
      
      console.log('📥 Respuesta del backend:', response.data);
      
      if (response.data && response.data.accessToken) {
        await this.saveSession(response.data.accessToken, response.data.user);
        return { success: true, token: response.data.accessToken, user: response.data.user };
      }
      return { success: false, error: 'Credenciales inválidas' };
    } catch (error: any) {
      console.error('❌ Error en login:', error.message);
      console.error('❌ URL:', `${API_BASE}/api/v1/auth/login`);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error de conexión con el servidor' 
      };
    }
  },

  async register(userData: any) {
    try {
      const response = await axios.post(`${API_USERS}/api/v1/users/register`, userData);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Error en registro:', error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error en el registro' 
      };
    }
  },

  async getToken() {
    return await AsyncStorage.getItem('auth_token');
  },

  async getUser() {
    const userData = await AsyncStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  },

  async isAuthenticated() {
    const token = await this.getToken();
    return !!token;
  },

  async logout() {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('user_data');
  }
};

export default authService;
