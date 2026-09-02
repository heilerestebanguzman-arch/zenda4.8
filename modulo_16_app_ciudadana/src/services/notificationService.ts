import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configurar handler para cuando se recibe una notificación
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const notificationService = {
  // Solicitar permisos
  async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      console.log('⚠️ Las notificaciones solo funcionan en dispositivos físicos');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('❌ Permiso de notificaciones denegado');
      return false;
    }

    console.log('✅ Permiso de notificaciones concedido');
    return true;
  },

  // Obtener token de notificación
  async getToken(): Promise<string | null> {
    try {
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId || 'zenda-app',
      });
      console.log('📱 Token de notificación:', token.data);
      return token.data;
    } catch (error) {
      console.error('❌ Error obteniendo token:', error);
      return null;
    }
  },

  // Enviar notificación local (para pruebas)
  async sendLocalNotification(title: string, body: string, data?: any) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: 'default',
      },
      trigger: null, // Enviar inmediatamente
    });
  },

  // Enviar notificación de estado del viaje
  async sendTripNotification(tripId: string, status: string, driverName: string) {
    const messages: Record<string, { title: string; body: string }> = {
      confirmed: {
        title: '✅ Viaje Confirmado',
        body: `Tu viaje con ${driverName} ha sido confirmado.`,
      },
      in_progress: {
        title: '🚗 Viaje en curso',
        body: `Tu conductor ${driverName} está en camino.`,
      },
      arrived: {
        title: '📍 Conductor llegó',
        body: `Tu conductor ${driverName} ha llegado a tu ubicación.`,
      },
      completed: {
        title: '✅ Viaje Completado',
        body: `Tu viaje con ${driverName} ha finalizado. ¡Califícalo!`,
      },
      cancelled: {
        title: '❌ Viaje Cancelado',
        body: `Tu viaje con ${driverName} ha sido cancelado.`,
      },
    };

    const message = messages[status];
    if (message) {
      await this.sendLocalNotification(message.title, message.body, { tripId, status });
    }
  },

  // Configurar listener para notificaciones recibidas
  addNotificationListener(callback: (notification: any) => void) {
    const subscription = Notifications.addNotificationReceivedListener(callback);
    return subscription;
  },

  // Configurar listener para respuesta a notificaciones
  addNotificationResponseListener(callback: (response: any) => void) {
    const subscription = Notifications.addNotificationResponseReceivedListener(callback);
    return subscription;
  },
};

export default notificationService;
