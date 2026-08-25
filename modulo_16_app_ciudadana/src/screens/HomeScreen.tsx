import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Dimensions, Platform, Alert, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { ServiceSelector } from '../components/ServiceSelector';
import { BottomNavBar } from '../components/BottomNavBar';
import { authService } from '../services/authService';

const { width, height } = Dimensions.get('window');
const API_BASE = 'http://192.168.1.24:3000';
const API_MOBILITY = 'http://192.168.1.24:8103/api/v1/mobility';

export default function HomeScreen() {
  const [location, setLocation] = useState(null);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedService, setSelectedService] = useState('moto');
  const [selectedServiceLabel, setSelectedServiceLabel] = useState('Moto');
  const [mapOpacity, setMapOpacity] = useState(0.7);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isSelectingOrigin, setIsSelectingOrigin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [currentTrip, setCurrentTrip] = useState(null);
  const mapRef = useRef(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const init = async () => {
      // Obtener usuario
      const userData = await authService.getUser();
      setUser(userData);

      // Obtener ubicación
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso de ubicación denegado');
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      setIsMapReady(true);
      setTimeout(() => setMapOpacity(1), 2000);
    };
    init();
  }, []);

  const handleServiceSelect = (service) => {
    setSelectedService(service.id);
    setSelectedServiceLabel(service.label);
    setMapOpacity(1);
  };

  const handleSearchFocus = () => {
    setMapOpacity(1);
    if (mapRef.current && location) {
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 500);
    }
  };

  const requestTrip = async () => {
    if (!origin || !destination) {
      Alert.alert('⚠️ Datos incompletos', 'Por favor, selecciona origen y destino.');
      return;
    }

    if (!location) {
      Alert.alert('⚠️ Ubicación no disponible', 'No se pudo obtener tu ubicación.');
      return;
    }

    setLoading(true);
    try {
      const token = await authService.getToken();
      const vehicleType = selectedService.toUpperCase();

      const payload = {
        userId: user?.id || 'pasajero-test',
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        destination: destination,
        destinationLat: -17.5100,
        destinationLng: -63.1600,
        vehicleType: vehicleType,
      };

      console.log('📤 Enviando solicitud a M20:', payload);

      const response = await axios.post(`${API_MOBILITY}/request`, payload, {
        timeout: 10000,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      console.log('✅ M20 respondió:', response.data);

      if (response.data.success) {
        const tripData = response.data.data || response.data;
        setCurrentTrip({
          tripId: tripData.trip_id || tripData.id,
          plate: tripData.vehicle?.plate || tripData.plate || 'MOTO-001',
          driver: tripData.driver?.name || tripData.driverName || 'Conductor',
          eta: tripData.eta || tripData.estimated_wait || 4,
          status: tripData.status || 'pending',
        });

        Alert.alert(
          '✅ Viaje Confirmado',
          `🚗 Vehículo: ${tripData.vehicle?.plate || tripData.plate || 'MOTO-001'}\n` +
          `👤 Conductor: ${tripData.driver?.name || tripData.driverName || 'Conductor'}\n` +
          `⏱️ Llegada estimada: ${tripData.eta || tripData.estimated_wait || 4} min\n` +
          `💰 Tarifa: Bs ${tripData.fare || '3.50'}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('❌ Error', response.data.message || 'No se pudo solicitar el viaje.');
      }
    } catch (error) {
      console.error('❌ Error en solicitud:', error);
      Alert.alert(
        '❌ Error de Conexión',
        error.response?.data?.message ||
        error.response?.data?.error ||
        'No se pudo conectar con el servidor.'
      );
    } finally {
      setLoading(false);
    }
  };

  const cancelTrip = () => {
    setCurrentTrip(null);
    Alert.alert('✅ Viaje cancelado', 'Tu viaje ha sido cancelado exitosamente.');
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: location?.coords?.latitude || -17.5005,
            longitude: location?.coords?.longitude || -63.1660,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {location && (
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              title="Mi ubicación"
              pinColor="#1A3C6E"
            />
          )}
        </MapView>
        <View style={[styles.mapOverlay, { opacity: mapOpacity }]} />
      </View>

      <View style={styles.headerFloating}>
        <Text style={styles.headerTitle}>ZENDA</Text>
        <TouchableOpacity style={styles.profileBtn}>
          <Ionicons name="person-circle-outline" size={36} color="#1A3C6E" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchFloating}>
        <View style={styles.searchContainer}>
          <Ionicons name="location-outline" size={20} color="#1A3C6E" />
          <TextInput
            style={styles.searchInput}
            placeholder="¿Desde dónde?"
            placeholderTextColor="#94A3B8"
            value={origin}
            onChangeText={setOrigin}
            onFocus={() => { setIsSelectingOrigin(true); handleSearchFocus(); }}
          />
        </View>
        <View style={[styles.searchContainer, { marginTop: 8 }]}>
          <Ionicons name="navigate-outline" size={20} color="#2ECC71" />
          <TextInput
            style={styles.searchInput}
            placeholder="¿A dónde vas?"
            placeholderTextColor="#94A3B8"
            value={destination}
            onChangeText={setDestination}
            onFocus={() => { setIsSelectingOrigin(false); handleSearchFocus(); }}
          />
        </View>
      </View>

      <View style={styles.serviceSelectorContainer}>
        <ServiceSelector
          selectedId={selectedService}
          onSelect={handleServiceSelect}
        />
      </View>

      {currentTrip ? (
        <View style={styles.tripCard}>
          <View style={styles.tripHeader}>
            <Text style={styles.tripTitle}>🏍️ Viaje en curso</Text>
            <Text style={styles.tripStatus}>En camino</Text>
          </View>
          <View style={styles.tripContent}>
            <Text style={styles.tripText}>🚗 Vehículo: {currentTrip.plate}</Text>
            <Text style={styles.tripText}>👤 Conductor: {currentTrip.driver}</Text>
            <Text style={styles.tripText}>⏱️ Llegada: {currentTrip.eta} min</Text>
          </View>
          <TouchableOpacity style={styles.cancelBtn} onPress={cancelTrip}>
            <Text style={styles.cancelText}>Cancelar viaje</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.requestBtn} onPress={requestTrip} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.requestBtnText}>Solicitar {selectedServiceLabel}</Text>
          )}
        </TouchableOpacity>
      )}

      <View style={styles.bottomNavContainer}>
        <BottomNavBar active="home" onSelect={() => {}} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  mapContainer: { ...StyleSheet.absoluteFillObject },
  map: { ...StyleSheet.absoluteFillObject },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    pointerEvents: 'none',
  },
  headerFloating: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
  profileBtn: { backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20, padding: 4 },
  searchFloating: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 80,
    left: 12,
    right: 12,
    zIndex: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  searchInput: { flex: 1, paddingVertical: 14, fontSize: 16, color: '#1E293B', marginLeft: 10 },
  serviceSelectorContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 220 : 200,
    left: 12,
    right: 12,
    zIndex: 10,
  },
  requestBtn: {
    position: 'absolute',
    bottom: 120,
    left: 16,
    right: 16,
    backgroundColor: '#1A3C6E',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#1A3C6E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    zIndex: 10,
  },
  requestBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 17, letterSpacing: 0.5 },
  tripCard: {
    position: 'absolute',
    bottom: 120,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 16,
    elevation: 8,
    zIndex: 10,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tripTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A3C6E' },
  tripStatus: { fontSize: 14, color: '#2ECC71' },
  tripContent: { gap: 4 },
  tripText: { fontSize: 14, color: '#1E293B' },
  cancelBtn: {
    marginTop: 12,
    backgroundColor: '#FEE2E2',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelText: { color: '#EF4444', fontWeight: '600' },
  bottomNavContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 30 : 10,
    left: 16,
    right: 16,
    zIndex: 10,
  },
});
