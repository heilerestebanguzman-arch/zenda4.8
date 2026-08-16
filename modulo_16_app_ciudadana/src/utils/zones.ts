export const WARNES_ZONES = {
  CASCO_VIEJO: {
    name: 'Casco Viejo',
    center: { lat: -17.5005, lng: -63.1660 },
    radius: 2.5,
    fare: 3.00
  },
  PERIFERIA: {
    name: 'Periferia',
    fare: { base: 2.50, perKm: 0.50 }
  },
  MOTORATON: { perMinute: 0.30 }
};

export const WARNES_BOUNDS = {
  north: -17.4800, south: -17.5200,
  east: -63.1400, west: -63.1900
};
