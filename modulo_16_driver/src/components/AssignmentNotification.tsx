import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Assignment {
  tripId: string;
  distance: number;
  eta: number;
  fare: number;
  origin: string;
  destination: string;
  score: number;
}

interface AssignmentNotificationProps {
  assignment: Assignment | null;
  onAccept: (tripId: string) => void;
  onReject: (tripId: string) => void;
  timeout?: number;
}

export const AssignmentNotification: React.FC<AssignmentNotificationProps> = ({
  assignment,
  onAccept,
  onReject,
  timeout = 15000,
}) => {
  const [slideAnim] = useState(new Animated.Value(-100));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (assignment) {
      // Animación de entrada
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();

      // Temporizador para expirar la oferta
      const t = setTimeout(() => {
        onReject(assignment.tripId);
      }, timeout);
      setTimer(t);
    } else {
      // Animación de salida
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [assignment]);

  if (!assignment) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="car-sport" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>🆕 Nuevo viaje disponible</Text>
            <Text style={styles.subtitle}>
              Distancia: {assignment.distance} km • ETA: {assignment.eta} min
            </Text>
          </View>
        </View>

        <View style={styles.routeInfo}>
          <View style={styles.routePoint}>
            <Ionicons name="location-outline" size={16} color="#1A3C6E" />
            <Text style={styles.routeText} numberOfLines={1}>
              {assignment.origin || 'Origen'}
            </Text>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.routePoint}>
            <Ionicons name="navigate-outline" size={16} color="#2ECC71" />
            <Text style={styles.routeText} numberOfLines={1}>
              {assignment.destination || 'Destino'}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.fareContainer}>
            <Text style={styles.fareLabel}>💰 Tarifa</Text>
            <Text style={styles.fareAmount}>Bs {assignment.fare.toFixed(2)}</Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.rejectBtn]}
              onPress={() => onReject(assignment.tripId)}
            >
              <Text style={styles.rejectBtnText}>Rechazar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.acceptBtn]}
              onPress={() => onAccept(assignment.tripId)}
            >
              <Text style={styles.acceptBtnText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    padding: 16,
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A3C6E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: { flex: 1 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  subtitle: { fontSize: 13, color: '#64748B' },
  routeInfo: { marginVertical: 8, paddingLeft: 4 },
  routePoint: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  routeLine: { width: 2, height: 8, backgroundColor: '#E2E8F0', marginLeft: 11 },
  routeText: { fontSize: 14, color: '#1E293B', flex: 1 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  fareContainer: { alignItems: 'center' },
  fareLabel: { fontSize: 11, color: '#94A3B8' },
  fareAmount: { fontSize: 16, fontWeight: 'bold', color: '#1A3C6E' },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  rejectBtn: { backgroundColor: '#F1F5F9' },
  rejectBtnText: { color: '#64748B', fontWeight: '600', fontSize: 13 },
  acceptBtn: { backgroundColor: '#2ECC71' },
  acceptBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },
});

export default AssignmentNotification;
