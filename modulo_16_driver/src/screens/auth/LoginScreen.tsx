import React, { useState, useEffect } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../../services/authService';

const LAST_EMAIL_KEY = '@zenda_driver_last_email';

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Ingresar como Conductor');

  useEffect(() => {
    const loadLastEmail = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem(LAST_EMAIL_KEY);
        if (savedEmail) {
          setEmail(savedEmail);
        }
      } catch (error) {
        console.error('Error al recuperar correo previo', error);
      }
    };
    loadLastEmail();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('⚠️ Campos incompletos', 'Por favor ingresa tu correo y contraseña.');
      return;
    }

    setLoading(true);
    setLoadingText('Validando credenciales...');

    try {
      const result = await authService.login(email.trim(), password);

      if (result.success) {
        setLoadingText('¡Bienvenido Conductor!');
        await AsyncStorage.setItem(LAST_EMAIL_KEY, email.trim());
        await AsyncStorage.setItem('user_role', 'driver');

        setTimeout(() => {
          navigation.replace('Home');
        }, 300);
      } else {
        Alert.alert('❌ Error de acceso', result.error || 'Credenciales incorrectas.');
      }
    } catch (error) {
      Alert.alert('❌ Error de red', 'No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
      setLoadingText('Ingresar como Conductor');
    }
  };

  const goToRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.card}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Ionicons name="car-sport" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>ZENDA</Text>
        </View>
        <Text style={styles.subtitle}>Conductor - Movilidad Urbana</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            placeholderTextColor="#94A3B8"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Contraseña"
              placeholderTextColor="#94A3B8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonLoading]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#FFFFFF" size="small" />
                <Text style={styles.buttonText}>{loadingText}</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>Ingresar como Conductor</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={goToRegister} style={styles.registerContainer}>
            <Text style={styles.registerText}>
              ¿No eres conductor? <Text style={styles.registerLink}>Regístrate aquí</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>ZENDA Driver v4.8.0</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A3C6E', justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 28, width: '100%', maxWidth: 400, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8, alignItems: 'center' },
  logoContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  logoIcon: { backgroundColor: '#1A3C6E', padding: 8, borderRadius: 12 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1A3C6E', letterSpacing: 1 },
  subtitle: { fontSize: 13, color: '#64748B', marginBottom: 24 },
  form: { width: '100%', gap: 14 },
  input: { backgroundColor: '#F1F5F9', borderRadius: 12, padding: 14, fontSize: 16, color: '#1E293B', borderWidth: 1, borderColor: '#E2E8F0' },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 14 },
  passwordInput: { flex: 1, paddingVertical: 14, fontSize: 16, color: '#1E293B' },
  eyeIcon: { padding: 4 },
  button: { backgroundColor: '#1A3C6E', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 6 },
  buttonLoading: { backgroundColor: '#2ECC71' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  registerContainer: { marginTop: 12, alignItems: 'center' },
  registerText: { textAlign: 'center', color: '#64748B', fontSize: 14 },
  registerLink: { color: '#2ECC71', fontWeight: 'bold' },
  versionText: { fontSize: 11, color: '#CBD5E1', marginTop: 20 },
});
