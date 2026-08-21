import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NavItem {
  id: string;
  icon: string;
  label: string;
}

interface BottomNavBarProps {
  active: string;
  onSelect: (id: string) => void;
}

const navItems: NavItem[] = [
  { id: 'home', icon: 'home-outline', label: 'Inicio' },
  { id: 'history', icon: 'time-outline', label: 'Historial' },
  { id: 'profile', icon: 'person-outline', label: 'Perfil' },
];

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ active, onSelect }) => {
  return (
    <View style={styles.container}>
      {navItems.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.navItem}
          onPress={() => onSelect(item.id)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={item.icon as any}
            size={24}
            color={active === item.id ? '#1A3C6E' : '#94A3B8'}
          />
          <Text style={[
            styles.navLabel,
            active === item.id && styles.navLabelActive,
          ]}>
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
    paddingHorizontal: 8,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  navItem: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  navLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  navLabelActive: {
    color: '#1A3C6E',
    fontWeight: '600',
  },
});
