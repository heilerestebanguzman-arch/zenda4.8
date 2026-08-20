import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

const mockHistory = [
  { id: '1', date: '2026-08-20', route: 'Centro - Terminal', amount: '3.00', status: 'Completado' },
  { id: '2', date: '2026-08-19', route: 'Mercado - Hospital', amount: '3.00', status: 'Completado' },
  { id: '3', date: '2026-08-18', route: 'Plaza - Aeropuerto', amount: '5.00', status: 'Completado' },
];

export default function HistoryScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📋 Historial de Viajes</Text>
      <FlatList
        data={mockHistory}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.route}>{item.route}</Text>
              <Text style={styles.amount}>Bs {item.amount}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.date}>{item.date}</Text>
              <Text style={styles.status}>{item.status}</Text>
            </View>
          </View>
        )}
      />
      <TouchableOpacity style={styles.btn} onPress={() => navigation.goBack()}>
        <Text style={styles.btnText}>← Volver</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 16 },
  card: { backgroundColor: '#1E293B', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#334155' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  route: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  amount: { fontSize: 15, fontWeight: 'bold', color: '#2ECC71' },
  date: { fontSize: 13, color: '#94A3B8' },
  status: { fontSize: 13, color: '#2ECC71' },
  btn: { backgroundColor: '#1A3C6E', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  btnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
