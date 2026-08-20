import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, SafeAreaView,
} from 'react-native';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    Alert.alert('🔐 Login', 'Función en desarrollo');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>ZENDA</Text>
          <Text style={styles.subtitle}>Movilidad Urbana Inteligente</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Iniciar Sesión</Text>
          <Text style={styles.cardSubtitle}>Ingresa tus credenciales para continuar</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
              style={styles.input}
              placeholder="admin@zenda.com"
              placeholderTextColor="#94A3B8"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#94A3B8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Ingresar a Zenda</Text>}
          </TouchableOpacity>

          {/* 👇 ESTE ES EL BOTÓN QUE NAVEGA A REGISTER */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            style={styles.linkContainer}
          >
            <Text style={styles.linkText}>
              ¿No tienes una cuenta? <Text style={styles.linkGreen}>Regístrate aquí</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  innerContainer: { flex: 1, justifyContent: 'center', padding: 24 },
  headerContainer: { alignItems: 'center', marginBottom: 32 },
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
  buttonDisabled: { backgroundColor: '#94A3B8' },
  buttonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16, letterSpacing: 0.5 },
  linkContainer: { marginTop: 16, alignItems: 'center' },
  linkText: { color: '#64748B', fontSize: 14 },
  linkGreen: { color: '#2ECC71', fontWeight: 'bold' },
});
