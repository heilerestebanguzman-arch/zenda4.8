import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  Linking,
  Platform,
  Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Audio } from 'expo-av';
import axios from 'axios';
import { authService } from '../services/authService';

const API_BASE = 'http://192.168.1.88:8093';

interface SOSButtonProps {
  tripId?: string;
  onSOSPress?: () => void;
}

export const SOSButton: React.FC<SOSButtonProps> = ({ tripId, onSOSPress }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const handleSOS = async () => {
    Vibration.vibrate([500, 500, 500]);
    setModalVisible(true);
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permiso de audio denegado');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      
      // Detener automáticamente después de 30 segundos
      setTimeout(async () => {
        if (recording) {
          await recording.stopAndUnloadAsync();
          setIsRecording(false);
          const uri = recording.getURI();
          console.log('🎤 Audio grabado:', uri);
        }
      }, 30000);
    } catch (error) {
      console.error('Error recording:', error);
    }
  };

  const stopRecording = async () => {
    if (recording) {
      await recording.stopAndUnloadAsync();
      setIsRecording(false);
      const uri = recording.getURI();
      console.log('🎤 Audio grabado:', uri);
      return uri;
    }
    return null;
  };

  const sendEmergencyAlert = async () => {
    setLoading(true);
    try {
      // 1. Obtener ubicación
      const { status } = await Location.requestForegroundPermissionsAsync();
      let location = null;
      if (status === 'granted') {
        location = await Location.getCurrentPositionAsync({});
      }

      // 2. Si está grabando, detener
      let audioUri = null;
      if (isRecording) {
        audioUri = await stopRecording();
      }

      // 3. Obtener token y usuario
      const token = await authService.getToken();
      const user = await authService.getUser();

      // 4. Enviar alerta al backend
      const payload = {
        userId: user?.id,
        tripId: tripId,
        lat: location?.coords.latitude,
        lng: location?.coords.longitude,
        audioUri: audioUri,
        timestamp: new Date().toISOString(),
      };

      const response = await axios.post(`${API_BASE}/api/v1/security/alert`, payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        timeout: 5000,
      });

      // 5. Llamar a emergencia
      const phoneNumber = Platform.OS === 'android' ? 'tel:911' : 'tel:911';
      await Linking.openURL(phoneNumber);

      if (onSOSPress) {
        onSOSPress();
      }

      Alert.alert(
        '🚨 Alerta de emergencia enviada',
        'Se ha enviado tu ubicación a la central de monitoreo y se está realizando la llamada de emergencia.'
      );
    } catch (error) {
      console.error('Error sending emergency alert:', error);
      // Si falla el backend, al menos llamar a emergencia
      const phoneNumber = Platform.OS === 'android' ? 'tel:911' : 'tel:911';
      await Linking.openURL(phoneNumber);
      Alert.alert(
        '🚨 Llamada de emergencia',
        'No se pudo enviar la alerta, pero se está realizando la llamada de emergencia.'
      );
    } finally {
      setLoading(false);
      setModalVisible(false);
      setRecording(null);
    }
  };

  const sendAlertOnly = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      let location = null;
      if (status === 'granted') {
        location = await Location.getCurrentPositionAsync({});
      }

      let audioUri = null;
      if (isRecording) {
        audioUri = await stopRecording();
      }

      const token = await authService.getToken();
      const user = await authService.getUser();

      await axios.post(`${API_BASE}/api/v1/security/alert`, {
        userId: user?.id,
        tripId: tripId,
        lat: location?.coords.latitude,
        lng: location?.coords.longitude,
        audioUri: audioUri,
        timestamp: new Date().toISOString(),
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        timeout: 5000,
      });

      Alert.alert('✅ Alerta enviada', 'Se ha enviado tu ubicación a la central de monitoreo.');
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar la alerta.');
    } finally {
      setLoading(false);
      setModalVisible(false);
      setRecording(null);
    }
  };

  return (
    <>
      {/* Botón SOS flotante */}
      <TouchableOpacity
        style={styles.sosButton}
        onPress={handleSOS}
        activeOpacity={0.8}
      >
        <Ionicons name="alert-circle" size={32} color="#FFFFFF" />
        <Text style={styles.sosText}>SOS</Text>
      </TouchableOpacity>

      {/* Modal de confirmación */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="alert-circle" size={40} color="#EF4444" />
              <Text style={styles.modalTitle}>🚨 ¿Estás seguro?</Text>
            </View>

            <Text style={styles.modalDescription}>
              Esta acción enviará una alerta de emergencia, compartirá tu ubicación en tiempo real y comenzará la grabación de audio.
            </Text>

            <View style={styles.recordingStatus}>
              <Ionicons 
                name={isRecording ? 'mic' : 'mic-outline'} 
                size={24} 
                color={isRecording ? '#EF4444' : '#94A3B8'} 
              />
              <Text style={[styles.recordingText, isRecording && styles.recordingActive]}>
                {isRecording ? '🎙️ Grabando audio...' : 'Audio listo'}
              </Text>
              {!isRecording && (
                <TouchableOpacity onPress={startRecording} style={styles.recordBtn}>
                  <Text style={styles.recordBtnText}>Grabar</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => {
                  setModalVisible(false);
                  if (isRecording) stopRecording();
                }}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.emergencyBtn]}
                onPress={sendEmergencyAlert}
                disabled={loading}
              >
                <Ionicons name="call" size={20} color="#FFFFFF" />
                <Text style={styles.emergencyBtnText}>
                  {loading ? 'Enviando...' : 'Llamar 911'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.alertOnlyBtn}
              onPress={sendAlertOnly}
              disabled={loading}
            >
              <Ionicons name="location" size={20} color="#1A3C6E" />
              <Text style={styles.alertOnlyText}>Enviar solo ubicación</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  sosButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: '#EF4444',
    borderRadius: 50,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 100,
    width: 70,
    height: 70,
  },
  sosText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 8,
  },
  modalDescription: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  recordingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    marginBottom: 16,
  },
  recordingText: {
    fontSize: 14,
    color: '#94A3B8',
  },
  recordingActive: {
    color: '#EF4444',
    fontWeight: '600',
  },
  recordBtn: {
    backgroundColor: '#1A3C6E',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recordBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  modalBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  cancelBtn: {
    backgroundColor: '#F1F5F9',
  },
  cancelBtnText: {
    color: '#64748B',
    fontWeight: '600',
    fontSize: 16,
  },
  emergencyBtn: {
    backgroundColor: '#EF4444',
  },
  emergencyBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  alertOnlyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  alertOnlyText: {
    color: '#1A3C6E',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default SOSButton;
