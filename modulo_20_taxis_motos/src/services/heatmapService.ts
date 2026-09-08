interface HeatmapZone {
  id: string;
  lat: number;
  lng: number;
  intensity: number; // 0-100
  radius: number; // metros
  demandLevel: 'low' | 'medium' | 'high' | 'very_high';
  lastUpdated: string;
}

class HeatmapService {
  private zones: HeatmapZone[] = [];

  constructor() {
    // Inicializar con zonas de ejemplo (Santa Cruz)
    this.zones = [
      {
        id: 'zone-1',
        lat: -17.5206,
        lng: -63.1732,
        intensity: 85,
        radius: 300,
        demandLevel: 'very_high',
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'zone-2',
        lat: -17.5080,
        lng: -63.1650,
        intensity: 70,
        radius: 250,
        demandLevel: 'high',
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'zone-3',
        lat: -17.5150,
        lng: -63.1800,
        intensity: 50,
        radius: 200,
        demandLevel: 'medium',
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'zone-4',
        lat: -17.5100,
        lng: -63.1550,
        intensity: 30,
        radius: 150,
        demandLevel: 'low',
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'zone-5',
        lat: -17.5250,
        lng: -63.1700,
        intensity: 90,
        radius: 350,
        demandLevel: 'very_high',
        lastUpdated: new Date().toISOString(),
      },
    ];
  }

  // Obtener todas las zonas de calor
  async getHeatmapZones(lat?: number, lng?: number, radius?: number): Promise<HeatmapZone[]> {
    // Simular actualización de datos (en producción vendría de la BD)
    this.updateZones();
    return this.zones;
  }

  // Obtener zonas cercanas a una ubicación
  async getNearbyZones(lat: number, lng: number, radius: number = 5000): Promise<HeatmapZone[]> {
    const nearby = this.zones.filter((zone) => {
      const distance = this.calculateDistance(lat, lng, zone.lat, zone.lng);
      return distance <= radius;
    });
    return nearby;
  }

  // Actualizar zonas con datos de demanda (simulado)
  private updateZones(): void {
    // Simular cambios en la demanda basados en hora del día
    const hour = new Date().getHours();
    const day = new Date().getDay();

    this.zones = this.zones.map((zone) => {
      let intensity = zone.intensity;

      // Horas pico (7-9am, 5-8pm)
      if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 20)) {
        intensity = Math.min(100, intensity * 1.3);
      }
      // Madrugada (12-5am)
      else if (hour >= 0 && hour < 5) {
        intensity = Math.max(10, intensity * 0.5);
      }
      // Fin de semana (sábado y domingo)
      else if (day === 0 || day === 6) {
        intensity = Math.min(100, intensity * 1.2);
      }

      // Determinar nivel de demanda
      let demandLevel: 'low' | 'medium' | 'high' | 'very_high';
      if (intensity >= 80) demandLevel = 'very_high';
      else if (intensity >= 60) demandLevel = 'high';
      else if (intensity >= 40) demandLevel = 'medium';
      else demandLevel = 'low';

      return {
        ...zone,
        intensity: Math.round(intensity),
        demandLevel,
        lastUpdated: new Date().toISOString(),
      };
    });
  }

  // Calcular distancia entre dos puntos (en metros)
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c * 1000; // metros
  }
}

export default new HeatmapService();
