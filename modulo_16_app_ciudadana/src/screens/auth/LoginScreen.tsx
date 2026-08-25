import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, KeyboardAvoidingView, Platform, SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { authService } from '../../services/authService';
import { ZendaModal } from '../../components/ZendaModal';

const API_BASE = 'http://192.168.1.24:3000';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<'success' | 'error' | 'info'>('info');

  const passwordRef = useRef<TextInput>(null);

  const showModal = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setModalTitle(title);
    setModalMessage(message);
    setModalType(type);
    setModalVisible(true);
  };

  const validateEmail = (text: string) => {
    setEmail(text);
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (text.length > 0 && !regex.test(text)) {
      setEmailError('📧 Email inválido');
    } else {
      setEmailError('');
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showModal('⚠️ Campos requeridos', 'Por favor ingresa tu correo y contraseña.', 'error');
      return;
    }

    if (emailError) {
      showModal('⚠️ Email inválido', 'Por favor ingresa un correo electrónico válido.', 'error');
      return;
    }

    setLoading(true);
    try {
      console.log('🔥 Login presionado con email:', email);
      const response = await axios.post(`${API_BASE}/api/v1/auth/login`, {
        email,
        password,
      }, { timeout: 30000 });

      console.log('📥 Respuesta del backend:', JSON.stringify(response.data, null, 2));

      if (response.data.status === 'ok') {
        const token = response.data.accessToken;
        const user = response.data.user;

        if (!token || !user) {
          console.error('❌ Token o usuario no encontrado');
          showModal('❌ Error', 'Respuesta del servidor inválida.', 'error');
          return;
        }

        console.log('✅ Token obtenido:', token.substring(0, 20) + '...');
        await authService.saveSession(token, user);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      } else {
        showModal('❌ Error', response.data.error || 'Credenciales incorrectas', 'error');
      }
    } catch (error: any) {
      console.error('❌ Error en login:', error);
      showModal(
        '❌ Error de Acceso',
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Credenciales incorrectas o servidor inactivo.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.innerContainer}
      >
        <View style={styles.headerContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoSymbol}>Z</Text>
            <View style={styles.pulseDot} />
          </View>
          <Text style={styles.title}>ZENDA</Text>
          <Text style={styles.subtitle}>Movilidad Urbana Inteligente</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Iniciar Sesión</Text>
          <Text style={styles.cardSubtitle}>Ingresa tus credenciales para continuar</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
              style={[styles.input, emailError ? styles.inputError : null]}
              placeholder="admin@zenda.com"
              placeholderTextColor="#94A3B8"
              value={email}
              onChangeText={validateEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                ref={passwordRef}
                style={styles.passwordInput}
                placeholder="••••••••"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={(text) => setPassword(text)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                textContentType="none"
                autoComplete="off"
                importantForAutofill="no"
                blurOnSubmit={false}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Text style={styles.eyeText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Ingresar a Zenda</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            style={styles.linkContainer}
          >
            <Text style={styles.linkText}>
              ¿No tienes una cuenta? <Text style={styles.linkGreen}>Regístrate aquí</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <ZendaModal
        visible={modalVisible}
        title={modalTitle}
        message={modalMessage}
        type={modalType}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  innerContainer: { flex: 1, justifyContent: 'center', padding: 24 },
  headerContainer: { alignItems: 'center', marginBottom: 32 },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#1A3C6E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2ECC71',
    elevation: 6,
    shadowColor: '#2ECC71',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  logoSymbol: { fontSize: 32, fontWeight: '900', color: '#FFFFFF' },
  pulseDot: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2ECC71',
  },
  title: { fontSize: 32, fontWeight: '900', color: '#FFFFFF', letterSpacing: 3 },
  subtitle: { fontSize: 14, color: '#94A3B8', marginTop: 4, fontWeight: '500', letterSpacing: 1 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  cardTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: '#64748B', marginBottom: 20 },
  inputContainer: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 6 },
  input: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontSize: 15,
    color: '#0F172A',
  },
  inputError: { borderColor: '#EF4444', borderWidth: 2 },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 4, marginLeft: 4 },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#0F172A',
  },
  eyeIcon: { paddingHorizontal: 16, paddingVertical: 12 },
  eyeText: { fontSize: 18 },
  button: {
    backgroundColor: '#1A3C6E',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
    elevation: 4,
    shadowColor: '#1A3C6E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  buttonDisabled: { backgroundColor: '#94A3B8', shadowOpacity: 0 },
  buttonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16, letterSpacing: 0.5 },
  linkContainer: { marginTop: 16, alignItems: 'center' },
  linkText: { color: '#64748B', fontSize: 14 },
  linkGreen: { color: '#2ECC71', fontWeight: 'bold' },
});
