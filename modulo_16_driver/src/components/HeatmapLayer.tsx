import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Circle } from 'react-native-maps';
import axios from 'axios';
import { authService } from '../services/authService';

const API_MOBILITY = 'http://192.168.1.88:8103/api/v1/mobility';

interface HeatmapZone {
  id: string;
  lat: number;
  lng: number;
  intensity: number;
  radius: number;
  demandLevel: 'low' | 'medium' | 'high' | 'very_high';
}

interface HeatmapLayerProps {
  mapRef: React.RefObject<MapView>;
  visible?: boolean;
  lat?: number;
  lng?: number;
}

export const HeatmapLayer: React.FC<HeatmapLayerProps> = ({
  mapRef,
  visible = true,
  lat,
  lng,
}) => {
  const [zones, setZones] = useState<HeatmapZone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      loadHeatmapData();
      const interval = setInterval(loadHeatmapData, 30000); // Actualizar cada 30s
      return () => clearInterval(interval);
    }
  }, [visible, lat, lng]);

  const loadHeatmapData = async () => {
    try {
      setLoading(true);
      const token = await authService.getToken();

      let url = `${API_MOBILITY}/heatmap`;
      if (lat && lng) {
        url += `?lat=${lat}&lng=${lng}&radius=3000`;
      }

      const response = await axios.get(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        timeout: 5000,
      });

      if (response.data.success) {
        setZones(response.data.data);
      }
    } catch (error) {
      console.error('Error loading heatmap:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDemandColor = (level: string, intensity: number) => {
    // Colores de calor: azul (bajo) → amarillo (medio) → rojo (alto)
    const intensityFactor = intensity / 100;
    const red = Math.round(255 * intensityFactor);
    const green = Math.round(255 * (1 - intensityFactor));
    return `rgba(${red}, ${green}, 50, ${0.3 + intensityFactor * 0.5})`;
  };

  const getDemandLabel = (level: string) => {
    switch (level) {
      case 'very_high':
        return '🔥 Muy alta';
      case 'high':
        return '🔴 Alta';
      case 'medium':
        return '🟡 Media';
      case 'low':
        return '🟢 Baja';
      default:
        return '⚪ Desconocida';
    }
  };

  if (!visible) return null;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#1A3C6E" />
        <Text style={styles.loadingText}>Cargando zonas de demanda...</Text>
      </View>
    );
  }

  return (
    <>
      {zones.map((zone) => (
        <Circle
          key={zone.id}
          center={{
            latitude: zone.lat,
            longitude: zone.lng,
          }}
          radius={zone.radius}
          fillColor={getDemandColor(zone.demandLevel, zone.intensity)}
          strokeColor={getDemandColor(zone.demandLevel, zone.intensity)}
          strokeWidth={1}
          zIndex={5}
        />
      ))}
      {/* Leyenda */}
      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>📊 Demanda</Text>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: 'rgba(255, 0, 0, 0.7)' }]} />
          <Text style={styles.legendText}>Muy alta</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: 'rgba(255, 200, 0, 0.7)' }]} />
          <Text style={styles.legendText}>Alta</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: 'rgba(255, 255, 0, 0.7)' }]} />
          <Text style={styles.legendText}>Media</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: 'rgba(0, 255, 0, 0.7)' }]} />
          <Text style={styles.legendText}>Baja</Text>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 10,
  },
  loadingText: {
    fontSize: 12,
    color: '#64748B',
  },
  legendContainer: {
    position: 'absolute',
    bottom: 120,
    left: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 2,
  },
  legendColor: {
    width: 14,
    height: 14,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: '#64748B',
  },
});

export default HeatmapLayer;
