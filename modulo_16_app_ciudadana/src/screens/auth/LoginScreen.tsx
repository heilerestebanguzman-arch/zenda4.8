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
import { authService } from '../../services/authService';

const LAST_EMAIL_KEY = '@zenda_last_email';

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('admin@zenda.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Ingresar a Zenda');

  // Cargar el último correo recordado al montar la pantalla
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
      console.log('🔥 Login presionado con email:', email);

      // Simulación de feedback dinámico de fases
      setTimeout(() => {
        setLoadingText('Cargando perfil...');
      }, 800);

      const result = await authService.login(email.trim(), password);

      if (result.success) {
        setLoadingText('¡Bienvenido!');
        // Guardar el correo exitoso para futuras sesiones
        await AsyncStorage.setItem(LAST_EMAIL_KEY, email.trim());

        setTimeout(() => {
          console.log('✅ Login exitoso, navegando a Home...');
          navigation.replace('Home' as never);
        }, 400);
      } else {
        Alert.alert('❌ Error de acceso', result.error || 'Credenciales incorrectas.');
      }
    } catch (error: any) {
      console.error('❌ Error en login:', error);
      Alert.alert('❌ Error de red', 'No se pudo conectar con el servidor. Verifica tu conexión.');
    } finally {
      setLoading(false);
      setLoadingText('Ingresar a Zenda');
    }
  };

  const goToRegister = () => {
    navigation.navigate('Register' as never);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.card}>
        <Text style={styles.title}>ZENDA</Text>
        <Text style={styles.subtitle}>Movilidad Urbana Inteligente</Text>
        
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
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="#94A3B8"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.button}
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
        </View>
      </View>
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A3C6E',
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
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
  button: {
    backgroundColor: '#1A3C6E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
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
});
