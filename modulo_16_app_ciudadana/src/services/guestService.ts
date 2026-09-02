import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

const GUEST_ID_KEY = '@zenda_guest_id';
const GUEST_TRIPS_KEY = '@zenda_guest_trips';
const MAX_GUEST_TRIPS = 6; // Límite de viajes como invitado

export const guestService = {
  // Obtener o crear ID de invitado
  async getGuestId(): Promise<string> {
    try {
      let guestId = await AsyncStorage.getItem(GUEST_ID_KEY);
      if (!guestId) {
        // Generar ID único basado en dispositivo
        const deviceId = Device.osBuildId || Platform.OS + '-' + Date.now();
        guestId = `guest_${deviceId}_${Date.now()}`;
        await AsyncStorage.setItem(GUEST_ID_KEY, guestId);
      }
      return guestId;
    } catch (error) {
      console.error('Error obteniendo guest ID:', error);
      return `guest_${Date.now()}`;
    }
  },

  // Obtener contador de viajes como invitado
  async getGuestTripsCount(): Promise<number> {
    try {
      const count = await AsyncStorage.getItem(GUEST_TRIPS_KEY);
      return count ? parseInt(count, 10) : 0;
    } catch (error) {
      return 0;
    }
  },

  // Incrementar contador de viajes
  async incrementGuestTrips(): Promise<number> {
    try {
      const current = await this.getGuestTripsCount();
      const newCount = current + 1;
      await AsyncStorage.setItem(GUEST_TRIPS_KEY, String(newCount));
      return newCount;
    } catch (error) {
      return 0;
    }
  },

  // Verificar si el usuario puede hacer más viajes como invitado
  async canMakeGuestTrip(): Promise<boolean> {
    const count = await this.getGuestTripsCount();
    return count < MAX_GUEST_TRIPS;
  },

  // Obtener viajes restantes como invitado
  async getRemainingGuestTrips(): Promise<number> {
    const count = await this.getGuestTripsCount();
    return Math.max(0, MAX_GUEST_TRIPS - count);
  },

  // Resetear estado de invitado (cuando se registra)
  async resetGuestState(): Promise<void> {
    await AsyncStorage.removeItem(GUEST_ID_KEY);
    await AsyncStorage.removeItem(GUEST_TRIPS_KEY);
  },
};

export default guestService;
