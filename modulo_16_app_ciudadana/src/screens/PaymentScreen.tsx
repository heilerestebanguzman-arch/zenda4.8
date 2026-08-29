import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

export default function PaymentScreen({ route, navigation }: any) {
  const { vehicle } = route.params || {};
  const handlePay = () => {
    Alert.alert('Pago Exitoso', 'Su pago ha sido procesado.', [
      { text: 'OK', onPress: () => navigation.navigate('Home') }
    ]);
  };
  return (
    <View style={s.container}>
      <Text style={s.title}>Pagar Pasaje</Text>
      {vehicle && (
        <View style={s.card}>
          <Text style={s.label}>Vehiculo: {vehicle.plate}</Text>
          <Text style={s.label}>Tipo: {vehicle.brand} {vehicle.model}</Text>
        </View>
      )}
      <View style={s.fareCard}>
        <Text style={s.fareLabel}>Tarifa</Text>
        <Text style={s.fareAmount}>Bs 3.00</Text>
      </View>
      <TouchableOpacity style={s.btn} onPress={handlePay}>
        <Text style={s.btnText}>Confirmar Pago</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.back} onPress={() => navigation.goBack()}>
        <Text style={s.backText}>Volver</Text>
      </TouchableOpacity>
    </View>
  );
}
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8', padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1A3C6E', marginBottom: 20 },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2 },
  label: { fontSize: 16, color: '#333', marginBottom: 6 },
  fareCard: { backgroundColor: '#1A3C6E', borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 24 },
  fareLabel: { color: 'white', fontSize: 16 },
  fareAmount: { color: 'white', fontSize: 42, fontWeight: 'bold' },
  btn: { backgroundColor: '#4CAF50', padding: 18, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  btnText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  back: { padding: 12, alignItems: 'center' },
  backText: { color: '#1A3C6E', fontSize: 16 },
});
