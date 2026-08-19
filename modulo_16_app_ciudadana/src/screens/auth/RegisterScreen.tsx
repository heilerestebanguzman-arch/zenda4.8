import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const API_BASE = 'https://abc123.ngrok.io';

export default function RegisterScreen({ navigation }: any) {
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

  const scrollViewRef = useRef<ScrollView>(null);
  const lastNameRef = useRef<TextInput>(null);
  const motherLastNameRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const ciRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const handleRegister = async () => {
    if (!firstName || !lastName || !phone || !ci || !email || !password || !confirmPassword) {
      Alert.alert('Campos incompletos', 'Por favor completa todos los datos.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener mínimo 6 caracteres.');
      return;
    }
    setLoading(true);
    try {
      const fullName = `${firstName} ${lastName} ${motherLastName}`.trim();
      console.log('📤 Enviando registro:', { firstName, lastName, motherLastName, phone, ci, email, password, fullName });
      
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
      
      console.log('📥 Respuesta del servidor:', response.data);
      
      if (response.data.success && response.data.data?.user) {
        Alert.alert(
          '🎉 ¡Bienvenido a Zenda!',
          'Tu cuenta fue creada exitosamente.',
          [{ text: 'Iniciar Sesión', onPress: () => navigation.navigate('Login') }]
        );
      } else {
        Alert.alert('Error', response.data.message || 'No se pudo crear la cuenta.');
      }
    } catch (error: any) {
      console.error('❌ Error en registro:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message ||
        error.response?.data?.error ||
        'No se pudo conectar con el servidor. Verifica tu conexión.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={s.header}>
            <View style={s.logoBadge}>
              <Text style={s.logoSymbol}>Z</Text>
              <View style={s.pulseDot} />
            </View>
            <Text style={s.title}>ZENDA</Text>
            <Text style={s.subtitle}>Crea tu cuenta de pasajero</Text>
          </View>

          <View style={s.card}>
            <Text style={s.cardTitle}>Crear Cuenta</Text>
            <Text style={s.cardSub}>Únete a la revolución de la movilidad urbana</Text>

            <Text style={s.label}>Nombres</Text>
            <TextInput style={s.input} placeholder="Juan Carlos" placeholderTextColor="#94A3B8"
              value={firstName} onChangeText={setFirstName}
              returnKeyType="next" onSubmitEditing={() => lastNameRef.current?.focus()} />

            <Text style={s.label}>Apellido Paterno</Text>
            <TextInput ref={lastNameRef} style={s.input} placeholder="Pérez" placeholderTextColor="#94A3B8"
              value={lastName} onChangeText={setLastName}
              returnKeyType="next" onSubmitEditing={() => motherLastNameRef.current?.focus()} />

            <Text style={s.label}>Apellido Materno</Text>
            <TextInput ref={motherLastNameRef} style={s.input} placeholder="Rodríguez" placeholderTextColor="#94A3B8"
              value={motherLastName} onChangeText={setMotherLastName}
              returnKeyType="next" onSubmitEditing={() => phoneRef.current?.focus()} />

            <Text style={s.label}>Celular</Text>
            <View style={s.phoneRow}>
              <View style={s.prefixBox}><Text style={s.prefixText}>🇧🇴 +591</Text></View>
              <TextInput ref={phoneRef} style={s.phoneInput} placeholder="78912345" placeholderTextColor="#94A3B8"
                value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={8}
                returnKeyType="next" onSubmitEditing={() => ciRef.current?.focus()} />
            </View>

            <Text style={s.label}>Cédula de Identidad</Text>
            <TextInput ref={ciRef} style={s.input} placeholder="1234567" placeholderTextColor="#94A3B8"
              value={ci} onChangeText={setCi} keyboardType="numeric" maxLength={8}
              returnKeyType="next" onSubmitEditing={() => emailRef.current?.focus()} />

            <Text style={s.label}>Correo electrónico</Text>
            <TextInput ref={emailRef} style={s.input} placeholder="tucorreo@zenda.com" placeholderTextColor="#94A3B8"
              value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none"
              returnKeyType="next" onSubmitEditing={() => passwordRef.current?.focus()} />

            {/* 🔐 CAMPO CONTRASEÑA */}
            <Text style={s.label}>Contraseña</Text>
            <View style={s.passRow}>
              <TextInput
                ref={passwordRef}
                style={s.passInput}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCorrect={false}
                autoCapitalize="none"
                autoComplete="off"
                textContentType="none"
                importantForAutofill="no"
                blurOnSubmit={false}
                returnKeyType="next"
                onSubmitEditing={() => {
                  setTimeout(() => confirmRef.current?.focus(), 50);
                }}
              />
              <TouchableOpacity style={s.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color="#1A3C6E" />
              </TouchableOpacity>
            </View>

            {/* 🔐 CAMPO CONFIRMAR CONTRASEÑA */}
            <Text style={s.label}>Confirmar Contraseña</Text>
            <View style={[s.passRow, password !== confirmPassword && confirmPassword.length > 0 ? s.errorBorder : null]}>
              <TextInput
                ref={confirmRef}
                style={s.passInput}
                placeholder="Repite tu contraseña"
                placeholderTextColor="#94A3B8"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCorrect={false}
                autoCapitalize="none"
                autoComplete="off"
                textContentType="none"
                importantForAutofill="no"
                blurOnSubmit={false}
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />
              <TouchableOpacity style={s.eyeBtn} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color="#1A3C6E" />
              </TouchableOpacity>
            </View>
            {password !== confirmPassword && confirmPassword.length > 0 && (
              <Text style={s.errorText}>Las contraseñas no coinciden</Text>
            )}

            <TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={handleRegister} disabled={loading}>
              {loading ? <ActivityIndicator color="white" /> : <Text style={s.btnText}>Crear cuenta</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={s.linkRow}>
              <Text style={s.linkText}>¿Ya tienes una cuenta? <Text style={s.linkBold}>Inicia sesión</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  header: { alignItems: 'center', marginBottom: 24 },
  logoBadge: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#1A3C6E', justifyContent: 'center', alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: '#2ECC71', elevation: 6 },
  logoSymbol: { fontSize: 28, fontWeight: '900', color: '#fff' },
  pulseDot: { position: 'absolute', bottom: 6, right: 6, width: 8, height: 8, borderRadius: 4, backgroundColor: '#2ECC71' },
  title: { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: 3 },
  subtitle: { fontSize: 13, color: '#94A3B8', marginTop: 2, letterSpacing: 1 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 24, elevation: 10 },
  cardTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  cardSub: { fontSize: 13, color: '#64748B', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 4, marginTop: 10 },
  input: { backgroundColor: '#F8FAFC', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: '#E2E8F0', fontSize: 15, color: '#0F172A' },
  phoneRow: { flexDirection: 'row', alignItems: 'center' },
  prefixBox: { backgroundColor: '#F1F5F9', paddingHorizontal: 14, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: '#E2E8F0', marginRight: 10 },
  prefixText: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  phoneInput: { flex: 1, backgroundColor: '#F8FAFC', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: '#E2E8F0', fontSize: 15, color: '#0F172A' },
  passRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 14, borderWidth: 1.5, borderColor: '#E2E8F0' },
  passInput: { flex: 1, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#0F172A' },
  eyeBtn: { paddingHorizontal: 14, paddingVertical: 14 },
  errorBorder: { borderColor: '#EF4444' },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 4 },
  btn: { backgroundColor: '#2ECC71', paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginTop: 20, elevation: 4 },
  btnDisabled: { backgroundColor: '#94A3B8' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 17 },
  linkRow: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#64748B', fontSize: 14 },
  linkBold: { color: '#1A3C6E', fontWeight: '700' },
});
