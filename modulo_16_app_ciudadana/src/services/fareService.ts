// src/services/fareService.ts
import axios from 'axios';

const OSRM_API = 'https://router.project-osrm.org/route/v1/driving';

// Tarifas base por tipo de vehículo (Bs)
const BASE_RATES = {
  MOTO: 2.50,
  TAXI: 4.00,
  MINIBUS: 3.00,
  CARGO: 5.00,
};

// Tarifa por kilómetro adicional (Bs)
const PER_KM_RATES = {
  MOTO: 0.80,
  TAXI: 1.20,
  MINIBUS: 0.90,
  CARGO: 1.50,
};

// Tarifa mínima por tipo de vehículo (Bs)
const MIN_FARES = {
  MOTO: 3.00,
  TAXI: 5.00,
  MINIBUS: 3.50,
  CARGO: 6.00,
};

// ✅ FACTORES DE DEMANDA POR HORARIO (Surge Pricing)
const DEMAND_FACTORS = {
  // Horas pico (mañana y tarde)
  PEAK: 1.3,
  // Horas normales
  NORMAL: 1.0,
  // Horas de alta demanda (noche)
  HIGH: 1.2,
  // Horas de baja demanda (madrugada)
  LOW: 0.9,
};

export interface FareEstimate {
  baseFare: number;
  distanceKm: number;
  durationMin: number;
  totalFare: number;
  perKmRate: number;
  minFare: number;
  vehicleType: string;
  demandFactor: number;
  surgeApplied: boolean;
}

export const fareService = {
  // ✅ CALCULAR FACTOR DE DEMANDA POR HORA
  getDemandFactor(): { factor: number; label: string; surgeApplied: boolean } {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay(); // 0 = Domingo, 6 = Sábado

    // Fines de semana: factor más alto
    if (day === 0 || day === 6) {
      if (hour >= 20 || hour < 6) {
        return { factor: DEMAND_FACTORS.HIGH, label: 'Fin de semana noche', surgeApplied: true };
      }
      return { factor: DEMAND_FACTORS.PEAK, label: 'Fin de semana', surgeApplied: true };
    }

    // Horas pico: 7-9am y 5-8pm
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 20)) {
      return { factor: DEMAND_FACTORS.PEAK, label: 'Hora pico', surgeApplied: true };
    }
    
    // Madrugada: 12am - 5am
    if (hour >= 0 && hour < 5) {
      return { factor: DEMAND_FACTORS.LOW, label: 'Madrugada', surgeApplied: false };
    }
    
    // Noche: 8pm - 11pm
    if (hour >= 20 && hour <= 23) {
      return { factor: DEMAND_FACTORS.HIGH, label: 'Noche', surgeApplied: true };
    }

    // Horario normal
    return { factor: DEMAND_FACTORS.NORMAL, label: 'Horario normal', surgeApplied: false };
  },

  async calculateFare(
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number,
    vehicleType: string = 'MOTO'
  ): Promise<FareEstimate | null> {
    try {
      const url = `${OSRM_API}/${originLng},${originLat};${destLng},${destLat}?overview=false`;
      const response = await axios.get(url, { timeout: 5000 });
      
      if (response.data?.routes?.length > 0) {
        const route = response.data.routes[0];
        const distanceKm = route.distance / 1000;
        const durationMin = route.duration / 60;

        // Calcular tarifa base
        const baseRate = BASE_RATES[vehicleType as keyof typeof BASE_RATES] || 2.50;
        const perKmRate = PER_KM_RATES[vehicleType as keyof typeof PER_KM_RATES] || 0.80;
        const minFare = MIN_FARES[vehicleType as keyof typeof MIN_FARES] || 3.00;

        // ✅ Obtener factor de demanda
        const demand = this.getDemandFactor();

        let totalFare = baseRate + (distanceKm * perKmRate);
        totalFare = Math.max(totalFare, minFare);
        
        // ✅ APLICAR SURGE PRICING (si aplica)
        if (demand.surgeApplied) {
          totalFare = totalFare * demand.factor;
        }
        
        totalFare = Math.round(totalFare * 100) / 100;

        return {
          baseFare: baseRate,
          distanceKm: Math.round(distanceKm * 100) / 100,
          durationMin: Math.round(durationMin),
          totalFare,
          perKmRate,
          minFare,
          vehicleType,
          demandFactor: demand.factor,
          surgeApplied: demand.surgeApplied,
        };
      }
      
      return this.calculateFallbackFare(originLat, originLng, destLat, destLng, vehicleType);
      
    } catch (error) {
      console.error('Error calculando tarifa con OSRM:', error);
      return this.calculateFallbackFare(originLat, originLng, destLat, destLng, vehicleType);
    }
  },

  calculateFallbackFare(
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number,
    vehicleType: string = 'MOTO'
  ): FareEstimate {
    const R = 6371;
    const dLat = (destLat - originLat) * Math.PI / 180;
    const dLng = (destLng - originLng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(originLat * Math.PI / 180) * Math.cos(destLat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distanceKm = R * c;
    const durationMin = (distanceKm / 30) * 60;

    const baseRate = BASE_RATES[vehicleType as keyof typeof BASE_RATES] || 2.50;
    const perKmRate = PER_KM_RATES[vehicleType as keyof typeof PER_KM_RATES] || 0.80;
    const minFare = MIN_FARES[vehicleType as keyof typeof MIN_FARES] || 3.00;

    // ✅ Aplicar factor de demanda en fallback
    const demand = this.getDemandFactor();

    let totalFare = baseRate + (distanceKm * perKmRate);
    totalFare = Math.max(totalFare, minFare);
    
    if (demand.surgeApplied) {
      totalFare = totalFare * demand.factor;
    }
    
    totalFare = Math.round(totalFare * 100) / 100;

    return {
      baseFare: baseRate,
      distanceKm: Math.round(distanceKm * 100) / 100,
      durationMin: Math.round(durationMin),
      totalFare,
      perKmRate,
      minFare,
      vehicleType,
      demandFactor: demand.factor,
      surgeApplied: demand.surgeApplied,
    };
  },

  formatFare(fare: number): string {
    return `Bs ${fare.toFixed(2)}`;
  },

  getBaseRate(vehicleType: string): number {
    return BASE_RATES[vehicleType as keyof typeof BASE_RATES] || 2.50;
  },

  getMinFare(vehicleType: string): number {
    return MIN_FARES[vehicleType as keyof typeof MIN_FARES] || 3.00;
  },

  // ✅ OBTENER DESCRIPCIÓN DEL FACTOR DE DEMANDA
  getDemandDescription(): string {
    const demand = this.getDemandFactor();
    if (demand.surgeApplied) {
      return `🕐 ${demand.label} • ${(demand.factor * 100)}% de la tarifa base`;
    }
    return `🕐 ${demand.label} • Tarifa estándar`;
  },
};

export default fareService;
