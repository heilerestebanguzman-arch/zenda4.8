import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import {
  validateBolivianCI,
  validateBolivianPhone,
  validateEmail,
  validatePassword,
} from '../../utils/validators';

const API_BASE = 'http://192.168.100.10:8093';

export default function RegisterScreen({ navigation }: any) {
  // Estado para campos del formulario
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [motherLastName, setMotherLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [ci, setCi] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Estado para validaciones en tiempo real
  const [phoneError, setPhoneError] = useState('');
  const [ciError, setCiError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Validar teléfono en tiempo real
  const handlePhoneChange = (text: string) => {
    setPhone(text);
    if (text.length === 8) {
      if (!validateBolivianPhone(text)) {
        setPhoneError('📱 Número inválido. Debe empezar con 6 o 7');
      } else {
        setPhoneError('');
      }
    } else {
      setPhoneError('');
    }
  };

  // Validar CI en tiempo real
  const handleCIChange = (text: string) => {
    setCi(text);
    if (text.length >= 7) {
      if (!validateBolivianCI(text)) {
        setCiError('🪪 CI inválido. Debe tener 7 u 8 dígitos');
      } else {
        setCiError('');
      }
    } else {
      setCiError('');
    }
  };

  // Validar email en tiempo real
  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (text.length > 0 && !validateEmail(text)) {
      setEmailError('📧 Email inválido');
    } else {
      setEmailError('');
    }
  };

  // Validar contraseña en tiempo real
  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (text.length > 0 && !validatePassword(text)) {
      setPasswordError('🔒 Mínimo 6 caracteres');
    } else {
      setPasswordError('');
    }
  };

  const handleRegister = async () => {
    // Validaciones finales
    if (!firstName || !lastName || !phone || !ci || !email || !password) {
      Alert.alert('⚠️ Campos incompletos', 'Por favor completa todos los datos.');
      return;
    }

    if (!validateBolivianPhone(phone)) {
      Alert.alert('⚠️ Teléfono inválido', 'Ingresa un número válido de 8 dígitos.');
      return;
    }

    if (!validateBolivianCI(ci)) {
      Alert.alert('⚠️ CI Inválido', 'Ingresa un número de Cédula de Identidad válido.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('⚠️ Email inválido', 'Ingresa un correo electrónico válido.');
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert('⚠️ Contraseña débil', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const fullName = `${firstName} ${lastName} ${motherLastName}`.trim();
      
      const response = await axios.post(`${API_BASE}/api/v1/auth/register`, {
        fullName,
        firstName,
        lastName,
        motherLastName,
        phone: `+591${phone}`,
        ci,
        email,
        password,
        role: 'citizen',
      });

      if (response.data.success) {
        Alert.alert(
          '🎉 ¡Bienvenido a Zenda!',
          'Tu cuenta ha sido creada exitosamente.\nAhora puedes iniciar sesión.',
          [{ text: 'Iniciar Sesión', onPress: () => navigation.navigate('Login') }]
        );
      }
    } catch (error: any) {
      console.error('Error en registro:', error);
      Alert.alert(
        '❌ Error de Registro',
        error.response?.data?.message || 'No se pudo procesar tu cuenta. Intenta de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.title}>🏍️ ZENDA</Text>
          <Text style={styles.subtitle}>Crea tu cuenta de pasajero</Text>
        </View>

        <View style={styles.formCard}>
          {/* Nombres y Apellidos */}
          <Text style={styles.label}>📝 Nombres</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. Juan Carlos"
            placeholderTextColor="#999"
            value={firstName}
            onChangeText={setFirstName}
          />

          <Text style={styles.label}>📝 Apellido Paterno</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. Pérez"
            placeholderTextColor="#999"
            value={lastName}
            onChangeText={setLastName}
          />

          <Text style={styles.label}>📝 Apellido Materno</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. Rodríguez"
            placeholderTextColor="#999"
            value={motherLastName}
            onChangeText={setMotherLastName}
          />

          {/* Teléfono con prefijo +591 */}
          <Text style={styles.label}>📱 Número de Celular</Text>
          <View style={styles.phoneContainer}>
            <View style={styles.prefixBox}>
              <Text style={styles.prefixText}>🇧🇴 +591</Text>
            </View>
            <TextInput
              style={[styles.phoneInput, phoneError ? styles.inputError : null]}
              placeholder="78912345"
              placeholderTextColor="#999"
              value={phone}
              onChangeText={handlePhoneChange}
              keyboardType="phone-pad"
              maxLength={8}
            />
          </View>
          {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}

          {/* Cédula de Identidad */}
          <Text style={styles.label}>🪪 Cédula de Identidad</Text>
          <TextInput
            style={[styles.input, ciError ? styles.inputError : null]}
            placeholder="1234567"
            placeholderTextColor="#999"
            value={ci}
            onChangeText={handleCIChange}
            keyboardType="numeric"
            maxLength={8}
          />
          {ciError ? <Text style={styles.errorText}>{ciError}</Text> : null}

          {/* Correo Electrónico */}
          <Text style={styles.label}>📧 Correo electrónico</Text>
          <TextInput
            style={[styles.input, emailError ? styles.inputError : null]}
            placeholder="tucorreo@email.com"
            placeholderTextColor="#999"
            value={email}
            onChangeText={handleEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

          {/* Contraseña */}
          <Text style={styles.label}>🔒 Contraseña</Text>
          <TextInput
            style={[styles.input, passwordError ? styles.inputError : null]}
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor="#999"
            value={password}
            onChangeText={handlePasswordChange}
            secureTextEntry
          />
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

          {/* Botón de Registro */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>🚀 Registrarse en Zenda</Text>
            )}
          </TouchableOpacity>

          {/* Link a Login */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={styles.linkContainer}
          >
            <Text style={styles.linkText}>
              ¿Ya tienes una cuenta? <Text style={styles.linkBold}>Inicia sesión</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  headerContainer: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 36, fontWeight: '900', color: '#1A3C6E', letterSpacing: 1 },
  subtitle: { fontSize: 16, color: '#555', marginTop: 5, fontWeight: '500' },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6, marginLeft: 2 },
  input: {
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    fontSize: 16,
    color: '#333',
  },
  inputError: { borderColor: '#FF5722', borderWidth: 2 },
  errorText: { color: '#FF5722', fontSize: 12, marginTop: -10, marginBottom: 8, marginLeft: 4 },
  phoneContainer: { flexDirection: 'row', marginBottom: 15 },
  prefixBox: {
    backgroundColor: '#eef2f7',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    marginRight: 8,
  },
  prefixText: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  phoneInput: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#1A3C6E',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    elevation: 2,
  },
  buttonDisabled: { backgroundColor: '#9E9E9E' },
  buttonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 17 },
  linkContainer: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#666', fontSize: 14 },
  linkBold: { color: '#1A3C6E', fontWeight: 'bold' },
});
