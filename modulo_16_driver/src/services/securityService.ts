import * as Location from 'expo-location';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import { authService } from './authService';
import CryptoJS from 'crypto-js';

const API_BASE = 'http://192.168.1.88:8093';
const ENCRYPTION_KEY = 'zenda-security-key-2026';

export interface SecurityAlert {
  tripId: string;
  userId: string;
  lat: number;
  lng: number;
  timestamp: string;
  type: 'panic' | 'route_deviation' | 'emergency';
  audioUri?: string;
  encryptedAudio?: string;
}

class SecurityService {
  private recording: Audio.Recording | null = null;
  private isRecording = false;
  private currentTripId: string | null = null;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private routeCoordinates: { lat: number; lng: number }[] = [];

  // ============================================
  // GRABACIÓN DE AUDIO CIFRADO
  // ============================================

  async startSecureRecording(tripId: string): Promise<boolean> {
    try {
      this.currentTripId = tripId;

      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        console.warn('Permiso de audio denegado');
        return false;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      this.recording = recording;
      this.isRecording = true;

      console.log('🎤 Grabación de seguridad iniciada');
      return true;
    } catch (error) {
      console.error('Error al iniciar grabación:', error);
      return false;
    }
  }

  async stopSecureRecording(): Promise<string | null> {
    if (!this.recording || !this.isRecording) {
      return null;
    }

    try {
      await this.recording.stopAndUnloadAsync();
      this.isRecording = false;
      const uri = this.recording.getURI();

      if (uri) {
        // Leer el archivo y cifrarlo
        const audioBase64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Cifrar con AES-256
        const encrypted = CryptoJS.AES.encrypt(audioBase64, ENCRYPTION_KEY).toString();
        console.log('🔐 Audio cifrado correctamente');

        // Guardar copia local cifrada
        const encryptedPath = `${FileSystem.documentDirectory}panic_${Date.now()}.enc`;
        await FileSystem.writeAsStringAsync(encryptedPath, encrypted, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        this.recording = null;
        return encryptedPath;
      }

      this.recording = null;
      return null;
    } catch (error) {
      console.error('Error al detener grabación:', error);
      this.recording = null;
      return null;
    }
  }

  // ============================================
  // MONITOREO DE RUTA CON GEOCERCAS
  // ============================================

  startRouteMonitoring(tripId: string, origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) {
    this.currentTripId = tripId;
    this.routeCoordinates = [origin, destination];

    // Limpiar intervalo anterior
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    // Verificar cada 30 segundos
    this.monitoringInterval = setInterval(async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          const deviation = this.calculateDeviation(
            location.coords.latitude,
            location.coords.longitude
          );

          // Si la desviación es > 500 metros, activar alerta
          if (deviation > 500) {
            console.warn(`🚨 Desviación de ruta detectada: ${deviation}m`);
            await this.sendSecurityAlert({
              tripId: this.currentTripId!,
              userId: (await authService.getUser())?.id || '',
              lat: location.coords.latitude,
              lng: location.coords.longitude,
              timestamp: new Date().toISOString(),
              type: 'route_deviation',
            });
          }
        }
      } catch (error) {
        console.error('Error en monitoreo de ruta:', error);
      }
    }, 30000);
  }

  stopRouteMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  private calculateDeviation(lat: number, lng: number): number {
    if (this.routeCoordinates.length < 2) return 0;

    const [origin, destination] = this.routeCoordinates;
    // Distancia desde el punto actual a la línea recta origen-destino
    const R = 6371; // km
    const dLat = (destination.lat - origin.lat) * Math.PI / 180;
    const dLng = (destination.lng - origin.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(origin.lat * Math.PI / 180) * Math.cos(destination.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const totalDistance = R * c * 1000;

    // Distancia del punto a la línea
    const bLat = (lat - origin.lat) * Math.PI / 180;
    const bLng = (lng - origin.lng) * Math.PI / 180;
    const a2 = Math.sin(bLat/2) * Math.sin(bLat/2) +
              Math.cos(origin.lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
              Math.sin(bLng/2) * Math.sin(bLng/2);
    const c2 = 2 * Math.atan2(Math.sqrt(a2), Math.sqrt(1-a2));
    const pointDistance = R * c2 * 1000;

    // Desviación relativa
    return Math.abs(pointDistance - (totalDistance * 0.5)) * 2;
  }

  // ============================================
  // PROTOCOLO DE PÁNICO
  // ============================================

  async triggerPanic(tripId: string, userId: string): Promise<boolean> {
    try {
      // 1. Obtener ubicación
      const { status } = await Location.requestForegroundPermissionsAsync();
      let location = null;
      if (status === 'granted') {
        location = await Location.getCurrentPositionAsync({});
      }

      // 2. Detener grabación si está activa
      let encryptedAudioPath = null;
      if (this.isRecording) {
        encryptedAudioPath = await this.stopSecureRecording();
      }

      // 3. Cifrar datos de ubicación
      const locationData = JSON.stringify({
        lat: location?.coords.latitude,
        lng: location?.coords.longitude,
        timestamp: new Date().toISOString(),
      });
      const encryptedLocation = CryptoJS.AES.encrypt(locationData, ENCRYPTION_KEY).toString();

      // 4. Enviar alerta de pánico
      const token = await authService.getToken();
      const response = await axios.post(
        `${API_BASE}/api/v1/security/panic`,
        {
          tripId,
          userId,
          encryptedLocation,
          encryptedAudio: encryptedAudioPath ? await FileSystem.readAsStringAsync(encryptedAudioPath, {
            encoding: FileSystem.EncodingType.UTF8,
          }) : null,
          timestamp: new Date().toISOString(),
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          timeout: 10000,
        }
      );

      console.log('🚨 Alerta de pánico enviada:', response.data);
      return true;
    } catch (error) {
      console.error('Error al activar pánico:', error);
      return false;
    }
  }

  // ============================================
  // ENVÍO DE ALERTAS DE SEGURIDAD
  // ============================================

  async sendSecurityAlert(alert: SecurityAlert): Promise<boolean> {
    try {
      const token = await authService.getToken();
      await axios.post(
        `${API_BASE}/api/v1/security/alert`,
        alert,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          timeout: 5000,
        }
      );
      return true;
    } catch (error) {
      console.error('Error al enviar alerta:', error);
      return false;
    }
  }

  // ============================================
  // ESTADO ACTUAL
  // ============================================

  isAudioRecording(): boolean {
    return this.isRecording;
  }

  getCurrentTripId(): string | null {
    return this.currentTripId;
  }
}

export default new SecurityService();
