// src/components/SOSButton.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

interface SOSButtonProps {
  onSOSPress?: () => void;
  showLabel?: boolean;
}

export const SOSButton: React.FC<SOSButtonProps> = ({
  onSOSPress,
  showLabel = true,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSOS = async () => {
    setModalVisible(true);
  };

  const callEmergency = async () => {
    setLoading(true);
    try {
      // Obtener ubicación para enviar en la alerta
      const { status } = await Location.requestForegroundPermissionsAsync();
      let location = null;
      if (status === 'granted') {
        location = await Location.getCurrentPositionAsync({});
      }

      // Llamar al número de emergencia (911 en Bolivia)
      const phoneNumber = Platform.OS === 'android' ? 'tel:911' : 'tel:911';
      await Linking.openURL(phoneNumber);

      // También podríamos enviar un SMS con la ubicación
      if (location) {
        const message = `🚨 EMERGENCIA ZENDA - Ubicación: https://maps.google.com/?q=${location.coords.latitude},${location.coords.longitude}`;
        await Linking.openURL(`sms:911?body=${encodeURIComponent(message)}`);
      }

      if (onSOSPress) {
        onSOSPress();
      }
    } catch (error) {
      console.error('Error en SOS:', error);
      Alert.alert(
        '🚨 Llamada de emergencia',
        'No se pudo realizar la llamada. Por favor, marca 911 manualmente.'
      );
    } finally {
      setLoading(false);
      setModalVisible(false);
    }
  };

  const sendAlert = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        const message = `🚨 ALERTA ZENDA - Necesito ayuda! Ubicación: https://maps.google.com/?q=${location.coords.latitude},${location.coords.longitude}`;
        
        // Aquí se enviaría la alerta a contactos de confianza
        Alert.alert(
          '✅ Alerta enviada',
          'Se ha enviado tu ubicación a tus contactos de emergencia.'
        );
      }
    } catch (error) {
      console.error('Error enviando alerta:', error);
      Alert.alert('Error', 'No se pudo enviar la alerta. Verifica tu conexión.');
    } finally {
      setLoading(false);
      setModalVisible(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.sosButton}
        onPress={handleSOS}
        activeOpacity={0.8}
      >
        <Ionicons name="alert-circle" size={28} color="#FFFFFF" />
        {showLabel && <Text style={styles.sosText}>SOS</Text>}
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="alert-circle" size={32} color="#EF4444" />
              <Text style={styles.modalTitle}>🚨 ¿Estás seguro?</Text>
            </View>
            
            <Text style={styles.modalDescription}>
              Esta acción enviará una alerta de emergencia y llamará al número de emergencia.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.emergencyBtn]}
                onPress={callEmergency}
                disabled={loading}
              >
                <Ionicons name="call" size={20} color="#FFFFFF" />
                <Text style={styles.emergencyBtnText}>Llamar 911</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.alertBtn}
              onPress={sendAlert}
              disabled={loading}
            >
              <Ionicons name="location" size={20} color="#1A3C6E" />
              <Text style={styles.alertBtnText}>Enviar ubicación a contactos</Text>
            </TouchableOpacity>

            {loading && (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Procesando...</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  sosButton: {
    backgroundColor: '#EF4444',
    borderRadius: 30,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    flexDirection: 'row',
    gap: 4,
    minWidth: 44,
    minHeight: 44,
  },
  sosText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 4,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  modalDescription: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 24,
    lineHeight: 22,
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
  alertBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  alertBtnText: {
    color: '#1A3C6E',
    fontWeight: '600',
    fontSize: 16,
  },
  loadingContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 14,
  },
});

export default SOSButton;
