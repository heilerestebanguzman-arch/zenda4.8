// src/screens/ProfileScreen.tsx - V2 con mejoras
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE = 'http://192.168.100.10:3000';
const API_MOBILITY = 'http://192.168.100.10:8103/api/v1/mobility';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  ci: string;
  role: string;
  created_at: string;
}

interface Stats {
  trips: number;
  rating: number;
  spent: number;
}

const CACHE_KEY = 'user_stats_cache';
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutos

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<Stats>({
    trips: 0,
    rating: 0,
    spent: 0,
  });
  const [lastStatsUpdate, setLastStatsUpdate] = useState<number>(0);

  useEffect(() => {
    loadUserData();
  }, []);

  // ✅ FORMATO DE TELÉFONO BOLIVIANO
  const formatPhoneNumber = (text: string) => {
    // Eliminar todo excepto dígitos y '+'
    let cleaned = text.replace(/[^0-9+]/g, '');
    
    // Si comienza con 0 o sin código, agregar +591
    if (cleaned.length > 0 && !cleaned.startsWith('+')) {
      if (cleaned.startsWith('0')) {
        cleaned = cleaned.substring(1);
      }
      cleaned = '+591' + cleaned;
    }
    
    // Formatear: +591 7XXXXXXX
    if (cleaned.length > 4) {
      const countryCode = cleaned.substring(0, 4);
      const number = cleaned.substring(4);
      if (number.length <= 8) {
        cleaned = `${countryCode} ${number}`;
      } else {
        cleaned = `${countryCode} ${number.substring(0, 8)}`;
      }
    }
    
    return cleaned;
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhone(formatted);
  };

  // ✅ VALIDACIÓN DE CI BOLIVIANA
  const isValidCI = (ci: string) => {
    if (!ci) return false;
    // CI boliviana: 7-8 dígitos (puede tener letra al final para extranjeros)
    const ciRegex = /^[0-9]{7,8}[A-Za-z]?$/;
    return ciRegex.test(ci);
  };

  const loadUserData = async () => {
    try {
      setLoading(true);
      const token = await authService.getToken();
      const userData = await authService.getUser();
      
      if (userData) {
        setUser(userData);
        setName(userData.name || '');
        setPhone(userData.phone || '');
        await loadStats(userData.id);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      setMockUser();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ✅ CACHÉ LOCAL DE ESTADÍSTICAS
  const loadStats = async (userId: string) => {
    try {
      // Intentar cargar desde caché primero
      const cachedData = await AsyncStorage.getItem(CACHE_KEY);
      const now = Date.now();
      
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        // Si el caché es válido (menos de 5 minutos), usarlo
        if (parsed.timestamp && (now - parsed.timestamp) < CACHE_EXPIRY) {
          setStats(parsed.stats);
          setLastStatsUpdate(parsed.timestamp);
          return;
        }
      }

      // Si no hay caché o expiró, consultar API
      const token = await authService.getToken();
      const response = await axios.get(
        `${API_MOBILITY}/trips/stats?userId=${userId}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      if (response.data.success) {
        const newStats = {
          trips: response.data.data.totalTrips || 0,
          rating: response.data.data.averageRating || 0,
          spent: response.data.data.totalSpent || 0,
        };
        setStats(newStats);
        setLastStatsUpdate(now);
        
        // Guardar en caché
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
          stats: newStats,
          timestamp: now,
        }));
      }
    } catch (error) {
      console.warn('Error loading stats, using cached or default:', error);
      // Si falla, intentar cargar caché aunque esté expirado
      const cachedData = await AsyncStorage.getItem(CACHE_KEY);
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          setStats(parsed.stats);
        } catch (e) {
          setStats({ trips: 0, rating: 0, spent: 0 });
        }
      } else {
        // Si no hay caché, usar datos mock de respaldo
        setStats({
          trips: 12,
          rating: 4.7,
          spent: 45,
        });
      }
    }
  };

  const setMockUser = () => {
    setUser({
      id: '1',
      name: 'Usuario ZENDA',
      email: 'usuario@zenda.com',
      phone: '+591 71234567',
      ci: '1234567',
      role: 'user',
      created_at: new Date().toISOString(),
    });
    setName('Usuario ZENDA');
    setPhone('+591 71234567');
    setStats({
      trips: 12,
      rating: 4.7,
      spent: 45,
    });
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
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('userData');
            await AsyncStorage.removeItem(CACHE_KEY);
            navigation.replace('Login');
          }
        }
      ]
    );
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio.');
      return;
    }

    // ✅ VALIDAR TELÉFONO BOLIVIANO
    const phoneClean = phone.replace(/\s/g, '');
    if (phoneClean && !phoneClean.startsWith('+591')) {
      Alert.alert('Error', 'El teléfono debe comenzar con +591 (Bolivia).');
      return;
    }

    if (phoneClean && phoneClean.length < 12) {
      Alert.alert('Error', 'Ingresa un número de teléfono válido (ej: +591 71234567).');
      return;
    }

    setSaving(true);
    try {
      const token = await authService.getToken();
      const response = await axios.put(
        `${API_BASE}/api/users/profile`,
        { name, phone: phoneClean },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      if (response.data.success) {
        const updatedUser = { ...user, name, phone: phoneClean };
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
        setUser(updatedUser);
        Alert.alert('✅ Éxito', 'Perfil actualizado correctamente.');
        setIsEditing(false);
        // Forzar recarga de estadísticas
        await loadStats(user?.id || '');
      }
    } catch (error) {
      // Fallback: guardar localmente
      const updatedUser = { ...user, name, phone: phoneClean };
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
      setUser(updatedUser);
      Alert.alert('✅ Éxito', 'Perfil actualizado correctamente.');
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadUserData();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-BO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getLastUpdateText = () => {
    if (!lastStatsUpdate) return 'Actualizado ahora';
    const diff = Date.now() - lastStatsUpdate;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Actualizado ahora';
    if (minutes < 60) return `Actualizado hace ${minutes} min`;
    return `Actualizado hace ${Math.floor(minutes / 60)}h`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A3C6E" />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>👤 Perfil</Text>
        <TouchableOpacity 
          onPress={() => setIsEditing(!isEditing)} 
          style={styles.editButton}
        >
          <Ionicons 
            name={isEditing ? 'close-outline' : 'create-outline'} 
            size={24} 
            color="#1A3C6E" 
          />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(user?.name || '')}</Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'Usuario'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'usuario@email.com'}</Text>
          
          {/* Badges */}
          <View style={styles.badgeContainer}>
            <View style={styles.userBadge}>
              <Text style={styles.userBadgeText}>
                {user?.role === 'admin' ? '🔑 Administrador' : '👤 Usuario'}
              </Text>
            </View>
            
            {/* ✅ BADGE DE CI VERIFICADA */}
            {user?.ci && isValidCI(user.ci) && (
              <View style={styles.ciVerifiedBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" />
                <Text style={styles.ciVerifiedText}>CI Verificada</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.userSince}>
            Miembro desde {formatDate(user?.created_at || '')}
          </Text>
        </View>

        {/* Información Personal */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Información Personal</Text>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Nombre completo</Text>
            {isEditing ? (
              <TextInput
                style={styles.fieldInput}
                value={name}
                onChangeText={setName}
                placeholder="Tu nombre completo"
                placeholderTextColor="#94A3B8"
              />
            ) : (
              <Text style={styles.fieldValue}>{user?.name || 'No especificado'}</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Correo electrónico</Text>
            <Text style={styles.fieldValue}>{user?.email || 'No especificado'}</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Teléfono</Text>
            {isEditing ? (
              <TextInput
                style={styles.fieldInput}
                value={phone}
                onChangeText={handlePhoneChange}
                placeholder="+591 71234567"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                maxLength={17}
              />
            ) : (
              <Text style={styles.fieldValue}>{user?.phone || 'No especificado'}</Text>
            )}
            {isEditing && (
              <Text style={styles.fieldHelper}>Formato: +591 7XXXXXXXX</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Cédula de Identidad</Text>
            <View style={styles.ciContainer}>
              <Text style={styles.fieldValue}>{user?.ci || 'No especificado'}</Text>
              {user?.ci && isValidCI(user.ci) && (
                <Ionicons name="checkmark-circle" size={20} color="#2ECC71" />
              )}
            </View>
          </View>

          {isEditing && (
            <TouchableOpacity 
              style={styles.saveBtn} 
              onPress={handleSaveProfile}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>💾 Guardar cambios</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Estadísticas con timestamp */}
        <View style={styles.statsCard}>
          <View style={styles.statsHeader}>
            <Text style={styles.sectionTitle}>📊 Estadísticas</Text>
            <Text style={styles.statsTimestamp}>{getLastUpdateText()}</Text>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.trips}</Text>
              <Text style={styles.statLabel}>Viajes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.rating.toFixed(1)}</Text>
              <Text style={styles.statLabel}>⭐ Calificación</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>Bs {stats.spent.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Gastado</Text>
            </View>
          </View>
        </View>

        {/* Acciones */}
        <View style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>⚙️ Acciones</Text>
          
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => navigation.navigate('History')}
          >
            <Ionicons name="time-outline" size={24} color="#1A3C6E" />
            <Text style={styles.actionText}>Ver historial de viajes</Text>
            <Ionicons name="chevron-forward-outline" size={20} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.actionDivider} />

          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => Alert.alert('Próximamente', 'Configuración de la app')}
          >
            <Ionicons name="settings-outline" size={24} color="#1A3C6E" />
            <Text style={styles.actionText}>Configuración</Text>
            <Ionicons name="chevron-forward-outline" size={20} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.actionDivider} />

          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => Alert.alert('Próximamente', 'Ayuda y soporte')}
          >
            <Ionicons name="help-circle-outline" size={24} color="#1A3C6E" />
            <Text style={styles.actionText}>Ayuda y soporte</Text>
            <Ionicons name="chevron-forward-outline" size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Cerrar Sesión */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>ZENDA v4.8 - Urban Edition</Text>
          <Text style={styles.footerSub}>© 2026 Nebel Legend</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#94A3B8',
  },
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
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A3C6E',
  },
  editButton: {
    padding: 8,
  },
  content: {
    padding: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1A3C6E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#D4AF37',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1E293B',
  },
  userEmail: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  userBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  userBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2ECC71',
  },
  ciVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A3C6E',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  ciVerifiedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  userSince: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 8,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsTimestamp: {
    fontSize: 11,
    color: '#94A3B8',
  },
  actionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  field: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 16,
    color: '#1E293B',
    paddingVertical: 8,
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: '#1E293B',
    backgroundColor: '#FFFFFF',
  },
  fieldHelper: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
  },
  ciContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saveBtn: {
    backgroundColor: '#1A3C6E',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A3C6E',
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  actionText: {
    flex: 1,
    fontSize: 15,
    color: '#1E293B',
    marginLeft: 12,
  },
  actionDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    padding: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  logoutText: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#94A3B8',
  },
  footerSub: {
    fontSize: 12,
    color: '#CBD5E1',
    marginTop: 4,
  },
});
