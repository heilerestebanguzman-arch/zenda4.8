import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import axios from 'axios';
import { Platform } from 'react-native';

// Detectar la IP automáticamente
const getApiBase = () => {
  // En emulador Android usa 10.0.2.2, en dispositivo real usa la IP de la PC
  if (Platform.OS === 'android') {
    // Para dispositivo real, usa la IP de tu PC en la red local
    return 'http://192.168.100.10:8087';
  }
  return 'http://localhost:8087';
};

const API_BASE = getApiBase();

export default function HomeScreen({ navigation }: any) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/api/v1/vehicles`);
      setVehicles(response.data.data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setVehicles([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchVehicles();
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'MICRO':   return '🚐';
      case 'MINIBUS': return '🚌';
      case 'BRT':     return '🚍';
      case 'TAXI':    return '🚖';
      default:        return '🚗';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🚍 Buses Cercanos</Text>
        <Text style={styles.subtitle}>Encuentra tu transporte</Text>
      </View>

      <FlatList
        data={vehicles}
        keyExtractor={(item: any) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }: { item: any }) => (
          <TouchableOpacity style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.vehicleIcon}>{getVehicleIcon(item.type)}</Text>
              <View style={styles.cardInfo}>
                <Text style={styles.vehiclePlate}>{item.plate}</Text>
                <Text style={styles.vehicleType}>{item.brand} {item.model}</Text>
                <View style={styles.statusContainer}>
                  <View style={[
                    styles.statusDot,
                    { backgroundColor: item.status === 'available' ? '#4CAF50' : '#FF5722' }
                  ]} />
                  <Text style={styles.statusText}>{item.status || 'Disponible'}</Text>
                </View>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.payButton}
                  onPress={() => navigation.navigate('Payment', { vehicle: item })}
                >
                  <Text style={styles.payButtonText}>Pagar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {loading ? 'Cargando vehículos...' : 'No hay vehículos disponibles'}
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.historyButton}
        onPress={() => navigation.navigate('History')}
      >
        <Text style={styles.historyButtonText}>📋 Ver Historial</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:         { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  header:            { marginBottom: 20 },
  title:             { fontSize: 28, fontWeight: 'bold', color: '#1A3C6E' },
  subtitle:          { fontSize: 16, color: '#666', marginTop: 4 },
  card:              { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 3 },
  cardContent:       { flexDirection: 'row', alignItems: 'center' },
  vehicleIcon:       { fontSize: 36, marginRight: 12 },
  cardInfo:          { flex: 1 },
  vehiclePlate:      { fontSize: 18, fontWeight: 'bold', color: '#1A3C6E' },
  vehicleType:       { fontSize: 14, color: '#666', marginTop: 2 },
  statusContainer:   { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  statusDot:         { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText:        { fontSize: 12, color: '#666' },
  cardActions:       { marginLeft: 'auto' },
  payButton:         { backgroundColor: '#1A3C6E', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  payButtonText:     { color: 'white', fontWeight: 'bold', fontSize: 14 },
  emptyContainer:    { padding: 40, alignItems: 'center' },
  emptyText:         { color: '#999', fontSize: 16 },
  historyButton:     { backgroundColor: '#F5A623', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  historyButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});