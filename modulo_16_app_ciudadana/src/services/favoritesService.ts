import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FavoriteLocation {
  id: string;
  name: string;
  icon: string;
  lat: number;
  lng: number;
  address: string;
}

const DEFAULT_FAVORITES: FavoriteLocation[] = [
  {
    id: 'casa',
    name: 'Casa',
    icon: '🏠',
    lat: -17.5005,
    lng: -63.1660,
    address: 'Barrio Central, Warnes',
  },
  {
    id: 'trabajo',
    name: 'Trabajo',
    icon: '💼',
    lat: -17.4900,
    lng: -63.1700,
    address: 'Zona Industrial, Warnes',
  },
  {
    id: 'mercado',
    name: 'Mercado',
    icon: '🛒',
    lat: -17.5100,
    lng: -63.1600,
    address: 'Mercado Central, Warnes',
  },
];

export const favoritesService = {
  getFavorites: async (): Promise<FavoriteLocation[]> => {
    try {
      const stored = await AsyncStorage.getItem('@zenda_favorites');
      if (stored) {
        return JSON.parse(stored);
      }
      await AsyncStorage.setItem('@zenda_favorites', JSON.stringify(DEFAULT_FAVORITES));
      return DEFAULT_FAVORITES;
    } catch (error) {
      console.error('Error al obtener favoritos:', error);
      return DEFAULT_FAVORITES;
    }
  },

  saveFavorite: async (newFavorite: FavoriteLocation): Promise<FavoriteLocation[]> => {
    try {
      const current = await favoritesService.getFavorites();
      const updated = [...current, newFavorite];
      await AsyncStorage.setItem('@zenda_favorites', JSON.stringify(updated));
      return updated;
    } catch (error) {
      console.error('Error al guardar favorito:', error);
      return [];
    }
  },

  deleteFavorite: async (id: string): Promise<FavoriteLocation[]> => {
    try {
      const current = await favoritesService.getFavorites();
      const updated = current.filter(fav => fav.id !== id);
      await AsyncStorage.setItem('@zenda_favorites', JSON.stringify(updated));
      return updated;
    } catch (error) {
      console.error('Error al eliminar favorito:', error);
      return [];
    }
  },

  resetFavorites: async (): Promise<FavoriteLocation[]> => {
    try {
      await AsyncStorage.setItem('@zenda_favorites', JSON.stringify(DEFAULT_FAVORITES));
      return DEFAULT_FAVORITES;
    } catch (error) {
      console.error('Error al restaurar favoritos:', error);
      return DEFAULT_FAVORITES;
    }
  }
};
