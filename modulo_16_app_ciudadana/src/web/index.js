import React from 'react';
import { View, Text } from 'react-native';

export const MapView = (props) => (
  <View style={{ flex: 1, backgroundColor: '#1A3C6E', justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ color: '#FFFFFF', fontSize: 18 }}>🗺️ Mapa no disponible en web</Text>
    <Text style={{ color: '#94A3B8', fontSize: 14, marginTop: 8 }}>Usa la app móvil para ver el mapa</Text>
  </View>
);
export const Marker = () => null;
export const Polyline = () => null;
export const PROVIDER_GOOGLE = 'google';
export default MapView;
