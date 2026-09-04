import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const API_USERS = 'http://192.168.1.62:3000';

export default function OTPScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { phone, userData } = route.params as { phone: string; userData: any };
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const inputs = useRef<Array<TextInput | null>>([]);

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-focus next input
    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      Alert.alert('⚠️ Error', 'Por favor ingresa el código completo de 6 dígitos.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_USERS}/api/v1/auth/verify-otp`, {
        phone,
        otp: otpCode,
      });

      if (response.data.success) {
        Alert.alert('✅ Éxito', 'Teléfono verificado correctamente.');
        // Continuar con el registro
        navigation.replace('Register', { ...userData, phoneVerified: true });
      } else {
        Alert.alert('❌ Error', response.data.message || 'Código incorrecto.');
      }
    } catch (error) {
      Alert.alert('❌ Error', 'No se pudo verificar el código.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      const response = await axios.post(`${API_USERS}/api/v1/auth/send-otp`, {
        phone,
      });

      if (response.data.success) {
        setTimer(60);
        Alert.alert('✅ Código reenviado', 'Revisa tu teléfono.');
      } else {
        Alert.alert('❌ Error', response.data.message || 'No se pudo reenviar el código.');
      }
    } catch (error) {
      Alert.alert('❌ Error', 'Error de conexión.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.card}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color="#1A3C6E" />
        </TouchableOpacity>

        <Text style={styles.title}>Verificación</Text>
        <Text style={styles.subtitle}>
          Ingresa el código de 6 dígitos enviado a {'\n'}
          <Text style={styles.phoneText}>{phone}</Text>
        </Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputs.current[index] = ref)}
              style={styles.otpInput}
              value={digit}
              onChangeText={(text) => handleOtpChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="numeric"
              maxLength={1}
              autoFocus={index === 0}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Verificar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resendBtn}
          onPress={handleResend}
          disabled={resendLoading || timer > 0}
        >
          {resendLoading ? (
            <ActivityIndicator size="small" color="#1A3C6E" />
          ) : (
            <Text style={[styles.resendText, timer > 0 && styles.resendDisabled]}>
              {timer > 0 ? `Reenviar en ${timer}s` : 'Reenviar código'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, elevation: 4 },
  backBtn: { marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1A3C6E' },
  subtitle: { fontSize: 14, color: '#64748B', marginBottom: 24 },
  phoneText: { fontWeight: 'bold', color: '#1A3C6E' },
  otpContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  otpInput: {
    width: 48,
    height: 56,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  button: {
    backgroundColor: '#1A3C6E',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  resendBtn: { alignItems: 'center' },
  resendText: { color: '#1A3C6E', fontWeight: '600' },
  resendDisabled: { color: '#94A3B8' },
});
