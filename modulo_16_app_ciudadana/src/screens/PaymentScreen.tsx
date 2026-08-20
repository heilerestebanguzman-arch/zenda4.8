import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

export default function PaymentScreen({ route, navigation }: any) {
  const { vehicle } = route.params || { plate: 'Desconocido' };

  const handlePay = (method: string) => {
    Alert.alert('✅ Pago Exitoso', `Pago de Bs 3.00 con ${method}\nVehículo: ${vehicle.plate}`, [
      { text: 'OK', onPress: () => navigation.navigate('Home') }
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💳 Pagar Pasaje</Text>
      <Text style={styles.subtitle}>Vehículo: {vehicle.plate}</Text>
      <Text style={styles.amount}>Bs 3.00</Text>

      <TouchableOpacity style={styles.btn} onPress={() => handlePay('QR')}>
        <Text style={styles.btnText}>📱 Pagar con QR</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={() => handlePay('Efectivo')}>
        <Text style={styles.btnText}>💵 Pagar en Efectivo</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={() => navigation.goBack()}>
        <Text style={[styles.btnText, { color: '#1A3C6E' }]}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', padding: 20, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#94A3B8', marginBottom: 8 },
  amount: { fontSize: 36, fontWeight: 'bold', color: '#2ECC71', marginVertical: 20 },
  btn: { backgroundColor: '#1A3C6E', padding: 16, borderRadius: 12, width: '100%', alignItems: 'center', marginBottom: 12 },
  btnSecondary: { backgroundColor: '#F5A623' },
  btnCancel: { backgroundColor: 'white', borderWidth: 2, borderColor: '#1A3C6E' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});
