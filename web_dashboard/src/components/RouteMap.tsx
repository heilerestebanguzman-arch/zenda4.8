import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../services/api';

// Configurar icono de marcador
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Stop {
  name: string;
  lat: number;
  lng: number;
}

interface Route {
  id: string;
  name: string;
  description: string;
  color: string;
  status: string;
  is_active_trip: boolean;
  stops: Stop[];
}

const RouteMap: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    try {
      const tenant = localStorage.getItem('tenantId') || 'default';
      const response = await api.get('/api/v1/routes', {
        headers: { 'x-tenant-id': tenant }
      });
      setRoutes(response.data?.data || []);
    } catch (error) {
      console.error('❌ Error cargando rutas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Centro del mapa (Santa Cruz, Bolivia)
  const center: [number, number] = [-17.83, -63.17];

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h2 className="text-xl font-semibold mb-4">🗺️ Rutas en Mapa</h2>

      {/* Selector de ruta */}
      <div className="mb-4">
        <select
          className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedRoute || ''}
          onChange={(e) => setSelectedRoute(e.target.value || null)}
        >
          <option value="">Todas las rutas</option>
          {routes.map((route) => (
            <option key={route.id} value={route.id}>
              {route.name}
            </option>
          ))}
        </select>
      </div>

      {/* Mapa */}
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '400px', width: '100%', borderRadius: '8px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {routes
          .filter((route) => !selectedRoute || route.id === selectedRoute)
          .map((route) => {
            const positions: [number, number][] = route.stops.map((stop) => [stop.lat, stop.lng]);

            return (
              <React.Fragment key={route.id}>
                {positions.length > 1 && (
                  <Polyline
                    positions={positions}
                    color={route.color || '#3498db'}
                    weight={4}
                    opacity={0.7}
                  />
                )}

                {route.stops.map((stop, index) => (
                  <Marker
                    key={`${route.id}-${index}`}
                    position={[stop.lat, stop.lng]}
                  >
                    <Popup>
                      <div>
                        <strong>{stop.name}</strong>
                        <br />
                        <span className="text-sm text-gray-500">
                          {route.name} - Parada {index + 1}
                        </span>
                        <br />
                        <span className="text-xs text-gray-400">
                          Lat: {stop.lat}, Lng: {stop.lng}
                        </span>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </React.Fragment>
            );
          })}
      </MapContainer>

      {/* Leyenda */}
      <div className="mt-3 flex flex-wrap gap-4">
        {routes
          .filter((route) => !selectedRoute || route.id === selectedRoute)
          .map((route) => (
            <div key={route.id} className="flex items-center gap-2">
              <div
                className="w-4 h-1 rounded"
                style={{ backgroundColor: route.color || '#3498db' }}
              />
              <span className="text-sm">{route.name}</span>
              <span className="text-xs text-gray-500">
                ({route.stops.length} paradas)
              </span>
            </div>
          ))}
      </div>
    </div>
  );
};

export default RouteMap;
