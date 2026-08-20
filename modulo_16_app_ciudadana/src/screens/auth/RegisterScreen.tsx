import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import {
  validateBolivianCI,
  validateBolivianPhone,
  validateEmail,
  validatePassword,
} from '../../utils/validators';

const API_BASE = 'http://192.168.1.3:8093';

export default function RegisterScreen({ navigation }: any) {
  // Estados de campos
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [motherLastName, setMotherLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [ci, setCi] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');

  // Estados de errores en tiempo real
  const [phoneError, setPhoneError] = useState('');
  const [ciError, setCiError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');

  // Refs
  const firstNameRef = useRef<TextInput>(null);
  const lastNameRef = useRef<TextInput>(null);
  const motherLastNameRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const ciRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  // ============ VALIDADORES EN TIEMPO REAL ============

  const validatePhoneField = (text: string) => {
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

  const validateCIField = (text: string) => {
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

  const validateEmailField = (text: string) => {
    setEmail(text);
    if (text.length > 0 && !validateEmail(text)) {
      setEmailError('📧 Email inválido');
    } else {
      setEmailError('');
    }
  };

  const validatePasswordField = (text: string) => {
    setPassword(text);
    if (text.length > 0 && !validatePassword(text)) {
      setPasswordError('🔒 Mínimo 6 caracteres');
    } else {
      setPasswordError('');
    }
    if (confirmPassword.length > 0) {
      if (text !== confirmPassword) {
        setConfirmError('❌ Las contraseñas no coinciden');
      } else {
        setConfirmError('');
      }
    }
  };

  const validateConfirmField = (text: string) => {
    setConfirmPassword(text);
    if (text.length > 0 && text !== password) {
      setConfirmError('❌ Las contraseñas no coinciden');
    } else {
      setConfirmError('');
    }
  };

  // ============ REGISTRO ============

  const handleRegister = async () => {
    // Validaciones finales
    if (!firstName || !lastName || !phone || !ci || !email || !password || !confirmPassword) {
      Alert.alert('⚠️ Campos incompletos', 'Por favor completa todos los datos.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('⚠️ Contraseñas no coinciden', 'Las contraseñas deben ser idénticas.');
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

      console.log('✅ Registro exitoso:', response.data);

      if (response.data.success) {
        Alert.alert(
          '🎉 ¡Bienvenido a Zenda!',
          'Tu cuenta ha sido creada exitosamente.\nAhora puedes iniciar sesión.',
          [{ text: 'Iniciar Sesión', onPress: () => navigation.navigate('Login') }]
        );
      } else {
        Alert.alert('❌ Error', response.data.message || 'Error al registrar');
      }
    } catch (error: any) {
      console.error('❌ Error en registro:', error);
      Alert.alert(
        '❌ Error de Registro',
        error.response?.data?.error || error.response?.data?.message || 'No se pudo procesar tu cuenta.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ============ RENDER ============

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* HEADER */}
          <View style={styles.headerContainer}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoSymbol}>Z</Text>
              <View style={styles.pulseDot} />
            </View>
            <Text style={styles.title}>ZENDA</Text>
            <Text style={styles.subtitle}>Crea tu cuenta de pasajero</Text>
          </View>

          {/* FORMULARIO PREMIUM */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Crear Cuenta</Text>
            <Text style={styles.cardSubtitle}>
              Únete a la revolución de la movilidad urbana
            </Text>

            {/* NOMBRES */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nombres</Text>
              <TextInput
                ref={firstNameRef}
                style={[styles.input, focusedField === 'firstName' && styles.inputFocused]}
                placeholder="Juan Carlos"
                placeholderTextColor="#94A3B8"
                value={firstName}
                onChangeText={setFirstName}
                onFocus={() => setFocusedField('firstName')}
                onBlur={() => setFocusedField('')}
                returnKeyType="next"
                onSubmitEditing={() => lastNameRef.current?.focus()}
              />
            </View>

            {/* APELLIDO PATERNO */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Apellido Paterno</Text>
              <TextInput
                ref={lastNameRef}
                style={[styles.input, focusedField === 'lastName' && styles.inputFocused]}
                placeholder="Pérez"
                placeholderTextColor="#94A3B8"
                value={lastName}
                onChangeText={setLastName}
                onFocus={() => setFocusedField('lastName')}
                onBlur={() => setFocusedField('')}
                returnKeyType="next"
                onSubmitEditing={() => motherLastNameRef.current?.focus()}
              />
            </View>

            {/* APELLIDO MATERNO */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Apellido Materno</Text>
              <TextInput
                ref={motherLastNameRef}
                style={[styles.input, focusedField === 'motherLastName' && styles.inputFocused]}
                placeholder="Rodríguez"
                placeholderTextColor="#94A3B8"
                value={motherLastName}
                onChangeText={setMotherLastName}
                onFocus={() => setFocusedField('motherLastName')}
                onBlur={() => setFocusedField('')}
                returnKeyType="next"
                onSubmitEditing={() => phoneRef.current?.focus()}
              />
            </View>

            {/* TELÉFONO +591 */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Celular</Text>
              <View style={styles.phoneContainer}>
                <View style={styles.prefixBox}>
                  <Text style={styles.prefixText}>🇧🇴 +591</Text>
                </View>
                <TextInput
                  ref={phoneRef}
                  style={[
                    styles.phoneInput,
                    phoneError ? styles.inputError : null,
                    focusedField === 'phone' && styles.inputFocused
                  ]}
                  placeholder="78912345"
                  placeholderTextColor="#94A3B8"
                  value={phone}
                  onChangeText={validatePhoneField}
                  keyboardType="phone-pad"
                  maxLength={8}
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField('')}
                  returnKeyType="next"
                  onSubmitEditing={() => ciRef.current?.focus()}
                />
              </View>
              {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
            </View>

            {/* CÉDULA DE IDENTIDAD */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Cédula de Identidad</Text>
              <TextInput
                ref={ciRef}
                style={[
                  styles.input,
                  ciError ? styles.inputError : null,
                  focusedField === 'ci' && styles.inputFocused
                ]}
                placeholder="1234567"
                placeholderTextColor="#94A3B8"
                value={ci}
                onChangeText={validateCIField}
                keyboardType="numeric"
                maxLength={8}
                onFocus={() => setFocusedField('ci')}
                onBlur={() => setFocusedField('')}
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
              />
              {ciError ? <Text style={styles.errorText}>{ciError}</Text> : null}
            </View>

            {/* CORREO ELECTRÓNICO */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Correo electrónico</Text>
              <TextInput
                ref={emailRef}
                style={[
                  styles.input,
                  emailError ? styles.inputError : null,
                  focusedField === 'email' && styles.inputFocused
                ]}
                placeholder="tucorreo@zenda.com"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={validateEmailField}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField('')}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
            </View>

            {/* CONTRASEÑA */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={[
                styles.passwordWrapper,
                passwordError ? styles.inputError : null,
                focusedField === 'password' && styles.inputFocused
              ]}>
                <TextInput
                  ref={passwordRef}
                  style={styles.passwordInput}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={validatePasswordField}
                  secureTextEntry={!showPassword}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField('')}
                  returnKeyType="next"
                  onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                    size={22} 
                    color="#64748B" 
                  />
                </TouchableOpacity>
              </View>
              {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
            </View>

            {/* CONFIRMAR CONTRASEÑA */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirmar Contraseña</Text>
              <View style={[
                styles.passwordWrapper,
                confirmError ? styles.inputError : null,
                focusedField === 'confirmPassword' && styles.inputFocused
              ]}>
                <TextInput
                  ref={confirmPasswordRef}
                  style={styles.passwordInput}
                  placeholder="Repite tu contraseña"
                  placeholderTextColor="#94A3B8"
                  value={confirmPassword}
                  onChangeText={validateConfirmField}
                  secureTextEntry={!showConfirmPassword}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField('')}
                  returnKeyType="done"
                  onSubmitEditing={handleRegister}
                />
                <TouchableOpacity 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} 
                    size={22} 
                    color="#64748B" 
                  />
                </TouchableOpacity>
              </View>
              {confirmError ? <Text style={styles.errorText}>{confirmError}</Text> : null}
            </View>

            {/* BOTÓN DE REGISTRO */}
            <TouchableOpacity
              style={[styles.buttonAction, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>🚀 Crear cuenta</Text>
              )}
            </TouchableOpacity>

            {/* LINK A LOGIN */}
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
    </SafeAreaView>
  );
}

// ============ ESTILOS PREMIUM ============

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  keyboardView: { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  
  headerContainer: { alignItems: 'center', marginBottom: 20 },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#1A3C6E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2ECC71',
    elevation: 6,
    shadowColor: '#2ECC71',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  logoSymbol: { fontSize: 28, fontWeight: '900', color: '#FFFFFF' },
  pulseDot: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2ECC71',
  },
  title: { fontSize: 28, fontWeight: '900', color: '#FFFFFF', letterSpacing: 3 },
  subtitle: { fontSize: 13, color: '#94A3B8', marginTop: 2, fontWeight: '500', letterSpacing: 1 },
  
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
  cardTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: '#64748B', marginBottom: 20, lineHeight: 18 },
  
  inputContainer: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 4 },
  
  input: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    fontSize: 15,
    color: '#0F172A',
  },
  inputFocused: {
    borderColor: '#2ECC71',
    borderWidth: 2,
    shadowColor: '#2ECC71',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  inputError: { borderColor: '#EF4444', borderWidth: 2 },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 4, marginLeft: 4 },
  
  phoneContainer: { flexDirection: 'row', alignItems: 'center' },
  prefixBox: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginRight: 10,
  },
  prefixText: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  phoneInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    fontSize: 15,
    color: '#0F172A',
  },
  
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
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
  
  buttonAction: {
    backgroundColor: '#2ECC71',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#2ECC71',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonDisabled: { backgroundColor: '#94A3B8', shadowOpacity: 0 },
  buttonText: { 
    color: '#FFFFFF', 
    fontWeight: '700', 
    fontSize: 17, 
    letterSpacing: 0.5 
  },
  
  linkContainer: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#64748B', fontSize: 14 },
  linkBold: { color: '#1A3C6E', fontWeight: '700' },
});
