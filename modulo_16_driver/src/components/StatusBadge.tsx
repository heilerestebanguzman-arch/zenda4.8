import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatusBadgeProps {
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return { label: 'Pendiente', color: '#F5A623', bg: '#FEF3C7' };
      case 'accepted':
        return { label: 'Aceptado', color: '#3B82F6', bg: '#DBEAFE' };
      case 'in_progress':
        return { label: 'En curso', color: '#2ECC71', bg: '#D1FAE5' };
      case 'completed':
        return { label: 'Completado', color: '#1A3C6E', bg: '#E2E8F0' };
      case 'cancelled':
        return { label: 'Cancelado', color: '#EF4444', bg: '#FEE2E2' };
      default:
        return { label: 'Desconocido', color: '#94A3B8', bg: '#F1F5F9' };
    }
  };

  const config = getStatusConfig();

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.color }]}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  text: { fontSize: 11, fontWeight: '600' },
});

export default StatusBadge;
