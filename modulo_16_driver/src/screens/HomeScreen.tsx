import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Switch,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../services/authService';
import axios from 'axios';
import { BottomNavBar } from '../components/BottomNavBar';
import { StatusBadge } from '../components/StatusBadge';

const API_MOBILITY = 'http://192.168.1.88:8103/api/v1/mobility';

interface Request {
  id: string;
  user_id: string;
  user_name: string;
  origin_address: string;
  destination_address: string;
  vehicle_type: string;
  fare: number;
  distance: number;
  created_at: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
}

export default function HomeScreen({ navigation }: any) {
  const [isOnline, setIsOnline] = useState(true);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [acceptedRequest, setAcceptedRequest] = useState<Request | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadRequests();
    startPolling();
    return () => stopPolling();
  }, []);

  const startPolling = () => {
    intervalRef.current = setInterval(() => {
      if (isOnline) {
        loadRequests(false);
      }
    }, 10000); // Actualizar cada 10 segundos
  };

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const loadRequests = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const token = await authService.getToken();
      const user = await authService.getUser();

      if (!user?.id) {
        console.log('⚠️ Usuario no autenticado');
        return;
      }

      const response = await axios.get(`${API_MOBILITY}/nearby`, {
        params: {
          driverId: user.id,
          lat: -17.5206,
          lng: -63.1732,
          radius: 5,
        },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        timeout: 5000,
      });

      if (response.data.success) {
        setRequests(response.data.data || []);
      }
    } catch (error) {
      console.error('❌ Error loading requests:', error);
    } finally {
      if (showLoading) setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadRequests();
  };

  const handleAcceptRequest = async (request: Request) => {
    Alert.alert(
      '✅ Aceptar Solicitud',
      `¿Deseas aceptar este viaje?\n\n` +
      `🚗 ${request.vehicle_type}\n` +
      `📍 ${request.origin_address}\n` +
      `🎯 ${request.destination_address}\n` +
      `💰 Bs ${request.fare.toFixed(2)}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aceptar',
          onPress: async () => {
            try {
              const token = await authService.getToken();
              const user = await authService.getUser();

              const response = await axios.post(
                `${API_MOBILITY}/request/accept`,
                {
                  requestId: request.id,
                  driverId: user?.id,
                },
                {
                  headers: token ? { Authorization: `Bearer ${token}` } : {},
                }
              );

              if (response.data.success) {
                setAcceptedRequest(request);
                Alert.alert('✅ Viaje aceptado', 'Dirígete al punto de recogida.');
                navigation.navigate('Trip', { tripId: request.id });
              } else {
                Alert.alert('❌ Error', 'No se pudo aceptar el viaje.');
              }
            } catch (error) {
              Alert.alert('❌ Error', 'Error al conectar con el servidor.');
            }
          },
        },
      ]
    );
  };

  const renderRequestItem = ({ item }: { item: Request }) => (
    <TouchableOpacity
      style={styles.requestCard}
      onPress={() => handleAcceptRequest(item)}
      activeOpacity={0.7}
    >
      <View style={styles.requestHeader}>
        <View style={styles.requestLeft}>
          <View style={styles.requestIcon}>
            <Ionicons name="person-outline" size={20} color="#1A3C6E" />
          </View>
          <View>
            <Text style={styles.requestUser}>{item.user_name || 'Pasajero'}</Text>
            <Text style={styles.requestTime}>
              {new Date(item.created_at).toLocaleTimeString('es-BO')}
            </Text>
          </View>
        </View>
        <StatusBadge status={item.status} />
      </View>

      <View style={styles.requestRoute}>
        <View style={styles.routePoint}>
          <Ionicons name="location-outline" size={16} color="#1A3C6E" />
          <Text style={styles.routeText} numberOfLines={1}>
            {item.origin_address || 'Origen no especificado'}
          </Text>
        </View>
        <View style={styles.routeLine} />
        <View style={styles.routePoint}>
          <Ionicons name="navigate-outline" size={16} color="#2ECC71" />
          <Text style={styles.routeText} numberOfLines={1}>
            {item.destination_address || 'Destino no especificado'}
          </Text>
        </View>
      </View>

      <View style={styles.requestFooter}>
        <View style={styles.requestMeta}>
          <Ionicons name="car-outline" size={14} color="#94A3B8" />
          <Text style={styles.metaText}>{item.vehicle_type}</Text>
          <Ionicons name="cash-outline" size={14} color="#94A3B8" />
          <Text style={styles.metaText}>Bs {item.fare.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={styles.acceptBtn}
          onPress={() => handleAcceptRequest(item)}
        >
          <Text style={styles.acceptBtnText}>Aceptar</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="car-outline" size={64} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>No hay solicitudes</Text>
      <Text style={styles.emptySubtitle}>
        Las solicitudes de viaje aparecerán aquí cuando estén disponibles.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>📋 Solicitudes</Text>
        </View>
        <View style={styles.statusContainer}>
          <Text style={[styles.statusText, isOnline ? styles.statusOnline : styles.statusOffline]}>
            {isOnline ? '🟢 Disponible' : '🔴 Desconectado'}
          </Text>
          <Switch
            value={isOnline}
            onValueChange={setIsOnline}
            trackColor={{ false: '#D1D5DB', true: '#2ECC71' }}
            thumbColor={isOnline ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>
      </View>

      {/* Lista de solicitudes */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1A3C6E" />
          <Text style={styles.loadingText}>Buscando solicitudes cercanas...</Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderRequestItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={renderEmptyState}
        />
      )}

      {/* Bottom Navigation */}
      <View style={styles.bottomNavContainer}>
        <BottomNavBar active="home" onSelect={(id: string) => {
          if (id === 'home') return;
          if (id === 'history') navigation.navigate('History');
          if (id === 'earnings') navigation.navigate('Earnings');
          if (id === 'profile') navigation.navigate('Profile');
        }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1E293B' },
  statusContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusText: { fontSize: 12, fontWeight: '600' },
  statusOnline: { color: '#2ECC71' },
  statusOffline: { color: '#EF4444' },
  listContent: { padding: 16, paddingBottom: 100 },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  requestHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  requestLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  requestIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestUser: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
  requestTime: { fontSize: 12, color: '#94A3B8' },
  requestRoute: { marginVertical: 12, paddingLeft: 4 },
  routePoint: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  routeLine: { width: 2, height: 12, backgroundColor: '#E2E8F0', marginLeft: 11 },
  routeText: { fontSize: 14, color: '#1E293B', flex: 1 },
  requestFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  requestMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaText: { fontSize: 13, color: '#64748B' },
  acceptBtn: {
    backgroundColor: '#2ECC71',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  acceptBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#94A3B8' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#1E293B', marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: '#94A3B8', marginTop: 8, textAlign: 'center' },
  bottomNavContainer: { position: 'absolute', bottom: 20, left: 16, right: 16, zIndex: 10 },
});
