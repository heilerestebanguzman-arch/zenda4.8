import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const services = [
  { 
    id: 'moto', 
    icon: 'bicycle-outline', 
    label: 'Moto', 
    description: 'Rápido y económico',
    price: 'Bs 3.00',
    type: 'privado',
    capacity: '1-2 pasajeros',
    eta: '2 min'
  },
  { 
    id: 'taxi', 
    icon: 'car-outline', 
    label: 'Auto', 
    description: 'Comodidad y espacio',
    price: 'Bs 5.00',
    type: 'privado',
    capacity: '4 pasajeros',
    eta: '4 min'
  },
  { 
    id: 'minibus', 
    icon: 'bus-outline', 
    label: 'Minibus', 
    description: 'Ruta compartida',
    price: 'Bs 2.50',
    type: 'masivo',
    capacity: '12 pasajeros',
    eta: '6 min'
  },
  { 
    id: 'cargo', 
    icon: 'cube-outline', 
    label: 'Envíos', 
    description: 'Paquetes express',
    price: 'Bs 4.00',
    type: 'privado',
    capacity: 'Paquetes',
    eta: '5 min'
  },
];

export const ServiceSelector = ({ selectedId = 'moto', onSelect }) => {
  const [selected, setSelected] = useState(selectedId);

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {services.map((service) => {
          const isActive = selected === service.id;
          const isMasivo = service.type === 'masivo';
          
          return (
            <TouchableOpacity
              key={service.id}
              style={[
                styles.serviceCard,
                isActive && styles.serviceCardActive,
                isMasivo && styles.serviceCardMasivo,
                isActive && isMasivo && styles.serviceCardMasivoActive,
              ]}
              onPress={() => { setSelected(service.id); onSelect(service); }}
              activeOpacity={0.7}
            >
              <View style={[
                styles.iconContainer,
                isActive && styles.iconContainerActive,
                isMasivo && styles.iconContainerMasivo,
                isActive && isMasivo && styles.iconContainerMasivoActive,
              ]}>
                <Ionicons 
                  name={service.icon} 
                  size={24} 
                  color={isActive ? '#FFFFFF' : '#1A3C6E'} 
                />
              </View>
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {service.label}
              </Text>
              <Text style={[styles.price, isActive && styles.priceActive]}>
                {service.price}
              </Text>
              <View style={[
                styles.badge,
                isMasivo && styles.badgeMasivo,
                isActive && styles.badgeActive
              ]}>
                <Text style={[
                  styles.badgeText,
                  isActive && styles.badgeTextActive
                ]}>
                  {service.capacity}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    marginHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  serviceCard: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 12,
    minWidth: 70,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  serviceCardActive: {
    backgroundColor: '#1A3C6E',
    borderColor: '#D4AF37',
  },
  serviceCardMasivo: {
    borderColor: '#2ECC71',
    borderWidth: 1,
  },
  serviceCardMasivoActive: {
    backgroundColor: '#0F7A4A',
    borderColor: '#D4AF37',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  iconContainerActive: {
    backgroundColor: '#2ECC71',
  },
  iconContainerMasivo: {
    backgroundColor: '#E8F5E9',
  },
  iconContainerMasivoActive: {
    backgroundColor: '#F5A623',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  labelActive: {
    color: '#FFFFFF',
  },
  price: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A3C6E',
    marginTop: 2,
  },
  priceActive: {
    color: '#F5A623',
  },
  badge: {
    marginTop: 4,
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeMasivo: {
    backgroundColor: '#2ECC71',
  },
  badgeActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  badgeText: {
    fontSize: 8,
    color: '#64748B',
  },
  badgeTextActive: {
    color: '#FFFFFF',
  },
});
