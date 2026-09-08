import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../services/authService';
import { BottomNavBar } from '../components/BottomNavBar';
import axios from 'axios';

const API_BASE = 'http://192.168.1.88:8093';

interface DriverProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  license_number: string;
  license_category: string;
  license_expiry: string;
  vehicle_plate: string;
  vehicle_brand: string;
  vehicle_model: string;
  vehicle_year: number;
  vehicle_color: string;
  vehicle_type: string;
  rating: number;
  trips_completed: number;
  acceptance_rate: number;
  is_verified: boolean;
  is_available: boolean;
}

export default function ProfileScreen({ navigation }: any) {
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const token = await authService.getToken();
      const user = await authService.getUser();

      if (!user?.id) {
        console.log('⚠️ Usuario no autenticado');
        return;
      }

      const response = await axios.get(`${API_BASE}/api/v1/driver/profile/${user.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        timeout: 5000,
      });

      if (response.data.success) {
        setProfile(response.data.data);
        setIsAvailable(response.data.data.is_available ?? true);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      // Datos de ejemplo
      setProfile({
        id: 'driver-1',
        first_name: 'Juan',
        last_name: 'Pérez',
        email: 'juan.perez@example.com',
        phone: '+591 71234567',
        license_number: 'LIC-12345',
        license_category: 'A',
        license_expiry: '2027-12-31',
        vehicle_plate: 'MOTO-001',
        vehicle_brand: 'Honda',
        vehicle_model: 'Wave',
        vehicle_year: 2023,
        vehicle_color: 'Negro',
        vehicle_type: 'MOTO',
        rating: 4.8,
        trips_completed: 156,
        acceptance_rate: 95,
        is_verified: true,
        is_available: true,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadProfile();
  };

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            await authService.logout();
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          },
        },
      ]
    );
  };

  const handleUpdateAvailability = async (value: boolean) => {
    setIsAvailable(value);
    try {
      const token = await authService.getToken();
      const user = await authService.getUser();

      await axios.put(
        `${API_BASE}/api/v1/driver/availability`,
        {
          driverId: user?.id,
          isAvailable: value,
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A3C6E" />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text style={styles.errorText}>No se pudo cargar el perfil</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={loadProfile}>
          <Text style={styles.retryBtnText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>👤 Perfil de Conductor</Text>
        <TouchableOpacity onPress={handleEditProfile}>
          <Ionicons name="create-outline" size={24} color="#1A3C6E" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Avatar y estado */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile.first_name[0]}{profile.last_name[0]}
            </Text>
          </View>
          <Text style={styles.driverName}>
            {profile.first_name} {profile.last_name}
          </Text>
          <View style={styles.statusRow}>
            {profile.is_verified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="shield-checkmark" size={16} color="#FFFFFF" />
                <Text style={styles.verifiedText}>Verificado</Text>
              </View>
            )}
            <View style={[styles.statusBadge, isAvailable ? styles.statusOnline : styles.statusOffline]}>
              <Text style={styles.statusText}>
                {isAvailable ? '🟢 Disponible' : '🔴 Desconectado'}
              </Text>
            </View>
          </View>
          <View style={styles.availabilityToggle}>
            <Text style={styles.toggleLabel}>Estado de conexión</Text>
            <Switch
              value={isAvailable}
              onValueChange={handleUpdateAvailability}
              trackColor={{ false: '#D1D5DB', true: '#2ECC71' }}
              thumbColor={isAvailable ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
        </View>

        {/* Estadísticas rápidas */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{profile.trips_completed}</Text>
            <Text style={styles.statLabel}>Viajes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{profile.rating.toFixed(1)}⭐</Text>
            <Text style={styles.statLabel}>Calificación</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{profile.acceptance_rate}%</Text>
            <Text style={styles.statLabel}>Aceptación</Text>
          </View>
        </View>

        {/* Información personal */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>📋 Datos Personales</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nombre</Text>
            <Text style={styles.infoValue}>{profile.first_name} {profile.last_name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{profile.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Teléfono</Text>
            <Text style={styles.infoValue}>{profile.phone}</Text>
          </View>
        </View>

        {/* Licencia */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>🪪 Licencia de Conducir</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Número</Text>
            <Text style={styles.infoValue}>{profile.license_number}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Categoría</Text>
            <Text style={styles.infoValue}>{profile.license_category}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Vencimiento</Text>
            <Text style={styles.infoValue}>{profile.license_expiry}</Text>
          </View>
        </View>

        {/* Vehículo */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>🚘 Vehículo</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Placa</Text>
            <Text style={styles.infoValue}>{profile.vehicle_plate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Marca/Modelo</Text>
            <Text style={styles.infoValue}>{profile.vehicle_brand} {profile.vehicle_model}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Año/Color</Text>
            <Text style={styles.infoValue}>{profile.vehicle_year} • {profile.vehicle_color}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tipo</Text>
            <Text style={styles.infoValue}>{profile.vehicle_type}</Text>
          </View>
        </View>

        {/* Botón de cerrar sesión */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>ZENDA Driver v4.8.0</Text>
        </View>

        <View style={styles.footerSpacer} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavContainer}>
        <BottomNavBar active="profile" onSelect={(id: string) => {
          if (id === 'home') navigation.navigate('Home');
          if (id === 'history') navigation.navigate('History');
          if (id === 'earnings') navigation.navigate('Earnings');
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
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1E293B' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#94A3B8' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 16, color: '#64748B', marginTop: 12 },
  retryBtn: { marginTop: 16, backgroundColor: '#1A3C6E', padding: 12, borderRadius: 12 },
  retryBtnText: { color: '#FFFFFF', fontWeight: '600' },
  avatarSection: { alignItems: 'center', paddingVertical: 20 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1A3C6E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF' },
  driverName: { fontSize: 20, fontWeight: 'bold', color: '#1E293B', marginTop: 8 },
  statusRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2ECC71',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  verifiedText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusOnline: { backgroundColor: '#D1FAE5' },
  statusOffline: { backgroundColor: '#FEE2E2' },
  statusText: { fontSize: 12, fontWeight: '600' },
  availabilityToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 12,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  toggleLabel: { fontSize: 14, color: '#1E293B' },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  statLabel: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#1E293B', marginBottom: 10 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoLabel: { fontSize: 14, color: '#94A3B8' },
  infoValue: { fontSize: 14, color: '#1E293B', fontWeight: '500' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    padding: 14,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 8,
    gap: 8,
  },
  logoutText: { color: '#EF4444', fontWeight: '600', fontSize: 16 },
  versionContainer: { alignItems: 'center', paddingVertical: 16 },
  versionText: { fontSize: 12, color: '#94A3B8' },
  footerSpacer: { height: 100 },
  bottomNavContainer: { position: 'absolute', bottom: 20, left: 16, right: 16, zIndex: 10 },
});
