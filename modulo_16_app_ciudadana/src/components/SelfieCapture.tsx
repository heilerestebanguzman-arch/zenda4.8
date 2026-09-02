import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';

interface SelfieCaptureProps {
  onCapture: (uri: string) => void;
  onCancel: () => void;
}

export const SelfieCapture: React.FC<SelfieCaptureProps> = ({ onCapture, onCancel }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const takePicture = async () => {
    if (cameraRef.current) {
      setLoading(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
        });
        setCapturedImage(photo.uri);
      } catch (error) {
        Alert.alert('Error', 'No se pudo tomar la foto.');
      } finally {
        setLoading(false);
      }
    }
  };

  const confirmSelfie = async () => {
    if (capturedImage) {
      try {
        const fileName = `selfie_${Date.now()}.jpg`;
        const newPath = `${FileSystem.documentDirectory}${fileName}`;
        await FileSystem.copyAsync({
          from: capturedImage,
          to: newPath,
        });
        onCapture(newPath);
      } catch (error) {
        Alert.alert('Error', 'No se pudo guardar la imagen.');
      }
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1A3C6E" />
        <Text style={styles.text}>Solicitando permisos de cámara...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Sin acceso a la cámara</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Conceder permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {capturedImage ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedImage }} style={styles.previewImage} />
          <View style={styles.previewButtons}>
            <TouchableOpacity style={styles.retakeBtn} onPress={() => setCapturedImage(null)}>
              <Ionicons name="refresh-outline" size={24} color="#FFFFFF" />
              <Text style={styles.btnText}>Reintentar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={confirmSelfie}>
              <Ionicons name="checkmark-outline" size={24} color="#FFFFFF" />
              <Text style={styles.btnText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="front"
          />
          <View style={styles.overlay}>
            <View style={styles.overlayFrame}>
              <Text style={styles.overlayText}>Coloca tu rostro dentro del marco</Text>
            </View>
          </View>
          <View style={styles.cameraButtons}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
              <Text style={styles.btnText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.captureBtn} onPress={takePicture} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <View style={styles.captureCircle} />
              )}
            </TouchableOpacity>
            <View style={{ width: 80 }} />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  cameraContainer: { flex: 1 },
  camera: { flex: 1 },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayFrame: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 3,
    borderColor: '#2ECC71',
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  cameraButtons: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  captureBtn: { alignItems: 'center', justifyContent: 'center', width: 80, height: 80 },
  captureCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#FFFFFF', borderWidth: 4, borderColor: '#1A3C6E' },
  cancelBtn: { padding: 12 },
  btnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  previewContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000' },
  previewImage: { width: '90%', height: '70%', borderRadius: 16, resizeMode: 'cover' },
  previewButtons: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 20, paddingHorizontal: 20 },
  retakeBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EF4444', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, gap: 8 },
  confirmBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2ECC71', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, gap: 8 },
  text: { color: '#FFFFFF', textAlign: 'center', marginTop: 20 },
  errorText: { color: '#EF4444', fontSize: 18, textAlign: 'center', marginTop: 40 },
  button: { backgroundColor: '#1A3C6E', padding: 14, borderRadius: 12, marginTop: 20 },
  buttonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
});

export default SelfieCapture;
