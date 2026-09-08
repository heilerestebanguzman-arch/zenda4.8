import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';
import { authService } from '../services/authService';
import SOSButton from "../components/SOSButton";
import { BottomNavBar } from '../components/BottomNavBar';

const API_MOBILITY = 'http://192.168.1.88:8103/api/v1/mobility';

interface TripData {
  id: string;
  user_id: string;
  user_name: string;
  user_phone: string;
  origin_address: string;
  destination_address: string;
  vehicle_type: string;
  fare: number;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  origin_lat: number;
  origin_lng: number;
  dest_lat: number;
  dest_lng: number;
  created_at: string;
  distance_km: number;
  duration_minutes: number;
}

export default function TripScreen({ navigation, route }: any) {
  const { tripId } = route.params || {};
  const [trip, setTrip] = useState<TripData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [location, setLocation] = useState<any>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (tripId) {
      loadTrip();
    }
    startLocationTracking();
    return () => {
      // Limpiar tracking al salir
    };
  }, [tripId]);

  const loadTrip = async () => {
    try {
      setLoading(true);
      const token = await authService.getToken();
      const user = await authService.getUser();

      const response = await axios.get(`${API_MOBILITY}/status/${tripId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        timeout: 5000,
      });

      if (response.data.success) {
        setTrip(response.data.data);
      } else {
        Alert.alert('Error', 'No se pudo cargar el viaje.');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading trip:', error);
      Alert.alert('Error', 'Error al cargar el viaje.');
    } finally {
      setLoading(false);
    }
  };

  const startLocationTracking = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso de ubicación denegado');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);

      // Enviar ubicación al backend
      await updateLocation(loc.coords.latitude, loc.coords.longitude);
    } catch (error) {
      console.error('Error starting location tracking:', error);
    }
  };

  const updateLocation = async (lat: number, lng: number) => {
    try {
      const token = await authService.getToken();
      const user = await authService.getUser();

      await axios.post(
        `${API_MOBILITY}/driver/location`,
        {
          driverId: user?.id,
          lat,
          lng,
          status: trip?.status || 'in_progress',
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          timeout: 3000,
        }
      );
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const handleStartTrip = async () => {
    setShowStartModal(false);
    try {
      const token = await authService.getToken();
      await axios.post(
        `${API_MOBILITY}/trip/start/${tripId}`,
        {},
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      setTrip((prev) => prev ? { ...prev, status: 'in_progress' } : null);
      Alert.alert('✅ Viaje iniciado', 'Dirígete al destino del pasajero.');
    } catch (error) {
      Alert.alert('Error', 'No se pudo iniciar el viaje.');
    }
  };

  const handleCompleteTrip = async () => {
    setShowCompleteModal(false);
    try {
      const token = await authService.getToken();
      await axios.post(
        `${API_MOBILITY}/trip/complete/${tripId}`,
        {},
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      Alert.alert('✅ Viaje completado', '¡Has llegado al destino!');
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Error', 'No se pudo completar el viaje.');
    }
  };

  const handleCancelTrip = () => {
    Alert.alert(
      '⚠️ Cancelar Viaje',
      '¿Estás seguro de que deseas cancelar este viaje?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await authService.getToken();
              await axios.post(
                `${API_MOBILITY}/trip/cancel/${tripId}`,
                {},
                { headers: token ? { Authorization: `Bearer ${token}` } : {} }
              );
              Alert.alert('✅ Viaje cancelado');
              navigation.navigate('Home');
            } catch (error) {
              Alert.alert('Error', 'No se pudo cancelar el viaje.');
            }
          },
        },
      ]
    );
  };

  const callUser = () => {
    if (trip?.user_phone) {
      Linking.openURL(`tel:${trip.user_phone}`);
    } else {
      Alert.alert('⚠️ Número no disponible');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A3C6E" />
        <Text style={styles.loadingText}>Cargando viaje...</Text>
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text style={styles.errorText}>Viaje no encontrado</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return '#3B82F6';
      case 'in_progress':
        return '#F5A623';
      case 'completed':
        return '#2ECC71';
      case 'cancelled':
        return '#EF4444';
      default:
        return '#94A3B8';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'Dirigiéndose al pasajero';
      case 'in_progress':
        return 'Viaje en curso';
      case 'completed':
        return 'Completado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return 'Pendiente';
    }
  };

  return (
    <View style={styles.container}>
      {/* Mapa */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: trip.origin_lat || -17.5206,
            longitude: trip.origin_lng || -63.1732,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {trip && (
            <>
              <Marker
                coordinate={{
                  latitude: trip.origin_lat,
                  longitude: trip.origin_lng,
                }}
                title="Origen"
                pinColor="#1A3C6E"
              />
              <Marker
                coordinate={{
                  latitude: trip.dest_lat,
                  longitude: trip.dest_lng,
                }}
                title="Destino"
                pinColor="#F5A623"
              />
            </>
          )}
        </MapView>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Viaje en curso</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Info del viaje */}
      <View style={styles.tripCard}>
        <View style={styles.tripHeader}>
          <View>
            <Text style={styles.tripStatus}>{getStatusLabel(trip.status)}</Text>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(trip.status) }]} />
          </View>
          <Text style={styles.tripFare}>Bs {trip.fare.toFixed(2)}</Text>
        </View>

        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            <Ionicons name="person" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{trip.user_name || 'Pasajero'}</Text>
            <TouchableOpacity style={styles.callBtn} onPress={callUser}>
              <Ionicons name="call-outline" size={16} color="#1A3C6E" />
              <Text style={styles.callBtnText}>Llamar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.routeInfo}>
          <View style={styles.routePoint}>
            <View style={styles.routeDot} />
            <Text style={styles.routeAddress}>{trip.origin_address || 'Origen'}</Text>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.routePoint}>
            <View style={[styles.routeDot, styles.routeDotDest]} />
            <Text style={styles.routeAddress}>{trip.destination_address || 'Destino'}</Text>
          </View>
        </View>

        <View style={styles.tripMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="car-outline" size={16} color="#94A3B8" />
            <Text style={styles.metaText}>{trip.vehicle_type}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={16} color="#94A3B8" />
            <Text style={styles.metaText}>{trip.duration_minutes || 0} min</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="navigate-outline" size={16} color="#94A3B8" />
            <Text style={styles.metaText}>{trip.distance_km?.toFixed(1) || 0} km</Text>
          </View>
        </View>
      </View>

      {/* Botones de acción */}
      <View style={styles.actionsContainer}>
        {trip.status === 'accepted' && (
          <TouchableOpacity style={styles.startBtn} onPress={() => setShowStartModal(true)}>
            <Text style={styles.startBtnText}>🟢 Iniciar viaje</Text>
          </TouchableOpacity>
        )}

        {trip.status === 'in_progress' && (
          <TouchableOpacity style={styles.completeBtn} onPress={() => setShowCompleteModal(true)}>
            <Text style={styles.completeBtnText}>✅ Finalizar viaje</Text>
          </TouchableOpacity>
        )}

        {(trip.status === 'accepted' || trip.status === 'in_progress') && (
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelTrip}>
            <Text style={styles.cancelBtnText}>Cancelar viaje</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Modal para iniciar viaje */}
      <Modal visible={showStartModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="car-outline" size={48} color="#1A3C6E" />
            <Text style={styles.modalTitle}>Iniciar viaje</Text>
            <Text style={styles.modalText}>
              ¿Ya has recogido al pasajero?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowStartModal(false)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleStartTrip}>
                <Text style={styles.modalConfirmText}>Sí, iniciar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para completar viaje */}
      <Modal visible={showCompleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="flag-outline" size={48} color="#2ECC71" />
            <Text style={styles.modalTitle}>Finalizar viaje</Text>
            <Text style={styles.modalText}>
              ¿Has llegado al destino?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowCompleteModal(false)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleCompleteTrip}>
                <Text style={styles.modalConfirmText}>Sí, finalizar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  mapContainer: { height: '45%', backgroundColor: '#E2E8F0' },
  map: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1E293B' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#94A3B8' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 18, color: '#1E293B', marginTop: 12 },
  backBtn: { marginTop: 20, backgroundColor: '#1A3C6E', padding: 12, borderRadius: 12 },
  backBtnText: { color: '#FFFFFF', fontWeight: '600' },
  tripCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tripHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tripStatus: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  tripFare: { fontSize: 20, fontWeight: 'bold', color: '#1A3C6E' },
  userInfo: { flexDirection: 'row', alignItems: 'center', marginVertical: 12 },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1A3C6E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDetails: { marginLeft: 12, flex: 1 },
  userName: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
  callBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  callBtnText: { color: '#1A3C6E', fontSize: 13, fontWeight: '500' },
  routeInfo: { marginVertical: 8 },
  routePoint: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 4 },
  routeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#1A3C6E' },
  routeDotDest: { backgroundColor: '#F5A623' },
  routeLine: { width: 2, height: 12, backgroundColor: '#E2E8F0', marginLeft: 3 },
  routeAddress: { fontSize: 14, color: '#1E293B', flex: 1 },
  tripMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 13, color: '#64748B' },
  actionsContainer: { padding: 16, gap: 8 },
  startBtn: { backgroundColor: '#1A3C6E', padding: 16, borderRadius: 12, alignItems: 'center' },
  startBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  completeBtn: { backgroundColor: '#2ECC71', padding: 16, borderRadius: 12, alignItems: 'center' },
  completeBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  cancelBtn: { backgroundColor: '#FEE2E2', padding: 14, borderRadius: 12, alignItems: 'center' },
  cancelBtnText: { color: '#EF4444', fontWeight: '600', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, width: '85%', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B', marginTop: 12 },
  modalText: { fontSize: 16, color: '#64748B', marginVertical: 12, textAlign: 'center' },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 12, width: '100%' },
  modalCancelBtn: { flex: 1, backgroundColor: '#F1F5F9', padding: 14, borderRadius: 12, alignItems: 'center' },
  modalCancelText: { color: '#64748B', fontWeight: '600' },
  modalConfirmBtn: { flex: 1, backgroundColor: '#1A3C6E', padding: 14, borderRadius: 12, alignItems: 'center' },
  modalConfirmText: { color: '#FFFFFF', fontWeight: 'bold' },
});

// Agregar al inicio del archivo
import securityService from '../services/securityService';
import { Alert } from 'react-native';

// Agregar en el componente
const [panicActive, setPanicActive] = useState(false);

// Agregar en useEffect cuando se inicia el viaje
useEffect(() => {
  if (trip && trip.status === 'accepted') {
    // Iniciar grabación de seguridad
    securityService.startSecureRecording(trip.id);
    
    // Iniciar monitoreo de ruta
    securityService.startRouteMonitoring(
      trip.id,
      { lat: trip.origin_lat, lng: trip.origin_lng },
      { lat: trip.dest_lat, lng: trip.dest_lng }
    );
    
    return () => {
      securityService.stopRouteMonitoring();
      securityService.stopSecureRecording();
    };
  }
}, [trip]);

// Agregar botón de pánico en el render
const handlePanic = () => {
  Alert.alert(
    '🚨 Protocolo de Pánico',
    '¿Estás seguro? Se activará la grabación cifrada y se enviará tu ubicación a la central de monitoreo.',
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Activar Pánico',
        style: 'destructive',
        onPress: async () => {
          setPanicActive(true);
          const success = await securityService.triggerPanic(
            trip.id,
            (await authService.getUser())?.id || ''
          );
          setPanicActive(false);
          if (success) {
            Alert.alert('✅ Alerta de pánico enviada', 'La central de monitoreo ha sido notificada.');
          } else {
            Alert.alert('Error', 'No se pudo enviar la alerta. Verifica tu conexión.');
          }
        },
      },
    ]
  );
};
