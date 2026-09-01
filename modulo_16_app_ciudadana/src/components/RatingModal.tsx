// src/components/RatingModal.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { authService } from '../services/authService';

const API_MOBILITY = 'http://192.168.100.10:8103/api/v1/mobility';

interface RatingModalProps {
  visible: boolean;
  tripId: string;
  onClose: () => void;
  onSuccess: () => void;
}

// ✅ ETIQUETAS DINÁMICAS POR ESTRELLA
const getRatingText = (val: number): string => {
  switch (val) {
    case 1: return 'Muy deficiente 😞';
    case 2: return 'Regular 😐';
    case 3: return 'Bueno 🙂';
    case 4: return 'Muy bueno 😊';
    case 5: return '¡Excelente servicio! ⭐';
    default: return '¿Cómo fue tu experiencia?';
  }
};

// ✅ SUGERENCIAS RÁPIDAS POR CALIFICACIÓN
const getQuickSuggestions = (rating: number): string[] => {
  if (rating >= 4) {
    return ['Conductor amable', 'Vehículo limpio', 'Buena ruta', 'Llegó a tiempo'];
  } else if (rating >= 3) {
    return ['Aceptable', 'Podría mejorar', 'Regular'];
  } else if (rating >= 1) {
    return ['Mala experiencia', 'Conductor grosero', 'Vehículo sucio', 'Llegó tarde'];
  }
  return [];
};

export const RatingModal: React.FC<RatingModalProps> = ({
  visible,
  tripId,
  onClose,
  onSuccess,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));

  // ✅ RESETEAR ESTADO AL ABRIR
  useEffect(() => {
    if (visible) {
      setRating(0);
      setComment('');
      setShowSuccess(false);
      setLoading(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  // ✅ SUGERENCIAS RÁPIDAS
  const quickSuggestions = getQuickSuggestions(rating);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('⚠️ Califica tu viaje', 'Por favor, selecciona un puntaje de 1 a 5 estrellas.');
      return;
    }

    setLoading(true);
    try {
      const token = await authService.getToken();
      const response = await axios.post(
        `${API_MOBILITY}/trips/${tripId}/rate`,
        { rating, comment },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      if (response.data.success) {
        // ✅ ÉXITO CON ANIMACIÓN DE CIERRE
        setShowSuccess(true);
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }).start();

        setTimeout(() => {
          onSuccess();
          onClose();
          setRating(0);
          setComment('');
          setShowSuccess(false);
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }).start();
        }, 1200);
      } else {
        Alert.alert('❌ Error', response.data.message || 'No se pudo enviar la calificación.');
      }
    } catch (error) {
      console.error('Error enviando calificación:', error);
      Alert.alert('❌ Error', 'No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ SELECCIONAR SUGERENCIA RÁPIDA
  const selectSuggestion = (suggestion: string) => {
    setComment(comment ? `${comment}, ${suggestion}` : suggestion);
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.7}>
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={48}
              color={star <= rating ? '#F5A623' : '#D1D5DB'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
        <View style={styles.modalContent}>
          <View style={styles.modalHandle} />

          <View style={styles.header}>
            <Text style={styles.title}>⭐ Califica tu viaje</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-outline" size={24} color="#1E293B" />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            {/* ✅ ETIQUETA DINÁMICA */}
            <Text style={styles.subtitle}>
              {rating > 0 ? getRatingText(rating) : '¿Cómo fue tu experiencia?'}
            </Text>

            {renderStars()}

            {/* ✅ SUGERENCIAS RÁPIDAS (solo si hay rating) */}
            {rating > 0 && quickSuggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                <Text style={styles.suggestionsLabel}>Sugerencias rápidas:</Text>
                <View style={styles.suggestionsRow}>
                  {quickSuggestions.slice(0, 3).map((suggestion, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.suggestionChip}
                      onPress={() => selectSuggestion(suggestion)}
                    >
                      <Text style={styles.suggestionChipText}>{suggestion}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <TextInput
              style={styles.commentInput}
              placeholder="Escribe un comentario (opcional)"
              placeholderTextColor="#94A3B8"
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : showSuccess ? (
                <Text style={styles.submitBtnText}>✅ ¡Gracias!</Text>
              ) : (
                <Text style={styles.submitBtnText}>Enviar calificación</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    minHeight: 420,
    maxHeight: '80%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  body: {
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 12,
    minHeight: 24,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  suggestionsContainer: {
    width: '100%',
    marginBottom: 12,
  },
  suggestionsLabel: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 6,
  },
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  suggestionChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  suggestionChipText: {
    fontSize: 12,
    color: '#1E293B',
  },
  commentInput: {
    width: '100%',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    minHeight: 60,
    fontSize: 14,
    color: '#1E293B',
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  submitBtn: {
    width: '100%',
    backgroundColor: '#1A3C6E',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default RatingModal;
