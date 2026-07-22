import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
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

// Componente para hacer zoom a una ruta
function ZoomToRoute({ route }: { route: Route | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (route && route.stops.length > 0) {
      const bounds = L.latLngBounds(route.stops.map(stop => [stop.lat, stop.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [route, map]);
  
  return null;
}

interface Stop {
  name: string;
  lat: number;
  lng: number;
  description?: string;
  time?: string;
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
  const [selectedRouteData, setSelectedRouteData] = useState<Route | null>(null);

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

  const handleRouteSelect = (routeId: string) => {
    setSelectedRoute(routeId || null);
    const route = routes.find(r => r.id === routeId);
    setSelectedRouteData(route || null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const center: [number, number] = [-17.83, -63.17];

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">🗺️ Rutas en Mapa</h2>
        <div className="text-sm text-gray-500">
          {routes.length} rutas disponibles
        </div>
      </div>

      {/* Selector de ruta */}
      <div className="mb-4 flex gap-2">
        <select
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedRoute || ''}
          onChange={(e) => handleRouteSelect(e.target.value)}
        >
          <option value="">📌 Todas las rutas</option>
          {routes.map((route) => (
            <option key={route.id} value={route.id}>
              {route.is_active_trip ? '🟢' : '⏸️'} {route.name}
            </option>
          ))}
        </select>
        
        {selectedRouteData && (
          <button
            onClick={() => {
              setSelectedRoute(null);
              setSelectedRouteData(null);
            }}
            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            ✕ Limpiar
          </button>
        )}
      </div>

      {/* Información de la ruta seleccionada */}
      {selectedRouteData && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold" style={{ color: selectedRouteData.color }}>
                {selectedRouteData.name}
              </h3>
              <p className="text-sm text-gray-600">{selectedRouteData.description}</p>
              <p className="text-xs text-gray-500">
                {selectedRouteData.stops.length} paradas • 
                Estado: {selectedRouteData.status} • 
                {selectedRouteData.is_active_trip ? ' 🟢 En servicio' : ' ⏸️ Inactiva'}
              </p>
            </div>
            <div
              className="w-8 h-8 rounded-full border-2"
              style={{ backgroundColor: selectedRouteData.color }}
            />
          </div>
        </div>
      )}

      {/* Mapa */}
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '450px', width: '100%', borderRadius: '8px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ZoomToRoute route={selectedRouteData} />

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
                      <div className="min-w-[200px]">
                        <h4 className="font-semibold text-base">{stop.name}</h4>
                        <hr className="my-2 border-gray-200" />
                        <p className="text-sm text-gray-600">
                          🚏 {route.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Parada #{index + 1} de {route.stops.length}
                        </p>
                        {stop.description && (
                          <p className="text-xs text-gray-500 mt-1">{stop.description}</p>
                        )}
                        {stop.time && (
                          <p className="text-xs text-blue-600 mt-1">⏰ {stop.time}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          📍 {stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}
                        </p>
                        <div className="mt-2 flex gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${route.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {route.status}
                          </span>
                          {route.is_active_trip && (
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                              🟢 En servicio
                            </span>
                          )}
                        </div>
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
              {route.is_active_trip && (
                <span className="text-xs text-green-500">🟢</span>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default RouteMap;
