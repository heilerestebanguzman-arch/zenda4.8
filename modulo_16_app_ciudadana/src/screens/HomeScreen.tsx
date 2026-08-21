import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Dimensions,
  Keyboard,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';
import { authService } from '../services/authService';
import { calculateFare } from '../services/fareService';
import { Ionicons } from '@expo/vector-icons';
import { ServiceSelector } from '../components/ServiceSelector';
import { BottomNavBar } from '../components/BottomNavBar';

const { width, height } = Dimensions.get('window');
const API_BASE = 'http://192.168.1.3:3000';
const API_VEHICLES = `http://192.168.1.3:8081/api/v1/vehicles`;
const API_MOBILITY = `http://192.168.1.3:8103/api/v1/mobility`;

// ⚠️ IMPORTANTE: Reemplazar con tu API Key de Google Maps
const GOOGLE_MAPS_API_KEY = 'AIzaSyB...';

const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
    const response = await axios.get(url);
    const data = response.data;
    if (data.status === 'OK' && data.results.length > 0) {
      return data.results[0].formatted_address.split(',')[0] || data.results[0].formatted_address;
    }
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch (error) {
    console.warn('⚠️ Error en geocodificación:', error);
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
};

const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;
    const response = await axios.get(url);
    const data = response.data;
    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng,
      };
    }
    return null;
  } catch (error) {
    console.warn('⚠️ Error en geocodificación directa:', error);
    return null;
  }
};

export default function HomeScreen({ navigation }: any) {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [location, setLocation] = useState<any>(null);
  const [destination, setDestination] = useState('');
  const [destinationCoords, setDestinationCoords] = useState<any>(null);
  const [fare, setFare] = useState<number | null>(null);
  const [user, setUser] = useState<any>(null);
  const [showDestinationMarker, setShowDestinationMarker] = useState(false);
  const [currentTrip, setCurrentTrip] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedService, setSelectedService] = useState('moto');
  const [activeNav, setActiveNav] = useState('home');

  const mapRef = useRef<MapView>(null);
  const searchInputRef = useRef<TextInput>(null);

  useEffect(() => {
    const init = async () => {
      const userData = await authService.getUser();
      setUser(userData);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Error', 'Permiso de ubicación denegado');
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      fetchVehicles();
    };
    init();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const token = await authService.getToken();
      const response = await axios.get(API_VEHICLES, {
        timeout: 8000,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = response.data.vehicles || response.data.data || [];
      const motos = data.filter((v: any) => v.type === 'MOTO' || v.type === 'moto');
      setVehicles(motos.length > 0 ? motos : getMockVehicles());
    } catch (error) {
      console.warn('⚠️ Usando vehículos de ejemplo');
      setVehicles(getMockVehicles());
    } finally {
      setLoading(false);
    }
  };

  const getMockVehicles = () => [
    { id: '1', plate: 'MOTO-001', brand: 'Honda', model: 'Wave', type: 'MOTO', status: 'ACTIVE' },
    { id: '2', plate: 'MOTO-002', brand: 'Yamaha', model: 'T110', type: 'MOTO', status: 'ACTIVE' },
  ];

  const handleMapPress = async (event: any) => {
    try {
      const { latitude, longitude } = event.nativeEvent.coordinate;
      console.log('📍 Mapa presionado:', latitude, longitude);
      setDestinationCoords({ latitude, longitude });
      setShowDestinationMarker(true);
      const address = await reverseGeocode(latitude, longitude);
      setDestination(address);
      if (location) {
        const estimated = calculateFare(
          location.coords.latitude,
          location.coords.longitude,
          latitude,
          longitude
        );
        setFare(estimated);
      }
      Alert.alert('📍 Destino marcado', `Has seleccionado:\n${address}\n💰 Tarifa estimada: Bs ${fare?.toFixed(2) || '3.50'}`);
    } catch (error) {
      console.warn('⚠️ Error al marcar destino:', error);
      Alert.alert('Error', 'No se pudo marcar el destino. Intenta de nuevo.');
    }
  };

  const searchAddress = async (text: string) => {
    setDestination(text);
    if (text.length > 3) {
      setShowResults(true);
      try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(text)}&key=${GOOGLE_MAPS_API_KEY}`;
        const response = await axios.get(url);
        const data = response.data;
        if (data.status === 'OK') {
          setSearchResults(data.results);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.warn('⚠️ Error en búsqueda:', error);
        setSearchResults([]);
      }
    } else {
      setShowResults(false);
      setSearchResults([]);
    }
  };

  const selectSearchResult = async (result: any) => {
    const lat = result.geometry.location.lat;
    const lng = result.geometry.location.lng;
    setDestinationCoords({ latitude: lat, longitude: lng });
    setShowDestinationMarker(true);
    setDestination(result.formatted_address.split(',')[0]);
    setShowResults(false);
    Keyboard.dismiss();
    if (location) {
      const estimated = calculateFare(
        location.coords.latitude,
        location.coords.longitude,
        lat,
        lng
      );
      setFare(estimated);
    }
    mapRef.current?.animateToRegion({
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 1000);
  };

  const requestTrip = async () => {
    if (requesting) return;
    if (!location) {
      Alert.alert('Error', 'No se pudo obtener tu ubicación');
      return;
    }
    setRequesting(true);
    try {
      let estimatedFare = 3.50;
      let destLat = null;
      let destLng = null;
      if (destinationCoords) {
        destLat = destinationCoords.latitude;
        destLng = destinationCoords.longitude;
        estimatedFare = calculateFare(
          location.coords.latitude,
          location.coords.longitude,
          destLat,
          destLng
        );
      } else if (destination) {
        destLat = -17.4900;
        destLng = -63.1700;
        estimatedFare = calculateFare(
          location.coords.latitude,
          location.coords.longitude,
          destLat,
          destLng
        );
      }
      let tripData = null;
      try {
        const token = await authService.getToken();
        const response = await axios.post(
          `${API_MOBILITY}/request`,
          {
            userId: user?.id || 'pasajero-test',
            lat: location.coords.latitude,
            lng: location.coords.longitude,
            destination: destination || 'Sin destino',
            destinationLat: destLat,
            destinationLng: destLng,
            vehicleType: selectedService.toUpperCase(),
          },
          {
            timeout: 5000,
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          }
        );
        console.log('✅ M20 respondió:', response.data);
        tripData = response.data?.data || response.data;
      } catch (error) {
        console.warn('⚠️ M20 no disponible, usando fallback');
        tripData = {
          trip_id: 'TRIP-' + Date.now(),
          vehicle: { plate: 'MOTO-001' },
          driver: { name: 'Juan Pérez' },
          eta: 4,
        };
      }
      Alert.alert(
        '🛵 Solicitar Moto-Taxi',
        `📍 Origen: ${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}\n` +
        `📍 Destino: ${destination || 'No especificado'}\n` +
        `💰 Tarifa estimada: Bs ${estimatedFare.toFixed(2)}\n\n` +
        `¿Confirmar viaje?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: '✅ Confirmar',
            onPress: () => {
              if (tripData) {
                setCurrentTrip({
                  tripId: tripData.trip_id || tripData.id || 'TRIP-' + Date.now(),
                  plate: tripData.vehicle?.plate || tripData.plate || 'MOTO-001',
                  driver: tripData.driver?.name || tripData.driverName || 'Juan Pérez',
                  eta: tripData.eta || tripData.estimated_wait || 4,
                  destination: destination || 'Sin destino',
                });
              }
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('❌ Error', 'No se pudo solicitar el viaje. Verifica tu conexión.');
    } finally {
      setRequesting(false);
    }
  };

  const handleFavoriteSelect = (favorite: any) => {
    setDestination(favorite.address);
    setDestinationCoords({ latitude: favorite.lat, longitude: favorite.lng });
    setShowDestinationMarker(true);
    if (location) {
      const estimated = calculateFare(
        location.coords.latitude,
        location.coords.longitude,
        favorite.lat,
        favorite.lng
      );
      setFare(estimated);
    }
    mapRef.current?.animateToRegion({
      latitude: favorite.lat,
      longitude: favorite.lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 1000);
  };

  const handleNavSelect = (id: string) => {
    setActiveNav(id);
    if (id === 'history') {
      navigation.navigate('History');
    } else if (id === 'profile') {
      navigation.navigate('Profile');
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.fullMap}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: location?.coords?.latitude || -17.5005,
          longitude: location?.coords?.longitude || -63.1660,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
        onPress={handleMapPress}
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
        {showDestinationMarker && destinationCoords && (
          <Marker
            coordinate={destinationCoords}
            title="Destino"
            pinColor="#F5A623"
          />
        )}
      </MapView>

      <View style={styles.headerFloating}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>ZENDA</Text>
          <Text style={styles.headerSubtitle}>Warnes</Text>
        </View>
        <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person-circle-outline" size={36} color="#1A3C6E" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchFloating}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#94A3B8" />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="¿A dónde vas?"
            placeholderTextColor="#94A3B8"
            value={destination}
            onChangeText={searchAddress}
            onFocus={() => setShowResults(true)}
            returnKeyType="search"
          />
        </View>
        {showResults && searchResults.length > 0 && (
          <View style={styles.resultsContainer}>
            {searchResults.map((result, index) => (
              <TouchableOpacity
                key={index}
                style={styles.resultItem}
                onPress={() => selectSearchResult(result)}
              >
                <Ionicons name="location-outline" size={18} color="#1A3C6E" />
                <Text style={styles.resultText} numberOfLines={1}>
                  {result.formatted_address.split(',')[0]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.serviceSelectorContainer}>
        <ServiceSelector
          selectedId={selectedService}
          onSelect={(service) => setSelectedService(service.id)}
        />
      </View>

      {fare !== null && !currentTrip && (
        <View style={styles.fareFloating}>
          <Text style={styles.fareLabel}>Tarifa estimada</Text>
          <Text style={styles.fareAmount}>Bs {fare.toFixed(2)}</Text>
        </View>
      )}

      {currentTrip && (
        <View style={styles.tripFloating}>
          <View style={styles.tripInfo}>
            <Ionicons name="bicycle-outline" size={24} color="#2ECC71" />
            <View>
              <Text style={styles.tripPlate}>{currentTrip.plate}</Text>
              <Text style={styles.tripDriver}>{currentTrip.driver}</Text>
            </View>
            <View style={styles.tripEta}>
              <Text style={styles.tripEtaText}>{currentTrip.eta} min</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.tripCancelBtn} onPress={() => setCurrentTrip(null)}>
            <Text style={styles.tripCancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      )}

      {!currentTrip && (
        <TouchableOpacity
          style={[styles.requestBtn, requesting && styles.requestBtnDisabled]}
          onPress={requestTrip}
          disabled={requesting}
          activeOpacity={0.8}
        >
          {requesting ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.requestBtnText}>
              Solicitar {selectedService === 'moto' ? 'Moto' : selectedService === 'taxi' ? 'Auto' : selectedService === 'minibus' ? 'Minibus' : 'Envío'}
            </Text>
          )}
        </TouchableOpacity>
      )}

      <View style={styles.bottomNavContainer}>
        <BottomNavBar active={activeNav} onSelect={handleNavSelect} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  fullMap: { ...StyleSheet.absoluteFillObject },

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
  headerLeft: { flexDirection: 'column' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1A3C6E', letterSpacing: 1 },
  headerSubtitle: { fontSize: 12, color: '#64748B' },
  profileBtn: { backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20, padding: 4 },

  searchFloating: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 110 : 90,
    left: 16,
    right: 16,
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
  resultsContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    marginTop: 8,
    paddingVertical: 8,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  resultItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16, gap: 12 },
  resultText: { fontSize: 14, color: '#1E293B', flex: 1 },

  serviceSelectorContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 195 : 175,
    left: 0,
    right: 0,
    zIndex: 10,
  },

  fareFloating: {
    position: 'absolute',
    bottom: 180,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    zIndex: 10,
  },
  fareLabel: { fontSize: 14, color: '#64748B' },
  fareAmount: { fontSize: 18, fontWeight: 'bold', color: '#F5A623' },

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
  requestBtnDisabled: { backgroundColor: '#94A3B8' },
  requestBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 17, letterSpacing: 0.5 },

  tripFloating: {
    position: 'absolute',
    bottom: 120,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    zIndex: 10,
  },
  tripInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tripPlate: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  tripDriver: { fontSize: 14, color: '#64748B' },
  tripEta: { marginLeft: 'auto', backgroundColor: '#2ECC71', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  tripEtaText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  tripCancelBtn: { marginTop: 12, backgroundColor: '#FEE2E2', padding: 8, borderRadius: 10, alignItems: 'center' },
  tripCancelText: { color: '#EF4444', fontWeight: '600', fontSize: 14 },

  bottomNavContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 30 : 10,
    left: 16,
    right: 16,
    zIndex: 10,
  },
});
