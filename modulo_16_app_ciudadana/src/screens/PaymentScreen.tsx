import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import axios from 'axios';

export default function PaymentScreen({ route, navigation }: any) {
  const { vehicle } = route.params || {};
  const [amount, setAmount] = useState('5.00');
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8095/api/v1/payments/validate', {
        userId: 'user-123',
        amount: parseFloat(amount),
        routeId: 'route-456',
        busId: vehicle?.id || 'bus-789',
        paymentMethod: 'QR',
      });

      if (response.data.success) {
        Alert.alert(
          '✅ Pago Exitoso',
          `Monto: $${response.data.data.final_amount}\nID Transacción: ${response.data.data.transaction_id}`
        );
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('❌ Error', 'No se pudo procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.vehicleName}>{vehicle?.plate || 'Bus'}</Text>
        <Text style={styles.vehicleType}>{vehicle?.type || 'MICRO'}</Text>
      </View>

      <View style={styles.amountContainer}>
        <Text style={styles.amountLabel}>Monto a pagar (Bs)</Text>
        <TextInput
          style={styles.amountInput}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          editable={!loading}
        />
      </View>

      <TouchableOpacity
        style={[styles.payButton, loading && styles.payButtonDisabled]}
        onPress={handlePayment}
        disabled={loading}
      >
        <Text style={styles.payButtonText}>
          {loading ? 'Procesando...' : 'Pagar con QR'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  vehicleName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A3C6E',
  },
  vehicleType: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  amountContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  amountLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  amountInput: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A3C6E',
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  payButton: {
    backgroundColor: '#1A3C6E',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
