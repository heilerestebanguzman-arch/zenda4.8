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
import { calculateFare } from '../services/fareService';

// ============================================
// CONFIGURACIÓN
// ============================================
const BASE_URL = 'http://192.168.100.10';
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
  const [errorMsg, setErrorMsg] = useState('');

  // ============================================
  // OBTENER UBICACIÓN
  // ============================================
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permiso de ubicación denegado');
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
    fetchVehicles();
  }, []);

  // ============================================
  // OBTENER VEHÍCULOS
  // ============================================
  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_VEHICLES, { timeout: 8000 });
      const data = response.data.vehicles || response.data.data || [];
      setVehicles(data.length > 0 ? data : getMockVehicles());
    } catch (error) {
      console.warn('Usando vehículos de ejemplo');
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

  const onRefresh = () => { setRefreshing(true); fetchVehicles(); };

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
      // Calcular tarifa (si no hay destino, usar fallback)
      let estimatedFare = 3.50;
      if (destination) {
        // Simular coordenadas del destino (por ahora)
        const destCoords = { lat: -17.4900, lng: -63.1700 };
        estimatedFare = calculateFare(
          location.coords.latitude,
          location.coords.longitude,
          destCoords.lat,
          destCoords.lng
        );
      }

      // Intentar conectar a M20
      try {
        const response = await axios.post(
          `${API_MOBILITY}/request`,
          {
            userId: 'pasajero-test',
            lat: location.coords.latitude,
            lng: location.coords.longitude,
            vehicleType: 'MOTO',
            destination: destination || 'Sin destino',
          },
          { timeout: 5000 }
        );
        console.log('✅ M20 respondió:', response.data);
      } catch (error) {
        console.warn('⚠️ M20 no disponible, usando fallback');
      }

      // Mostrar confirmación
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
      // Simular cálculo de tarifa
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

  const getIcon = (type: string) => {
    const icons: Record<string, string> = {
      MOTO: '🏍️',
      TAXI: '🚖',
      MICRO: '🚐',
      MINIBUS: '🚌',
      BRT: '🚍',
    };
    return icons[type] || '🚗';
  };

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>🏍️ Transporte ZENDA</Text>
        <Text style={styles.subtitle}>Warnes - Tu movilidad urbana</Text>
      </View>

      {/* MAPA */}
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

      {/* SELECTOR DE DESTINO */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="¿A dónde vas? (ej. Mercado Central)"
          placeholderTextColor="#999"
          value={destination}
          onChangeText={handleDestinationChange}
        />
      </View>

      {/* TARIFA ESTIMADA */}
      {fare !== null && (
        <View style={styles.fareContainer}>
          <Text style={styles.fareLabel}>Tarifa estimada:</Text>
          <Text style={styles.fareAmount}>Bs {fare.toFixed(2)}</Text>
        </View>
      )}

      {/* BOTÓN SOLICITAR */}
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

      {/* LISTA DE VEHÍCULOS */}
      <Text style={styles.sectionTitle}>Vehículos disponibles</Text>
      {vehicles.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.icon}>{getIcon(item.type)}</Text>
          <View style={styles.info}>
            <Text style={styles.plate}>{item.plate}</Text>
            <Text style={styles.model}>{item.brand} {item.model}</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
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

      {/* BOTÓN HISTORIAL */}
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
  container: { flex: 1, backgroundColor: '#f0f4f8', padding: 16 },
  header: { marginBottom: 12 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1A3C6E' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },

  mapContainer: {
    height: 300,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#e8ecf0',
  },
  map: { flex: 1 },
  mapLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapLoadingText: { color: '#666', marginTop: 8 },

  inputContainer: { marginBottom: 12 },
  input: {
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
    color: '#333',
    elevation: 2,
  },

  fareContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A3C6E',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  fareLabel: { color: 'white', fontSize: 16 },
  fareAmount: { color: '#F5A623', fontSize: 24, fontWeight: 'bold' },

  requestBtn: {
    backgroundColor: '#4CAF50',
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
  },
  requestBtnDisabled: { backgroundColor: '#9E9E9E' },
  requestBtnText: { color: 'white', fontWeight: 'bold', fontSize: 18 },

  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#444', marginBottom: 8 },

  card: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  icon: { fontSize: 34, marginRight: 12 },
  info: { flex: 1 },
  plate: { fontSize: 17, fontWeight: 'bold', color: '#1A3C6E' },
  model: { fontSize: 13, color: '#666', marginTop: 2 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 12, color: '#666' },

  payBtn: {
    backgroundColor: '#1A3C6E',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  payBtnText: { color: 'white', fontWeight: 'bold', fontSize: 13 },

  historyBtn: {
    backgroundColor: '#F5A623',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
    elevation: 2,
  },
  historyBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});
