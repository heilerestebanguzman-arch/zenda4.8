import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const navItems = [
  { id: 'home', icon: 'home-outline', label: 'Inicio' },
  { id: 'history', icon: 'time-outline', label: 'Historial' },
  { id: 'earnings', icon: 'cash-outline', label: 'Ganancias' },
  { id: 'profile', icon: 'person-outline', label: 'Perfil' },
];

interface BottomNavBarProps {
  active: string;
  onSelect: (id: string) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ active, onSelect }) => {
  return (
    <View style={styles.container}>
      {navItems.map((item) => (
        <TouchableOpacity key={item.id} style={styles.navItem} onPress={() => onSelect(item.id)}>
          <Ionicons
            name={item.icon as any}
            size={24}
            color={active === item.id ? '#1A3C6E' : '#94A3B8'}
          />
          <Text style={[styles.navLabel, active === item.id && styles.navLabelActive]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingVertical: 10,
    borderRadius: 16,
    elevation: 8,
  },
  navItem: { alignItems: 'center' },
  navLabel: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  navLabelActive: { color: '#1A3C6E', fontWeight: '600' },
});

export default BottomNavBar;
