import { WARNES_ZONES } from '../utils/zones';

export const calculateFare = (
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number,
  vehicleType: string = 'MOTO'
): number => {
  // Distancia en km
  const distance = haversineDistance(
    { lat: originLat, lng: originLng },
    { lat: destLat, lng: destLng }
  );
  
  // Zona de Warnes
  const center = WARNES_ZONES.CASCO_VIEJO.center;
  const distToCenter = haversineDistance(
    { lat: originLat, lng: originLng },
    { lat: center.lat, lng: center.lng }
  );
  
  // Tarifa según zona
  let fare = 0;
  if (distToCenter <= WARNES_ZONES.CASCO_VIEJO.radius) {
    fare = WARNES_ZONES.CASCO_VIEJO.fare; // Bs 3.00 (Casco Viejo)
  } else {
    fare = WARNES_ZONES.PERIFERIA.fare.base + (distance * WARNES_ZONES.PERIFERIA.fare.perKm);
  }
  
  // Tarifa mínima
  return Math.max(fare, 3.00);
};
