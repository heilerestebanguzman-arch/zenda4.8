import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Service {
  id: string;
  icon: string;
  label: string;
  description: string;
}

interface ServiceSelectorProps {
  onSelect: (service: Service) => void;
  selectedId?: string;
}

const services: Service[] = [
  { id: 'moto', icon: 'bicycle-outline', label: 'Moto', description: 'Rápido y económico' },
  { id: 'taxi', icon: 'car-outline', label: 'Auto', description: 'Comodidad y espacio' },
  { id: 'minibus', icon: 'bus-outline', label: 'Minibus', description: 'Ruta compartida' },
  { id: 'cargo', icon: 'cube-outline', label: 'Envíos', description: 'Paquetes express' },
];

export const ServiceSelector: React.FC<ServiceSelectorProps> = ({ onSelect, selectedId = 'moto' }) => {
  const [selected, setSelected] = useState(selectedId);

  const handleSelect = (service: Service) => {
    setSelected(service.id);
    onSelect(service);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {services.map((service) => (
          <TouchableOpacity
            key={service.id}
            style={[
              styles.serviceCard,
              selected === service.id && styles.serviceCardActive,
            ]}
            onPress={() => handleSelect(service)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.iconContainer,
              selected === service.id && styles.iconContainerActive,
            ]}>
              <Ionicons
                name={service.icon as any}
                size={24}
                color={selected === service.id ? '#FFFFFF' : '#1A3C6E'}
              />
            </View>
            <Text style={[
              styles.label,
              selected === service.id && styles.labelActive,
            ]}>
              {service.label}
            </Text>
            <Text style={[
              styles.description,
              selected === service.id && styles.descriptionActive,
            ]}>
              {service.description}
            </Text>
          </TouchableOpacity>
        ))}
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
    marginBottom: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  scrollContent: {
    paddingHorizontal: 8,
  },
  serviceCard: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 12,
    minWidth: 70,
  },
  serviceCardActive: {
    backgroundColor: '#1A3C6E',
    borderWidth: 1,
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
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  labelActive: {
    color: '#FFFFFF',
  },
  description: {
    fontSize: 10,
    color: '#94A3B8',
  },
  descriptionActive: {
    color: '#94A3B8',
  },
});
