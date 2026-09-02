import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../services/authService';
import axios from 'axios';
import { BottomNavBar } from '../components/BottomNavBar';
import RatingModal from '../components/RatingModal';

const API_MOBILITY = 'http://192.168.1.200:8103/api/v1/mobility';

interface Trip {
  id: string;
  user_id: string;
  vehicle_type: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  origin_address: string;
  destination_address: string;
  fare: number;
  created_at: string;
  completed_at?: string;
  driver_name?: string;
  driver_phone?: string;
  vehicle_plate?: string;
  rating?: number;
}

export default function HistoryScreen({ navigation }: any) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [ratingTripId, setRatingTripId] = useState('');
  const [filter, setFilter] = useState<'all' | 'completed' | 'cancelled' | 'in_progress'>('all');

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const token = await authService.getToken();
      const user = await authService.getUser();
      
      if (!user?.id) {
        Alert.alert('Error', 'Usuario no autenticado');
        return;
      }

      const response = await axios.get(`${API_MOBILITY}/trips`, {
        params: { 
          userId: user.id,
          limit: 50,
          status: filter !== 'all' ? filter : undefined
        },
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (response.data.success) {
        setTrips(response.data.data || []);
      } else {
        setTrips(getMockTrips());
      }
    } catch (error) {
      console.error('Error loading trips:', error);
      setTrips(getMockTrips());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getMockTrips = (): Trip[] => {
    return [
      {
        id: '1',
        user_id: 'user-1',
        vehicle_type: 'MOTO',
        status: 'completed',
        origin_address: 'Av. Libertad 123',
        destination_address: 'Mercado Central',
        fare: 3.50,
        created_at: '2026-08-29T10:30:00Z',
        completed_at: '2026-08-29T10:45:00Z',
        driver_name: 'Carlos Mamani',
        driver_phone: '+591 71234567',
        vehicle_plate: 'MOTO-001',
        rating: 0
      },
      {
        id: '2',
        user_id: 'user-1',
        vehicle_type: 'TAXI',
        status: 'completed',
        origin_address: 'Terminal de Buses',
        destination_address: 'Hospital San Juan',
        fare: 5.00,
        created_at: '2026-08-28T18:15:00Z',
        completed_at: '2026-08-28T18:30:00Z',
        driver_name: 'María Flores',
        driver_phone: '+591 76543210',
        vehicle_plate: 'TAXI-001',
        rating: 0
      },
      {
        id: '3',
        user_id: 'user-1',
        vehicle_type: 'MOTO',
        status: 'in_progress',
        origin_address: 'Plaza Principal',
        destination_address: 'Barrio Los Pinos',
        fare: 3.00,
        created_at: '2026-08-29T13:00:00Z',
        driver_name: 'Juan Pérez',
        driver_phone: '+591 79876543',
        vehicle_plate: 'MOTO-002'
      },
      {
        id: '4',
        user_id: 'user-1',
        vehicle_type: 'MINIBUS',
        status: 'cancelled',
        origin_address: 'Av. San Martín',
        destination_address: 'Zona Norte',
        fare: 2.50,
        created_at: '2026-08-24T09:00:00Z',
        driver_name: 'Pedro Gutiérrez',
        driver_phone: '+591 72345678',
        vehicle_plate: 'MINI-001'
      },
      {
        id: '5',
        user_id: 'user-1',
        vehicle_type: 'TAXI',
        status: 'completed',
        origin_address: 'Universidad Autónoma',
        destination_address: 'Parque Central',
        fare: 4.50,
        created_at: '2026-08-23T16:20:00Z',
        completed_at: '2026-08-23T16:40:00Z',
        driver_name: 'Ana Rojas',
        driver_phone: '+591 73456789',
        vehicle_plate: 'TAXI-002',
        rating: 0
      }
    ];
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTrips();
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return '#2ECC71';
      case 'in_progress': return '#F5A623';
      case 'cancelled': return '#EF4444';
      case 'pending': return '#3B82F6';
      default: return '#94A3B8';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'completed': return 'checkmark-circle-outline';
      case 'in_progress': return 'time-outline';
      case 'cancelled': return 'close-circle-outline';
      case 'pending': return 'ellipse-outline';
      default: return 'help-circle-outline';
    }
  };

  const getVehicleIcon = (type: string) => {
    switch(type) {
      case 'MOTO': return 'bicycle-outline';
      case 'TAXI': return 'car-outline';
      case 'MINIBUS': return 'bus-outline';
      default: return 'car-outline';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return 'Hace unos minutos';
    if (hours < 24) return `Hace ${hours}h`;
    if (days < 7) return `Hace ${days}d`;
    return date.toLocaleDateString('es-BO');
  };

  const handleTripPress = (trip: Trip) => {
    setSelectedTrip(trip);
    setModalVisible(true);
  };

  // ✅ ABRIR MODAL DE CALIFICACIÓN
  const openRatingModal = (tripId: string) => {
    setRatingTripId(tripId);
    setRatingModalVisible(true);
  };

  const renderTripItem = ({ item }: { item: Trip }) => (
    <TouchableOpacity 
      style={styles.tripCard} 
      onPress={() => handleTripPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.tripHeader}>
        <View style={styles.tripLeft}>
          <View style={[styles.iconCircle, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Ionicons name={getVehicleIcon(item.vehicle_type)} size={20} color={getStatusColor(item.status)} />
          </View>
          <View>
            <Text style={styles.tripType}>{item.vehicle_type}</Text>
            <Text style={styles.tripRoute}>
              {item.origin_address.split(',')[0]} → {item.destination_address.split(',')[0]}
            </Text>
          </View>
        </View>
        <View style={styles.tripRight}>
          <Text style={styles.tripFare}>Bs {item.fare.toFixed(2)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Ionicons name={getStatusIcon(item.status)} size={12} color={getStatusColor(item.status)} />
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status === 'completed' ? 'Completado' : 
               item.status === 'in_progress' ? 'En curso' :
               item.status === 'cancelled' ? 'Cancelado' : 'Pendiente'}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.tripFooter}>
        <Text style={styles.tripDate}>
          <Ionicons name="calendar-outline" size={14} color="#94A3B8" />
          {' '}{formatDate(item.created_at)}
        </Text>
        {item.driver_name && (
          <Text style={styles.tripDriver}>
            <Ionicons name="person-outline" size={14} color="#94A3B8" />
            {' '}{item.driver_name}
          </Text>
        )}
        {item.rating && item.rating > 0 ? (
          <View style={styles.ratingStars}>
            {[1,2,3,4,5].map(star => (
              <Ionicons 
                key={star} 
                name={star <= item.rating ? 'star' : 'star-outline'} 
                size={14} 
                color={star <= item.rating ? '#F5A623' : '#D1D5DB'} 
              />
            ))}
          </View>
        ) : item.status === 'completed' && (
          <TouchableOpacity 
            style={styles.rateBtn}
            onPress={() => openRatingModal(item.id)}
          >
            <Text style={styles.rateBtnText}>⭐ Calificar</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="time-outline" size={64} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>No hay viajes aún</Text>
      <Text style={styles.emptySubtitle}>Tus viajes aparecerán aquí cuando solicites uno.</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📋 Historial de Viajes</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {['all', 'completed', 'in_progress', 'cancelled'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => { setFilter(f as any); loadTrips(); }}
          >
            <Text style={[styles.filterChipText, filter === f && styles.filterChipTextActive]}>
              {f === 'all' ? 'Todos' : 
               f === 'completed' ? '✅ Completados' :
               f === 'in_progress' ? '⏳ En curso' : '❌ Cancelados'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1A3C6E" />
          <Text style={styles.loadingText}>Cargando tus viajes...</Text>
        </View>
      ) : (
        <FlatList
          data={trips}
          renderItem={renderTripItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={renderEmptyState}
        />
      )}

      {/* Modal de detalles del viaje */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            
            {selectedTrip && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {selectedTrip.vehicle_type} - {selectedTrip.status}
                  </Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close-outline" size={28} color="#1E293B" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  <View style={styles.detailRow}>
                    <Ionicons name="location-outline" size={20} color="#1A3C6E" />
                    <View>
                      <Text style={styles.detailLabel}>Origen</Text>
                      <Text style={styles.detailValue}>{selectedTrip.origin_address}</Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <Ionicons name="navigate-outline" size={20} color="#2ECC71" />
                    <View>
                      <Text style={styles.detailLabel}>Destino</Text>
                      <Text style={styles.detailValue}>{selectedTrip.destination_address}</Text>
                    </View>
                  </View>

                  <View style={styles.detailDivider} />

                  <View style={styles.detailRow}>
                    <Ionicons name="cash-outline" size={20} color="#F5A623" />
                    <View>
                      <Text style={styles.detailLabel}>Costo</Text>
                      <Text style={styles.detailValue}>Bs {selectedTrip.fare.toFixed(2)}</Text>
                    </View>
                  </View>

                  {selectedTrip.driver_name && (
                    <View style={styles.detailRow}>
                      <Ionicons name="person-outline" size={20} color="#1A3C6E" />
                      <View>
                        <Text style={styles.detailLabel}>Conductor</Text>
                        <Text style={styles.detailValue}>{selectedTrip.driver_name}</Text>
                        {selectedTrip.driver_phone && (
                          <Text style={styles.detailSub}>{selectedTrip.driver_phone}</Text>
                        )}
                      </View>
                    </View>
                  )}

                  {selectedTrip.vehicle_plate && (
                    <View style={styles.detailRow}>
                      <Ionicons name="car-outline" size={20} color="#1A3C6E" />
                      <View>
                        <Text style={styles.detailLabel}>Vehículo</Text>
                        <Text style={styles.detailValue}>{selectedTrip.vehicle_plate}</Text>
                      </View>
                    </View>
                  )}

                  <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={20} color="#1A3C6E" />
                    <View>
                      <Text style={styles.detailLabel}>Fecha</Text>
                      <Text style={styles.detailValue}>
                        {new Date(selectedTrip.created_at).toLocaleString('es-BO')}
                      </Text>
                    </View>
                  </View>

                  {selectedTrip.status === 'completed' && selectedTrip.rating === 0 && (
                    <TouchableOpacity 
                      style={styles.rateModalBtn}
                      onPress={() => {
                        setModalVisible(false);
                        openRatingModal(selectedTrip.id);
                      }}
                    >
                      <Text style={styles.rateModalBtnText}>⭐ Calificar este viaje</Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ✅ RATING MODAL */}
      <RatingModal
        visible={ratingModalVisible}
        tripId={ratingTripId}
        onClose={() => {
          setRatingModalVisible(false);
          setRatingTripId('');
        }}
        onSuccess={() => {
          setRatingModalVisible(false);
          setRatingTripId('');
          loadTrips(); // Recargar para actualizar calificación
        }}
      />

      <View style={styles.bottomNavContainer}>
        <BottomNavBar active="history" onSelect={(id: string) => {
          if (id === 'home') navigation.navigate('Home');
          else if (id === 'profile') navigation.navigate('Profile');
        }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#1A3C6E' },
  filterScroll: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF' },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F1F5F9', marginRight: 8 },
  filterChipActive: { backgroundColor: '#1A3C6E' },
  filterChipText: { fontSize: 13, color: '#64748B' },
  filterChipTextActive: { color: '#FFFFFF' },
  listContent: { padding: 16, paddingBottom: 100 },
  tripCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  tripHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  tripLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  tripType: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
  tripRoute: { fontSize: 13, color: '#64748B', marginTop: 2 },
  tripRight: { alignItems: 'flex-end' },
  tripFare: { fontSize: 16, fontWeight: '700', color: '#1A3C6E' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginTop: 4 },
  statusText: { fontSize: 11, fontWeight: '500', marginLeft: 4 },
  tripFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9', flexWrap: 'wrap' },
  tripDate: { fontSize: 12, color: '#94A3B8' },
  tripDriver: { fontSize: 12, color: '#94A3B8' },
  ratingStars: { flexDirection: 'row' },
  rateBtn: { backgroundColor: '#1A3C6E', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  rateBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#94A3B8' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#1E293B', marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: '#94A3B8', marginTop: 8, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%', paddingTop: 8 },
  modalHandle: { width: 40, height: 4, backgroundColor: '#D1D5DB', borderRadius: 2, alignSelf: 'center', marginBottom: 8 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#1E293B' },
  modalBody: { paddingHorizontal: 20, paddingVertical: 16 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  detailLabel: { fontSize: 12, color: '#94A3B8', marginBottom: 2 },
  detailValue: { fontSize: 15, color: '#1E293B', fontWeight: '500' },
  detailSub: { fontSize: 13, color: '#64748B' },
  detailDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 8 },
  rateModalBtn: { backgroundColor: '#1A3C6E', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  rateModalBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 16 },
  bottomNavContainer: { position: 'absolute', bottom: 20, left: 16, right: 16, zIndex: 10 },
});

