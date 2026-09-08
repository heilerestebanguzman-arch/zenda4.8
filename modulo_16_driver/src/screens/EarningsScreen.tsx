import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../services/authService';
import axios from 'axios';
import { BottomNavBar } from '../components/BottomNavBar';

const API_BASE = 'http://192.168.1.88:8093';

interface WalletData {
  balance: number;
  available: number;
  pending: number;
  todayEarnings: number;
  weekEarnings: number;
  monthEarnings: number;
  tripsToday: number;
  tripsWeek: number;
  tripsMonth: number;
  lastTransactions: Transaction[];
}

interface Transaction {
  id: string;
  amount: number;
  type: 'earnings' | 'withdrawal' | 'bonus';
  description: string;
  status: 'completed' | 'pending' | 'failed';
  created_at: string;
}

export default function EarningsScreen({ navigation }: any) {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const token = await authService.getToken();
      const user = await authService.getUser();

      if (!user?.id) {
        console.log('⚠️ Usuario no autenticado');
        return;
      }

      const response = await axios.get(`${API_BASE}/api/v1/driver/wallet/${user.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        timeout: 5000,
      });

      if (response.data.success) {
        setWallet(response.data.data);
      }
    } catch (error) {
      console.error('Error loading wallet:', error);
      // Datos de ejemplo para demostración
      setWallet({
        balance: 45.50,
        available: 45.50,
        pending: 0,
        todayEarnings: 12.00,
        weekEarnings: 45.50,
        monthEarnings: 45.50,
        tripsToday: 3,
        tripsWeek: 11,
        tripsMonth: 11,
        lastTransactions: [
          {
            id: '1',
            amount: 4.50,
            type: 'earnings',
            description: 'Viaje #1234 - Centro',
            status: 'completed',
            created_at: new Date().toISOString(),
          },
          {
            id: '2',
            amount: 3.50,
            type: 'earnings',
            description: 'Viaje #1233 - Mercado',
            status: 'completed',
            created_at: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: '3',
            amount: 4.00,
            type: 'earnings',
            description: 'Viaje #1232 - Zona Norte',
            status: 'completed',
            created_at: new Date(Date.now() - 7200000).toISOString(),
          },
        ],
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadWalletData();
  };

  const handleWithdraw = () => {
    Alert.alert(
      '💳 Retirar fondos',
      '¿Deseas retirar el saldo disponible a tu cuenta bancaria?\n\n' +
      `Monto: Bs ${wallet?.available.toFixed(2) || 0}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Retirar',
          onPress: async () => {
            try {
              const token = await authService.getToken();
              const user = await authService.getUser();

              const response = await axios.post(
                `${API_BASE}/api/v1/driver/withdraw`,
                {
                  userId: user?.id,
                  amount: wallet?.available,
                  bankAccount: 'Banco - Cuenta ****1234',
                },
                {
                  headers: token ? { Authorization: `Bearer ${token}` } : {},
                }
              );

              if (response.data.success) {
                Alert.alert(
                  '✅ Solicitud de retiro enviada',
                  'El retiro será procesado en las próximas 24 horas.'
                );
                loadWalletData();
              }
            } catch (error) {
              Alert.alert('Error', 'No se pudo procesar el retiro.');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#2ECC71';
      case 'pending':
        return '#F5A623';
      case 'failed':
        return '#EF4444';
      default:
        return '#94A3B8';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'pending':
        return 'Pendiente';
      case 'failed':
        return 'Fallido';
      default:
        return 'Desconocido';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-BO');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A3C6E" />
        <Text style={styles.loadingText}>Cargando tus ganancias...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💰 Ganancias</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Saldo total */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Saldo disponible</Text>
          <Text style={styles.balanceAmount}>Bs {wallet?.balance.toFixed(2) || '0.00'}</Text>
          <Text style={styles.balanceSub}>Disponible para retiro: Bs {wallet?.available.toFixed(2) || '0.00'}</Text>
          <TouchableOpacity style={styles.withdrawBtn} onPress={handleWithdraw}>
            <Text style={styles.withdrawBtnText}>Retirar fondos</Text>
          </TouchableOpacity>
        </View>

        {/* Estadísticas rápidas */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>Bs {wallet?.todayEarnings.toFixed(2) || '0.00'}</Text>
            <Text style={styles.statLabel}>Hoy</Text>
            <Text style={styles.statSub}>{wallet?.tripsToday || 0} viajes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>Bs {wallet?.weekEarnings.toFixed(2) || '0.00'}</Text>
            <Text style={styles.statLabel}>Esta semana</Text>
            <Text style={styles.statSub}>{wallet?.tripsWeek || 0} viajes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>Bs {wallet?.monthEarnings.toFixed(2) || '0.00'}</Text>
            <Text style={styles.statLabel}>Este mes</Text>
            <Text style={styles.statSub}>{wallet?.tripsMonth || 0} viajes</Text>
          </View>
        </View>

        {/* Últimas transacciones */}
        <TouchableOpacity
          style={styles.transactionsHeader}
          onPress={() => setShowTransactions(!showTransactions)}
        >
          <Text style={styles.sectionTitle}>📋 Últimas transacciones</Text>
          <Ionicons
            name={showTransactions ? 'chevron-up-outline' : 'chevron-down-outline'}
            size={24}
            color="#1A3C6E"
          />
        </TouchableOpacity>

        {showTransactions && (
          <View style={styles.transactionsList}>
            {wallet?.lastTransactions?.length > 0 ? (
              wallet.lastTransactions.map((transaction) => (
                <View key={transaction.id} style={styles.transactionItem}>
                  <View style={styles.transactionIcon}>
                    <Ionicons
                      name={
                        transaction.type === 'earnings'
                          ? 'arrow-up-circle-outline'
                          : transaction.type === 'withdrawal'
                          ? 'arrow-down-circle-outline'
                          : 'star-outline'
                      }
                      size={24}
                      color={
                        transaction.type === 'earnings'
                          ? '#2ECC71'
                          : transaction.type === 'withdrawal'
                          ? '#EF4444'
                          : '#F5A623'
                      }
                    />
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionDesc}>{transaction.description}</Text>
                    <Text style={styles.transactionDate}>{formatDate(transaction.created_at)}</Text>
                  </View>
                  <View style={styles.transactionRight}>
                    <Text
                      style={[
                        styles.transactionAmount,
                        transaction.type === 'earnings'
                          ? styles.amountPositive
                          : styles.amountNegative,
                      ]}
                    >
                      {transaction.type === 'earnings' ? '+' : '-'} Bs {transaction.amount.toFixed(2)}
                    </Text>
                    <View
                      style={[
                        styles.transactionStatus,
                        { backgroundColor: getStatusColor(transaction.status) + '20' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.transactionStatusText,
                          { color: getStatusColor(transaction.status) },
                        ]}
                      >
                        {getStatusLabel(transaction.status)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No hay transacciones recientes</Text>
            )}
          </View>
        )}

        <View style={styles.footerSpacer} />
      </ScrollView>

      <View style={styles.bottomNavContainer}>
        <BottomNavBar active="earnings" onSelect={(id: string) => {
          if (id === 'home') navigation.navigate('Home');
          if (id === 'history') navigation.navigate('History');
          if (id === 'profile') navigation.navigate('Profile');
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#94A3B8' },
  balanceCard: {
    backgroundColor: '#1A3C6E',
    borderRadius: 16,
    padding: 24,
    margin: 16,
    alignItems: 'center',
  },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  balanceAmount: { color: '#FFFFFF', fontSize: 36, fontWeight: 'bold', marginVertical: 8 },
  balanceSub: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  withdrawBtn: {
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  withdrawBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  statsGrid: { flexDirection: 'row', paddingHorizontal: 8, gap: 8 },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statValue: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  statLabel: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  statSub: { fontSize: 11, color: '#94A3B8', marginTop: 1 },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
  transactionsList: { paddingHorizontal: 16, gap: 8 },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    gap: 12,
  },
  transactionIcon: { width: 40, alignItems: 'center' },
  transactionInfo: { flex: 1 },
  transactionDesc: { fontSize: 14, color: '#1E293B' },
  transactionDate: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  transactionRight: { alignItems: 'flex-end' },
  transactionAmount: { fontSize: 14, fontWeight: '600' },
  amountPositive: { color: '#2ECC71' },
  amountNegative: { color: '#EF4444' },
  transactionStatus: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginTop: 2 },
  transactionStatusText: { fontSize: 10, fontWeight: '500' },
  emptyText: { textAlign: 'center', color: '#94A3B8', paddingVertical: 20 },
  footerSpacer: { height: 100 },
  bottomNavContainer: { position: 'absolute', bottom: 20, left: 16, right: 16, zIndex: 10 },
});
