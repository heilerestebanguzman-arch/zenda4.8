import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

const OSRM_API = 'https://router.project-osrm.org/route/v1/driving';

interface Driver {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: 'available' | 'busy' | 'offline';
  rating: number;
  vehicle_type: string;
  trips_today: number;
  last_active: string;
}

interface TripRequest {
  id: string;
  userId: string;
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
  vehicleType: string;
  createdAt: string;
}

interface Assignment {
  tripId: string;
  driverId: string;
  score: number;
  eta: number;
  distance: number;
  reason: string;
}

class DispatcherService {
  private drivers: Map<string, Driver> = new Map();
  private assignments: Map<string, Assignment> = new Map();
  private readonly MAX_SEARCH_RADIUS = 10000; // 10km
  private readonly MIN_RATING = 3.5;

  // ============================================
  // REGISTRO DE CONDUCTORES
  // ============================================

  registerDriver(driver: Driver): void {
    this.drivers.set(driver.id, {
      ...driver,
      status: 'available',
      last_active: new Date().toISOString(),
    });
    console.log(`🚗 Conductor ${driver.name} registrado en dispatcher`);
  }

  updateDriverLocation(driverId: string, lat: number, lng: number): void {
    const driver = this.drivers.get(driverId);
    if (driver) {
      driver.lat = lat;
      driver.lng = lng;
      driver.last_active = new Date().toISOString();
      this.drivers.set(driverId, driver);
    }
  }

  updateDriverStatus(driverId: string, status: 'available' | 'busy' | 'offline'): void {
    const driver = this.drivers.get(driverId);
    if (driver) {
      driver.status = status;
      this.drivers.set(driverId, driver);
    }
  }

  // ============================================
  // CÁLCULO DE RUTA OSRM
  // ============================================

  private async calculateRoute(
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number
  ): Promise<{ distance: number; duration: number } | null> {
    try {
      const url = `${OSRM_API}/${originLng},${originLat};${destLng},${destLat}?overview=false`;
      const response = await axios.get(url, { timeout: 3000 });

      if (response.data?.routes?.length > 0) {
        const route = response.data.routes[0];
        return {
          distance: route.distance / 1000, // km
          duration: route.duration / 60, // minutos
        };
      }
      return null;
    } catch (error) {
      console.error('Error calculando ruta OSRM:', error);
      // Fallback: distancia euclidiana
      const R = 6371;
      const dLat = (destLat - originLat) * Math.PI / 180;
      const dLng = (destLng - originLng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(originLat * Math.PI / 180) * Math.cos(destLat * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      const duration = distance / 30 * 60; // 30km/h promedio
      return { distance, duration };
    }
  }

  // ============================================
  // ALGORITMO DE ASIGNACIÓN
  // ============================================

  async findBestDriver(tripRequest: TripRequest): Promise<Assignment | null> {
    const availableDrivers: Driver[] = [];

    // 1. Filtrar conductores disponibles y con el tipo de vehículo correcto
    for (const [id, driver] of this.drivers) {
      if (
        driver.status === 'available' &&
        driver.vehicle_type === tripRequest.vehicleType &&
        driver.rating >= this.MIN_RATING
      ) {
        availableDrivers.push(driver);
      }
    }

    if (availableDrivers.length === 0) {
      console.log('⚠️ No hay conductores disponibles');
      return null;
    }

    console.log(`🔍 Evaluando ${availableDrivers.length} conductores para el viaje`);

    // 2. Calcular score para cada conductor
    const scoredDrivers = await Promise.all(
      availableDrivers.map(async (driver) => {
        // Calcular distancia y ETA al origen
        const route = await this.calculateRoute(
          driver.lat,
          driver.lng,
          tripRequest.originLat,
          tripRequest.originLng
        );

        if (!route) return null;

        // Cálculo del score ponderado
        const distanceScore = Math.max(0, 1 - (route.distance / this.MAX_SEARCH_RADIUS));
        const ratingScore = driver.rating / 5;
        const availabilityScore = 1 - (driver.trips_today / 20); // Máximo 20 viajes al día
        const etaScore = Math.max(0, 1 - (route.duration / 15)); // ETA ideal < 15 min

        // Pesos
        const weights = {
          distance: 0.35,
          rating: 0.25,
          availability: 0.20,
          eta: 0.20,
        };

        const score = (
          distanceScore * weights.distance +
          ratingScore * weights.rating +
          availabilityScore * weights.availability +
          etaScore * weights.eta
        );

        return {
          driver,
          score: Math.round(score * 100),
          eta: Math.round(route.duration),
          distance: Math.round(route.distance * 100) / 100,
        };
      })
    );

    // 3. Filtrar resultados nulos y ordenar por score
    const validResults = scoredDrivers
      .filter((d) => d !== null)
      .sort((a, b) => b!.score - a!.score);

    if (validResults.length === 0) {
      console.log('⚠️ No hay conductores con ruta válida');
      return null;
    }

    const best = validResults[0]!;

    // 4. Crear asignación
    const assignment: Assignment = {
      tripId: tripRequest.id,
      driverId: best.driver.id,
      score: best.score,
      eta: best.eta,
      distance: best.distance,
      reason: `Mejor conductor: distancia ${best.distance}km, ETA ${best.eta}min, rating ${best.driver.rating}`,
    };

    // 5. Marcar conductor como ocupado
    this.updateDriverStatus(best.driver.id, 'busy');
    this.assignments.set(tripRequest.id, assignment);

    console.log(`✅ Viaje asignado a conductor ${best.driver.name} (score: ${best.score})`);
    return assignment;
  }

  // ============================================
  // NOTIFICACIÓN AL CONDUCTOR
  // ============================================

  async notifyDriver(assignment: Assignment, tripRequest: TripRequest): Promise<boolean> {
    // En producción, aquí se enviaría una notificación push al conductor
    console.log(`📱 Notificando conductor ${assignment.driverId}`);
    console.log(`   Viaje: ${tripRequest.id}`);
    console.log(`   ETA: ${assignment.eta} min`);
    console.log(`   Distancia: ${assignment.distance} km`);

    // Simular que el conductor acepta (en producción, esperar respuesta)
    // Aquí se integraría con WebSockets o Firebase Cloud Messaging
    return true;
  }

  // ============================================
  // LIBERACIÓN DE CONDUCTORES
  // ============================================

  releaseDriver(driverId: string): void {
    this.updateDriverStatus(driverId, 'available');
    console.log(`🔄 Conductor ${driverId} liberado`);
  }

  completeTrip(tripId: string): void {
    const assignment = this.assignments.get(tripId);
    if (assignment) {
      this.releaseDriver(assignment.driverId);
      this.assignments.delete(tripId);
    }
  }

  // ============================================
  // ESTADÍSTICAS DEL DISPATCHER
  // ============================================

  getStats(): any {
    const total = this.drivers.size;
    const available = Array.from(this.drivers.values()).filter((d) => d.status === 'available').length;
    const busy = Array.from(this.drivers.values()).filter((d) => d.status === 'busy').length;
    const offline = Array.from(this.drivers.values()).filter((d) => d.status === 'offline').length;

    return {
      total,
      available,
      busy,
      offline,
      assignments: this.assignments.size,
    };
  }
}

export default new DispatcherService();
