import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../../services/authService';

const LAST_EMAIL_KEY = '@zenda_last_email';

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Ingresar a Zenda');
  const [error, setError] = useState('');
  
  // ✅ Animaciones para feedback visual
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

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

  // ✅ Animación de error
  const shakeError = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = async () => {
    // ✅ Validación defensiva
    if (!email.trim() || !password.trim()) {
      setError('Por favor ingresa tu correo y contraseña.');
      shakeError();
      Alert.alert('⚠️ Campos incompletos', 'Por favor ingresa tu correo y contraseña.');
      return;
    }

    // ✅ Validación de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Formato de correo inválido.');
      shakeError();
      Alert.alert('⚠️ Correo inválido', 'Por favor ingresa un correo electrónico válido.');
      return;
    }

    setLoading(true);
    setLoadingText('Validando credenciales...');
    setError('');

    try {
      console.log('🔥 Login presionado con email:', email);

      // ✅ Feedback progresivo
      const progressSteps = [
        { text: 'Verificando usuario...', delay: 500 },
        { text: 'Cargando perfil...', delay: 1200 },
        { text: '¡Bienvenido!', delay: 1800 },
      ];

      progressSteps.forEach((step, index) => {
        setTimeout(() => {
          setLoadingText(step.text);
        }, step.delay);
      });

      const result = await authService.login(email.trim(), password);

      if (result.success) {
        // ✅ Guardar email para próximas veces
        await AsyncStorage.setItem(LAST_EMAIL_KEY, email.trim());

        // ✅ Navegación limpia y robusta
        setTimeout(() => {
          // Usamos replace para evitar acumulación en el stack
          navigation.replace('Home');
        }, 400);
        
      } else {
        setError('Credenciales incorrectas o usuario no registrado.');
        shakeError();
        Alert.alert('❌ Error de acceso', 'Credenciales incorrectas o usuario no registrado. Verifica tus datos o regístrate.');
      }
    } catch (error: any) {
      console.error('❌ Error en login:', error);
      setError('Error de conexión con el servidor.');
      shakeError();
      Alert.alert(
        '❌ Error de red',
        'No se pudo conectar con el servidor. Verifica tu conexión a internet.'
      );
    } finally {
      setLoading(false);
      setLoadingText('Ingresar a Zenda');
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
      <Animated.View 
        style={[
          styles.card,
          {
            transform: [{ translateX: shakeAnim }],
            opacity: fadeAnim,
          }
        ]}
      >
        {/* ✅ Logo y título con animación */}
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Ionicons name="car-sport" size={40} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>ZENDA</Text>
        </View>
        <Text style={styles.subtitle}>Movilidad Urbana Inteligente</Text>

        {/* ✅ Indicador de error visual */}
        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={16} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
        
        <View style={styles.form}>
          <TextInput
            style={[styles.input, error && styles.inputError]}
            placeholder="Correo electrónico"
            placeholderTextColor="#94A3B8"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError('');
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            returnKeyType="next"
          />

          <View style={[styles.passwordContainer, error && styles.inputError]}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Contraseña"
              placeholderTextColor="#94A3B8"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError('');
              }}
              secureTextEntry={!showPassword}
              returnKeyType="go"
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)} 
              style={styles.eyeIcon}
              activeOpacity={0.7}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color="#64748B"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
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
              <Text style={styles.buttonText}>Ingresar a Zenda</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={goToRegister} style={styles.registerContainer}>
            <Text style={styles.registerText}>
              ¿No tienes una cuenta? <Text style={styles.registerLink}>Regístrate aquí</Text>
            </Text>
          </TouchableOpacity>

          {/* ✅ Versión en footer */}
          <Text style={styles.versionText}>ZENDA v4.8.0</Text>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A3C6E',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    gap: 12,
  },
  logoIcon: {
    backgroundColor: '#1A3C6E',
    borderRadius: 12,
    padding: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A3C6E',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    flex: 1,
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputError: {
    borderColor: '#EF4444',
    borderWidth: 2,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1E293B',
  },
  eyeIcon: {
    padding: 4,
  },
  button: {
    backgroundColor: '#1A3C6E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  registerText: {
    textAlign: 'center',
    color: '#64748B',
    fontSize: 14,
  },
  registerLink: {
    color: '#1A3C6E',
    fontWeight: 'bold',
  },
  versionText: {
    textAlign: 'center',
    color: '#CBD5E1',
    fontSize: 11,
    marginTop: 12,
  },
});
