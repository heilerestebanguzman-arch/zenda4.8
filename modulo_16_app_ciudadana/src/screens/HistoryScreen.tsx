import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomNavBar } from '../components/BottomNavBar';

// Datos mock para historial
const MOCK_TRIPS = [
  {
    id: '1',
    date: '2026-08-29',
    time: '14:30',
    origin: 'Av. San Martín 123',
    destination: 'Plaza Principal',
    fare: 5.50,
    vehicle: 'MOTO-001',
    driver: 'Carlos Pérez',
    status: 'completed',
    rating: 4,
  },
  {
    id: '2',
    date: '2026-08-28',
    time: '09:15',
    origin: 'Barrio Los Olivos',
    destination: 'Mercado Central',
    fare: 3.50,
    vehicle: 'TAXI-002',
    driver: 'María Gómez',
    status: 'completed',
    rating: 5,
  },
  {
    id: '3',
    date: '2026-08-27',
    time: '18:45',
    origin: 'Universidad',
    destination: 'Parque Urbano',
    fare: 4.00,
    vehicle: 'MOTO-003',
    driver: 'Luis Fernández',
    status: 'cancelled',
    rating: 0,
  },
  {
    id: '4',
    date: '2026-08-26',
    time: '11:00',
    origin: 'Calle 2 de Mayo',
    destination: 'Aeropuerto',
    fare: 8.50,
    vehicle: 'TAXI-001',
    driver: 'Ana Rodríguez',
    status: 'completed',
    rating: 3,
  },
  {
    id: '5',
    date: '2026-08-25',
    time: '16:20',
    origin: 'Barrio El Cruce',
    destination: 'Centro Comercial',
    fare: 6.00,
    vehicle: 'MINIBUS-001',
    driver: 'Pedro Sánchez',
    status: 'completed',
    rating: 5,
  },
];

export default function HistoryScreen({ navigation }: any) {
  const [trips, setTrips] = useState(MOCK_TRIPS);
  const [filter, setFilter] = useState('all');
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const getFilteredTrips = () => {
    if (filter === 'all') return trips;
    return trips.filter(t => t.status === filter);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#2ECC71';
      case 'cancelled': return '#EF4444';
      case 'pending': return '#F5A623';
      default: return '#94A3B8';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return 'checkmark-circle-outline';
      case 'cancelled': return 'close-circle-outline';
      case 'pending': return 'time-outline';
      default: return 'help-circle-outline';
    }
  };

  const renderStars = (rating: number) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const handleRateTrip = (tripId: string, rating: number) => {
    setTrips(prev => prev.map(t =>
      t.id === tripId ? { ...t, rating } : t
    ));
    Alert.alert('✅ Calificación guardada', 'Gracias por calificar tu viaje.');
    setModalVisible(false);
  };

  const renderTripItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.tripCard}
      onPress={() => {
        setSelectedTrip(item);
        setModalVisible(true);
      }}
    >
      <View style={styles.tripHeader}>
        <View>
          <Text style={styles.tripDate}>{item.date} - {item.time}</Text>
          <Text style={styles.tripRoute}>{item.origin} → {item.destination}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Ionicons name={getStatusIcon(item.status)} size={14} color={getStatusColor(item.status)} />
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.tripFooter}>
        <Text style={styles.tripFare}>Bs {item.fare.toFixed(2)}</Text>
        <View style={styles.tripMeta}>
          <Text style={styles.tripMetaText}>🚗 {item.vehicle}</Text>
          <Text style={styles.tripMetaText}>👤 {item.driver}</Text>
        </View>
      </View>

      {item.rating > 0 && (
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>{renderStars(item.rating)}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📋 Historial de Viajes</Text>
      </View>

      <View style={styles.filterContainer}>
        {['all', 'completed', 'cancelled'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? 'Todos' : f === 'completed' ? 'Completados' : 'Cancelados'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={getFilteredTrips()}
        renderItem={renderTripItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="time-outline" size={60} color="#94A3B8" />
            <Text style={styles.emptyText}>No hay viajes {filter !== 'all' ? filter : ''}</Text>
          </View>
        }
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalle del Viaje</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-outline" size={24} color="#1E293B" />
              </TouchableOpacity>
            </View>

            {selectedTrip && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalBody}>
                  <View style={styles.modalRow}>
                    <Ionicons name="calendar-outline" size={20} color="#1A3C6E" />
                    <Text style={styles.modalText}>{selectedTrip.date} - {selectedTrip.time}</Text>
                  </View>

                  <View style={styles.modalRow}>
                    <Ionicons name="location-outline" size={20} color="#1A3C6E" />
                    <Text style={styles.modalText}>📍 {selectedTrip.origin}</Text>
                  </View>

                  <View style={styles.modalRow}>
                    <Ionicons name="navigate-outline" size={20} color="#2ECC71" />
                    <Text style={styles.modalText}>📍 {selectedTrip.destination}</Text>
                  </View>

                  <View style={styles.modalRow}>
                    <Ionicons name="car-outline" size={20} color="#1A3C6E" />
                    <Text style={styles.modalText}>🚗 {selectedTrip.vehicle} - {selectedTrip.driver}</Text>
                  </View>

                  <View style={styles.modalRow}>
                    <Ionicons name="cash-outline" size={20} color="#F5A623" />
                    <Text style={styles.modalText}>💰 Bs {selectedTrip.fare.toFixed(2)}</Text>
                  </View>

                  <View style={styles.modalRow}>
                    <Ionicons name="checkmark-circle-outline" size={20} color={getStatusColor(selectedTrip.status)} />
                    <Text style={[styles.modalText, { color: getStatusColor(selectedTrip.status) }]}>
                      {selectedTrip.status.charAt(0).toUpperCase() + selectedTrip.status.slice(1)}
                    </Text>
                  </View>

                  {selectedTrip.status === 'completed' && (
                    <View style={styles.ratingSection}>
                      <Text style={styles.ratingSectionTitle}>Calificar viaje</Text>
                      <View style={styles.starsContainer}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <TouchableOpacity
                            key={star}
                            onPress={() => handleRateTrip(selectedTrip.id, star)}
                          >
                            <Text style={styles.star}>
                              {star <= selectedTrip.rating ? '⭐' : '☆'}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

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
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#1A3C6E' },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  filterBtnActive: { backgroundColor: '#1A3C6E' },
  filterText: { color: '#64748B', fontSize: 14 },
  filterTextActive: { color: '#FFFFFF', fontWeight: '600' },
  listContent: { padding: 16, paddingBottom: 100 },
  tripCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tripHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  tripDate: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  tripRoute: { fontSize: 14, color: '#64748B', marginTop: 4 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 4 },
  statusText: { fontSize: 12, fontWeight: '600' },
  tripFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  tripFare: { fontSize: 16, fontWeight: '700', color: '#1A3C6E' },
  tripMeta: { flexDirection: 'row', gap: 12 },
  tripMetaText: { fontSize: 12, color: '#94A3B8' },
  ratingContainer: { marginTop: 8, alignItems: 'flex-start' },
  ratingText: { fontSize: 16 },
  emptyContainer: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 16, color: '#94A3B8', marginTop: 12 },
  bottomNavContainer: { position: 'absolute', bottom: 20, left: 16, right: 16, zIndex: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, width: '90%', maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  modalBody: { gap: 12 },
  modalRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  modalText: { fontSize: 16, color: '#1E293B', flex: 1 },
  ratingSection: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  ratingSectionTitle: { fontSize: 16, fontWeight: '600', color: '#1E293B', marginBottom: 8 },
  starsContainer: { flexDirection: 'row', gap: 8 },
  star: { fontSize: 32 },
});
