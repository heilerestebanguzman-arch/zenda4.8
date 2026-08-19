import { WARNES_ZONES } from '../utils/zones';

const haversineDistance = (point1: any, point2: any): number => {
  const R = 6371;
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLng = (point2.lng - point1.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const calculateFare = (
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number,
  vehicleType: string = 'MOTO'
): number => {
  const distance = haversineDistance(
    { lat: originLat, lng: originLng },
    { lat: destLat, lng: destLng }
  );

  const center = WARNES_ZONES.CASCO_VIEJO.center;
  const distToCenter = haversineDistance(
    { lat: originLat, lng: originLng },
    { lat: center.lat, lng: center.lng }
  );

  let fare = 0;
  if (distToCenter <= WARNES_ZONES.CASCO_VIEJO.radius) {
    fare = WARNES_ZONES.CASCO_VIEJO.fare;
  } else {
    fare = WARNES_ZONES.PERIFERIA.fare.base + (distance * WARNES_ZONES.PERIFERIA.fare.perKm);
  }

  return Math.max(fare, 3.00);
};
