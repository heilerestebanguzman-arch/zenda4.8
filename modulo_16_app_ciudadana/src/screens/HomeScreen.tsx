import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';
import { authService } from '../services/authService';
import { FavoritesPanel } from '../components/FavoritesPanel';
import { calculateFare } from '../services/fareService';

// ============================================
// CONFIGURACIÓN - CAMBIA A TU IP REAL
// ============================================
const BASE_URL = 'http://192.168.1.67';  // ← CAMBIA ESTA IP
const API_VEHICLES = `${BASE_URL}:8081/api/v1/vehicles`;
const API_MOBILITY = `${BASE_URL}:8103/api/v1/mobility`;

export default function HomeScreen({ navigation }: any) {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [location, setLocation] = useState<any>(null);
  const [destination, setDestination] = useState('');
  const [fare, setFare] = useState<number | null>(null);
  const [user, setUser] = useState<any>(null);

  // ============================================
  // OBTENER USUARIO Y UBICACIÓN
  // ============================================
  useEffect(() => {
    const init = async () => {
      const userData = await authService.getUser();
      setUser(userData);
      console.log('👤 Usuario:', userData?.fullName || 'No logueado');

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

  // ============================================
  // OBTENER VEHÍCULOS
  // ============================================
  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const token = await authService.getToken();
      const response = await axios.get(API_VEHICLES, {
        timeout: 8000,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = response.data.vehicles || response.data.data || [];
      setVehicles(data.length > 0 ? data : getMockVehicles());
    } catch (error) {
      console.warn('⚠️ Usando vehículos de ejemplo');
      setVehicles(getMockVehicles());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getMockVehicles = () => [
    { id: '1', plate: 'MOTO-001', brand: 'Honda', model: 'Wave', type: 'MOTO', status: 'ACTIVE' },
    { id: '2', plate: 'MOTO-002', brand: 'Yamaha', model: 'T110', type: 'MOTO', status: 'ACTIVE' },
    { id: '3', plate: 'TAXI-001', brand: 'Toyota', model: 'Corolla', type: 'TAXI', status: 'ACTIVE' },
  ];

  // ============================================
  // SOLICITAR VIAJE
  // ============================================
  const requestTrip = async () => {
    if (requesting) return;
    if (!location) {
      Alert.alert('Error', 'No se pudo obtener tu ubicación');
      return;
    }

    setRequesting(true);

    try {
      let estimatedFare = 3.50;
      if (destination) {
        const destCoords = { lat: -17.4900, lng: -63.1700 };
        estimatedFare = calculateFare(
          location.coords.latitude,
          location.coords.longitude,
          destCoords.lat,
          destCoords.lng
        );
      }

      try {
        const token = await authService.getToken();
        const response = await axios.post(
          `${API_MOBILITY}/request`,
          {
            userId: user?.id || 'pasajero-test',
            lat: location.coords.latitude,
            lng: location.coords.longitude,
            vehicleType: 'MOTO',
            destination: destination || 'Sin destino',
          },
          {
            timeout: 5000,
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          }
        );
        console.log('✅ M20 respondió:', response.data);
      } catch (error) {
        console.warn('⚠️ M20 no disponible, usando fallback');
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
              Alert.alert(
                '✅ Viaje Confirmado',
                'Su moto-taxi está en camino.\nTiempo estimado: 3-5 minutos.',
                [{ text: 'OK' }]
              );
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

  // ============================================
  // CALCULAR TARIFA EN TIEMPO REAL
  // ============================================
  const handleDestinationChange = (text: string) => {
    setDestination(text);
    if (location && text.length > 3) {
      const estimated = calculateFare(
        location.coords.latitude,
        location.coords.longitude,
        -17.4900,
        -63.1700
      );
      setFare(estimated);
    } else {
      setFare(null);
    }
  };

  const handleFavoriteSelect = (favorite: any) => {
    setDestination(favorite.address);
    if (location) {
      const estimated = calculateFare(
        location.coords.latitude,
        location.coords.longitude,
        favorite.lat,
        favorite.lng
      );
      setFare(estimated);
      Alert.alert(
        '📍 Destino seleccionado',
        `Has seleccionado ${favorite.name} - ${favorite.address}\n💰 Tarifa: Bs ${estimated.toFixed(2)}`
      );
    }
  };

  const getIcon = (type: string) => {
    const icons: Record<string, string> = {
      MOTO: '🏍️', TAXI: '🚖', MICRO: '🚐', MINIBUS: '🚌', BRT: '🚍',
    };
    return icons[type] || '🚗';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏍️ ZENDA</Text>
        <Text style={styles.subtitle}>Warnes - Tu movilidad urbana</Text>
        {user && <Text style={styles.userGreeting}>👋 Hola, {user.fullName || user.firstName || 'Pasajero'}</Text>}
      </View>

      <View style={styles.mapContainer}>
        {location ? (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            showsUserLocation={true}
            showsMyLocationButton={true}
          >
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              title="Mi ubicación"
              pinColor="#1A3C6E"
            />
          </MapView>
        ) : (
          <View style={styles.mapLoading}>
            <ActivityIndicator size="large" color="#1A3C6E" />
            <Text style={styles.mapLoadingText}>Obteniendo ubicación...</Text>
          </View>
        )}
      </View>

      <FavoritesPanel onSelectFavorite={handleFavoriteSelect} />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="¿A dónde vas? (ej. Mercado Central)"
          placeholderTextColor="#94A3B8"
          value={destination}
          onChangeText={handleDestinationChange}
        />
      </View>

      {fare !== null && (
        <View style={styles.fareContainer}>
          <Text style={styles.fareLabel}>Tarifa estimada:</Text>
          <Text style={styles.fareAmount}>Bs {fare.toFixed(2)}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.requestBtn, requesting && styles.requestBtnDisabled]}
        onPress={requestTrip}
        disabled={requesting}
        activeOpacity={0.7}
      >
        {requesting ? (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <ActivityIndicator color="white" size="small" />
            <Text style={[styles.requestBtnText, { marginLeft: 10 }]}>
              Buscando moto...
            </Text>
          </View>
        ) : (
          <Text style={styles.requestBtnText}>🛵 Solicitar Moto-Taxi</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>🚗 Vehículos disponibles</Text>
      {vehicles.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.icon}>{getIcon(item.type)}</Text>
          <View style={styles.info}>
            <Text style={styles.plate}>{item.plate}</Text>
            <Text style={styles.model}>{item.brand} {item.model}</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: '#2ECC71' }]} />
              <Text style={styles.statusText}>Disponible</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.payBtn}
            onPress={() => navigation.navigate('Payment', { vehicle: item })}
            activeOpacity={0.7}
          >
            <Text style={styles.payBtnText}>Pagar</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity
        style={styles.historyBtn}
        onPress={() => navigation.navigate('History')}
        activeOpacity={0.7}
      >
        <Text style={styles.historyBtnText}>📋 Ver Historial</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', padding: 16 },
  header: { marginBottom: 12 },
  title: { fontSize: 26, fontWeight: '900', color: '#FFFFFF', letterSpacing: 1 },
  subtitle: { fontSize: 13, color: '#94A3B8', marginTop: 2 },
  userGreeting: { fontSize: 14, color: '#2ECC71', marginTop: 4 },

  mapContainer: { height: 280, borderRadius: 16, overflow: 'hidden', marginBottom: 12, backgroundColor: '#1E293B' },
  map: { flex: 1 },
  mapLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  mapLoadingText: { color: '#94A3B8', marginTop: 8 },

  inputContainer: { marginBottom: 12 },
  input: { backgroundColor: '#F8FAFC', padding: 14, borderRadius: 12, fontSize: 15, color: '#0F172A', borderWidth: 1, borderColor: '#E2E8F0' },

  fareContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1E293B', padding: 14, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#2ECC71' },
  fareLabel: { color: '#94A3B8', fontSize: 14 },
  fareAmount: { color: '#2ECC71', fontSize: 22, fontWeight: 'bold' },

  requestBtn: { backgroundColor: '#1A3C6E', padding: 16, borderRadius: 14, alignItems: 'center', marginBottom: 16, elevation: 4, shadowColor: '#1A3C6E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6 },
  requestBtnDisabled: { backgroundColor: '#475569' },
  requestBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 17, letterSpacing: 0.5 },

  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#FFFFFF', marginBottom: 8 },

  card: { backgroundColor: '#1E293B', borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  icon: { fontSize: 34, marginRight: 12 },
  info: { flex: 1 },
  plate: { fontSize: 17, fontWeight: 'bold', color: '#FFFFFF' },
  model: { fontSize: 13, color: '#94A3B8', marginTop: 2 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 12, color: '#94A3B8' },

  payBtn: { backgroundColor: '#1A3C6E', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  payBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },

  historyBtn: { backgroundColor: '#1E293B', padding: 14, borderRadius: 14, alignItems: 'center', marginTop: 8, marginBottom: 20, borderWidth: 1, borderColor: '#334155' },
  historyBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
});
