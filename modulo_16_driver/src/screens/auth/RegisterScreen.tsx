import React, { useState } from 'react';
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
  ScrollView,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../../services/authService';
import { guestService } from '../../services/guestService';
import SelfieCapture from '../../../modulo_16_app_ciudadana/src/components/SelfieCapture';
import DocumentCapture from '../../../modulo_16_app_ciudadana/src/components/DocumentCapture';

export default function RegisterScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showSelfieCapture, setShowSelfieCapture] = useState(false);
  const [showDocumentCapture, setShowDocumentCapture] = useState(false);
  const [docSide, setDocSide] = useState<'front' | 'back'>('front');
  const [selfieUri, setSelfieUri] = useState<string | null>(null);
  const [documentFrontUri, setDocumentFrontUri] = useState<string | null>(null);
  const [documentBackUri, setDocumentBackUri] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    // Datos de licencia
    licenseNumber: '',
    licenseCategory: 'A', // A, B, C, D
    licenseExpiry: '',
    // Datos de vehículo
    vehiclePlate: '',
    vehicleBrand: '',
    vehicleModel: '',
    vehicleYear: '',
    vehicleColor: '',
    vehicleType: 'MOTO', // MOTO, TAXI, MINIBUS
  });

  const licenseCategories = ['A', 'B', 'C', 'D', 'E', 'F'];
  const vehicleTypes = ['MOTO', 'TAXI', 'MINIBUS', 'CARGO'];

  const handleRegister = async () => {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      confirmPassword,
      licenseNumber,
      licenseCategory,
      vehiclePlate,
      vehicleBrand,
      vehicleModel,
      vehicleYear,
      vehicleColor,
      vehicleType,
    } = formData;

    // Validaciones básicas
    if (!firstName || !lastName || !email || !phone || !password) {
      Alert.alert('⚠️ Error', 'Todos los campos son obligatorios.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('⚠️ Error', 'Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('⚠️ Error', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (!licenseNumber || !licenseCategory) {
      Alert.alert('⚠️ Error', 'Los datos de la licencia son obligatorios.');
      return;
    }
    if (!vehiclePlate || !vehicleBrand || !vehicleModel || !vehicleYear) {
      Alert.alert('⚠️ Error', 'Los datos del vehículo son obligatorios.');
      return;
    }
    if (!selfieUri) {
      Alert.alert('⚠️ Error', 'Debes tomar una selfie para verificar tu identidad.');
      return;
    }
    if (!documentFrontUri || !documentBackUri) {
      Alert.alert('⚠️ Error', 'Debes capturar el anverso y reverso de tu carnet.');
      return;
    }
    if (!acceptedTerms) {
      Alert.alert('⚠️ Términos y Condiciones', 'Debes aceptar los Términos y Condiciones para registrarte.');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.registerDriver({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        password,
        role: 'driver',
        license: {
          number: licenseNumber,
          category: licenseCategory,
          expiry: licenseExpiry,
        },
        vehicle: {
          plate: vehiclePlate,
          brand: vehicleBrand,
          model: vehicleModel,
          year: parseInt(vehicleYear),
          color: vehicleColor,
          type: vehicleType,
        },
        documents: {
          selfie: selfieUri,
          documentFront: documentFrontUri,
          documentBack: documentBackUri,
        },
      });

      if (response.success) {
        Alert.alert('✅ Registro exitoso', 'Tu cuenta de conductor ha sido creada. ¡Bienvenido a Zenda!');
        await guestService.resetGuestState();
        navigation.replace('Login');
      } else {
        Alert.alert('❌ Error', response.error || 'No se pudo registrar el conductor.');
      }
    } catch (error) {
      Alert.alert('❌ Error', 'Ocurrió un error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color="#1A3C6E" />
        </TouchableOpacity>

        <Text style={styles.title}>Registro de Conductor</Text>
        <Text style={styles.subtitle}>Completa tus datos para comenzar a ganar</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Datos Personales</Text>

          <TextInput
            style={styles.input}
            placeholder="Nombre"
            placeholderTextColor="#94A3B8"
            value={formData.firstName}
            onChangeText={(text) => setFormData({ ...formData, firstName: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Apellido"
            placeholderTextColor="#94A3B8"
            value={formData.lastName}
            onChangeText={(text) => setFormData({ ...formData, lastName: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            placeholderTextColor="#94A3B8"
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Teléfono"
            placeholderTextColor="#94A3B8"
            keyboardType="phone-pad"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="#94A3B8"
            secureTextEntry
            value={formData.password}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Confirmar contraseña"
            placeholderTextColor="#94A3B8"
            secureTextEntry
            value={formData.confirmPassword}
            onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚗 Datos de Licencia</Text>

          <TextInput
            style={styles.input}
            placeholder="Número de licencia"
            placeholderTextColor="#94A3B8"
            value={formData.licenseNumber}
            onChangeText={(text) => setFormData({ ...formData, licenseNumber: text })}
          />

          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Categoría de licencia</Text>
            <View style={styles.pickerOptions}>
              {licenseCategories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.pickerOption,
                    formData.licenseCategory === cat && styles.pickerOptionActive,
                  ]}
                  onPress={() => setFormData({ ...formData, licenseCategory: cat })}
                >
                  <Text
                    style={[
                      styles.pickerOptionText,
                      formData.licenseCategory === cat && styles.pickerOptionTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Fecha de vencimiento (DD/MM/AAAA)"
            placeholderTextColor="#94A3B8"
            value={formData.licenseExpiry}
            onChangeText={(text) => setFormData({ ...formData, licenseExpiry: text })}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚘 Datos del Vehículo</Text>

          <TextInput
            style={styles.input}
            placeholder="Placa"
            placeholderTextColor="#94A3B8"
            value={formData.vehiclePlate}
            onChangeText={(text) => setFormData({ ...formData, vehiclePlate: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Marca"
            placeholderTextColor="#94A3B8"
            value={formData.vehicleBrand}
            onChangeText={(text) => setFormData({ ...formData, vehicleBrand: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Modelo"
            placeholderTextColor="#94A3B8"
            value={formData.vehicleModel}
            onChangeText={(text) => setFormData({ ...formData, vehicleModel: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Año"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
            value={formData.vehicleYear}
            onChangeText={(text) => setFormData({ ...formData, vehicleYear: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Color"
            placeholderTextColor="#94A3B8"
            value={formData.vehicleColor}
            onChangeText={(text) => setFormData({ ...formData, vehicleColor: text })}
          />

          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Tipo de vehículo</Text>
            <View style={styles.pickerOptions}>
              {vehicleTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.pickerOption,
                    formData.vehicleType === type && styles.pickerOptionActive,
                  ]}
                  onPress={() => setFormData({ ...formData, vehicleType: type })}
                >
                  <Text
                    style={[
                      styles.pickerOptionText,
                      formData.vehicleType === type && styles.pickerOptionTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📸 Verificación de Identidad</Text>

          <View style={styles.docRow}>
            <TouchableOpacity
              style={[styles.docBtn, selfieUri && styles.docBtnCompleted]}
              onPress={() => setShowSelfieCapture(true)}
            >
              <Ionicons
                name={selfieUri ? 'checkmark-circle' : 'camera-outline'}
                size={24}
                color={selfieUri ? '#2ECC71' : '#1A3C6E'}
              />
              <Text style={[styles.docBtnText, selfieUri && styles.docBtnTextCompleted]}>
                {selfieUri ? 'Selfie ✓' : 'Tomar Selfie'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.docBtn, documentFrontUri && styles.docBtnCompleted]}
              onPress={() => {
                setDocSide('front');
                setShowDocumentCapture(true);
              }}
            >
              <Ionicons
                name={documentFrontUri ? 'checkmark-circle' : 'document-outline'}
                size={24}
                color={documentFrontUri ? '#2ECC71' : '#1A3C6E'}
              />
              <Text style={[styles.docBtnText, documentFrontUri && styles.docBtnTextCompleted]}>
                {documentFrontUri ? 'Anverso ✓' : 'CI - Anverso'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.docBtn, documentBackUri && styles.docBtnCompleted]}
              onPress={() => {
                setDocSide('back');
                setShowDocumentCapture(true);
              }}
            >
              <Ionicons
                name={documentBackUri ? 'checkmark-circle' : 'document-outline'}
                size={24}
                color={documentBackUri ? '#2ECC71' : '#1A3C6E'}
              />
              <Text style={[styles.docBtnText, documentBackUri && styles.docBtnTextCompleted]}>
                {documentBackUri ? 'Reverso ✓' : 'CI - Reverso'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.termsContainer}
          activeOpacity={0.8}
          onPress={() => setAcceptedTerms(!acceptedTerms)}
        >
          <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
            {acceptedTerms && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
          </View>
          <Text style={styles.termsText}>
            Acepto los <Text style={styles.termsLink}>Términos, Condiciones</Text> y Políticas de Privacidad.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Registrarme como Conductor</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.replace('Login')}>
          <Text style={styles.loginText}>
            ¿Ya tienes cuenta? <Text style={styles.loginLink}>Inicia sesión</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* MODAL PARA SELFIE */}
      <Modal visible={showSelfieCapture} animationType="slide" transparent={false}>
        <SelfieCapture
          onCapture={(uri) => {
            setSelfieUri(uri);
            setShowSelfieCapture(false);
          }}
          onCancel={() => setShowSelfieCapture(false)}
        />
      </Modal>

      {/* MODAL PARA DOCUMENTO */}
      <Modal visible={showDocumentCapture} animationType="slide" transparent={false}>
        <DocumentCapture
          side={docSide}
          onCapture={(uri) => {
            if (docSide === 'front') {
              setDocumentFrontUri(uri);
            } else {
              setDocumentBackUri(uri);
            }
            setShowDocumentCapture(false);
          }}
          onCancel={() => setShowDocumentCapture(false)}
        />
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40 },
  backBtn: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1A3C6E' },
  subtitle: { fontSize: 14, color: '#64748B', marginBottom: 20 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1E293B', marginBottom: 10 },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    color: '#1E293B',
    marginBottom: 8,
  },
  pickerContainer: { marginBottom: 8 },
  pickerLabel: { fontSize: 14, color: '#64748B', marginBottom: 4 },
  pickerOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pickerOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pickerOptionActive: { backgroundColor: '#1A3C6E', borderColor: '#1A3C6E' },
  pickerOptionText: { fontSize: 13, color: '#1E293B' },
  pickerOptionTextActive: { color: '#FFFFFF' },
  docRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  docBtn: {
    flex: 1,
    minWidth: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  docBtnCompleted: { backgroundColor: '#E8F5E9', borderColor: '#2ECC71' },
  docBtnText: { fontSize: 12, color: '#1E293B' },
  docBtnTextCompleted: { color: '#2ECC71', fontWeight: '600' },
  termsContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 12, gap: 10 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#1A3C6E',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: { backgroundColor: '#2ECC71', borderColor: '#2ECC71' },
  termsText: { flex: 1, fontSize: 13, color: '#64748B' },
  termsLink: { color: '#1A3C6E', fontWeight: 'bold' },
  button: {
    backgroundColor: '#1A3C6E',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  loginText: { textAlign: 'center', marginTop: 16, color: '#64748B' },
  loginLink: { color: '#1A3C6E', fontWeight: 'bold' },
});
