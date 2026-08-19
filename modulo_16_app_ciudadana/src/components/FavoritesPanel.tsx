import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { favoritesService, FavoriteLocation } from '../services/favoritesService';

interface FavoritesPanelProps {
  onSelectFavorite: (favorite: FavoriteLocation) => void;
}

export const FavoritesPanel: React.FC<FavoritesPanelProps> = ({ onSelectFavorite }) => {
  const [favorites, setFavorites] = useState<FavoriteLocation[]>([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    const data = await favoritesService.getFavorites();
    setFavorites(data);
  };

  if (favorites.length === 0) {
    return null;
  }

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {favorites.map((fav) => (
        <TouchableOpacity
          key={fav.id}
          style={styles.favoriteCard}
          onPress={() => onSelectFavorite(fav)}
          activeOpacity={0.7}
        >
          <Text style={styles.icon}>{fav.icon}</Text>
          <Text style={styles.name}>{fav.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: 80,
    marginBottom: 12,
  },
  contentContainer: {
    paddingHorizontal: 4,
  },
  favoriteCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    minWidth: 70,
  },
  icon: {
    fontSize: 24,
    marginBottom: 2,
  },
  name: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
});
