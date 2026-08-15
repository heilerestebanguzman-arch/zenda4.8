import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

const mockHistory = [
  { id: '1', date: '2026-08-08', route: 'Centro - Terminal', amount: '3.00', status: 'Completado' },
  { id: '2', date: '2026-08-07', route: 'Mercado - Hospital', amount: '3.00', status: 'Completado' },
  { id: '3', date: '2026-08-06', route: 'Plaza - Aeropuerto', amount: '5.00', status: 'Completado' },
];

export default function HistoryScreen({ navigation }: any) {
  return (
    <View style={s.container}>
      <Text style={s.title}>Historial de Viajes</Text>
      <FlatList
        data={mockHistory}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={s.row}>
              <Text style={s.route}>{item.route}</Text>
              <Text style={s.amount}>Bs {item.amount}</Text>
            </View>
            <View style={s.row}>
              <Text style={s.date}>{item.date}</Text>
              <Text style={s.status}>{item.status}</Text>
            </View>
          </View>
        )}
      />
      <TouchableOpacity style={s.btn} onPress={() => navigation.goBack()}>
        <Text style={s.btnText}>Volver</Text>
      </TouchableOpacity>
    </View>
  );
}
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1A3C6E', marginBottom: 16 },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 14, marginBottom: 10, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  route: { fontSize: 15, fontWeight: '600', color: '#1A3C6E' },
  amount: { fontSize: 15, fontWeight: 'bold', color: '#4CAF50' },
  date: { fontSize: 13, color: '#999' },
  status: { fontSize: 13, color: '#4CAF50' },
  btn: { backgroundColor: '#1A3C6E', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  btnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
