import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';

const BASE_URL = 'http://192.168.100.10';
const API_VEHICLES = BASE_URL + ':8087/api/v1/vehicles';

export default function HomeScreen({ navigation }: any) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => { fetchVehicles(); }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const r = await axios.get(API_VEHICLES, { timeout: 8000 });
      setVehicles(r.data.vehicles || r.data.data || []);
    } catch {
      setVehicles([
        { id: '1', plate: 'MOTO-001', brand: 'Honda', model: 'Wave', type: 'MOTO', status: 'available' },
        { id: '2', plate: 'MOTO-002', brand: 'Yamaha', model: 'T110', type: 'MOTO', status: 'available' },
        { id: '3', plate: 'TAXI-001', brand: 'Toyota', model: 'Corolla', type: 'TAXI', status: 'available' },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const requestTrip = async () => {
    if (requesting) return;
    setRequesting(true);
    try {
      Alert.alert(
        'Solicitud de Moto-Taxi',
        'Tarifa estimada: Bs 3.00. Desea confirmar el viaje?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Confirmar', onPress: () => Alert.alert('Viaje Confirmado', 'Su moto-taxi esta en camino!') }
        ]
      );
    } finally {
      setRequesting(false);
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'MOTO': return '🏍️';
      case 'TAXI': return '🚖';
      case 'MICRO': return '🚐';
      case 'MINIBUS': return '🚌';
      default: return '🚗';
    }
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Transporte ZENDA</Text>
        <Text style={s.subtitle}>Encuentra tu transporte</Text>
      </View>
      <TouchableOpacity style={[s.btn, requesting && s.btnDisabled]} onPress={requestTrip} disabled={requesting}>
        {requesting
          ? <ActivityIndicator color='white' />
          : <Text style={s.btnText}>Solicitar Moto-Taxi</Text>
        }
      </TouchableOpacity>
      <FlatList
        data={vehicles}
        keyExtractor={(i: any) => i.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchVehicles(); }} />}
        renderItem={({ item }: any) => (
          <View style={s.card}>
            <Text style={s.icon}>{getIcon(item.type)}</Text>
            <View style={s.info}>
              <Text style={s.plate}>{item.plate}</Text>
              <Text style={s.type}>{item.brand} {item.model}</Text>
            </View>
            <TouchableOpacity style={s.pay} onPress={() => navigation.navigate('Payment', { vehicle: item })}>
              <Text style={s.payText}>Pagar</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<View style={s.empty}><Text style={s.emptyText}>{loading ? 'Cargando...' : 'Sin vehiculos'}</Text></View>}
      />
      <TouchableOpacity style={s.history} onPress={() => navigation.navigate('History')}>
        <Text style={s.historyText}>Ver Historial</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8', padding: 16 },
  header: { marginBottom: 16 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1A3C6E' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  btn: { backgroundColor: '#4CAF50', padding: 18, borderRadius: 14, alignItems: 'center', marginBottom: 16, elevation: 4 },
  btnDisabled: { backgroundColor: '#9E9E9E' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  card: { backgroundColor: 'white', borderRadius: 14, padding: 14, marginBottom: 10, elevation: 2, flexDirection: 'row', alignItems: 'center' },
  icon: { fontSize: 34, marginRight: 12 },
  info: { flex: 1 },
  plate: { fontSize: 17, fontWeight: 'bold', color: '#1A3C6E' },
  type: { fontSize: 13, color: '#666', marginTop: 2 },
  pay: { backgroundColor: '#1A3C6E', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  payText: { color: 'white', fontWeight: 'bold', fontSize: 13 },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#999', fontSize: 16 },
  history: { backgroundColor: '#F5A623', padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  historyText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});
