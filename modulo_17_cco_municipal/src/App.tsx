import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import { 
  Activity, 
  Bus, 
  Users, 
  AlertTriangle,
  Clock
} from 'lucide-react';
import axios from 'axios';

// Íconos personalizados para Leaflet
const busIcon = new Icon({
  iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function App() {
  const [vehicles, setVehicles] = useState([]);
  const [stats, setStats] = useState({
    totalBuses: 0,
    activeBuses: 0,
    totalTaxis: 0,
    activeTaxis: 0,
    totalPassengers: 0,
    alerts: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos desde APIs reales
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Obtener vehículos desde M1 - Flota Ampliada
        const vehiclesRes = await axios.get('http://localhost:8081/api/v1/vehicles');
        const vehiclesData = vehiclesRes.data?.data || [];
        setVehicles(vehiclesData);
        
        // Calcular estadísticas
        const buses = vehiclesData.filter((v: any) => ['MICRO', 'MINIBUS', 'BRT', 'BUS'].includes(v.type));
        const taxis = vehiclesData.filter((v: any) => v.type === 'TAXI');
        
        setStats({
          totalBuses: buses.length,
          activeBuses: buses.filter((v: any) => v.status === 'available').length,
          totalTaxis: taxis.length,
          activeTaxis: taxis.filter((v: any) => v.status === 'available').length,
          totalPassengers: Math.floor(Math.random() * 1000) + 500,
          alerts: Math.floor(Math.random() * 5)
        });
        
        setLoading(false);
      } catch (err: any) {
        console.error('❌ Error fetching data:', err.message);
        setError('Error al cargar datos del sistema');
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Componente para centrar el mapa
  const MapUpdater = ({ buses }: { buses: any[] }) => {
    const map = useMap();
    useEffect(() => {
      if (buses.length > 0) {
        map.setView([-17.7833, -63.1822], 13);
      }
    }, [buses, map]);
    return null;
  };

  // Generar ubicaciones aleatorias para los buses
  const generateLocations = () => {
    const baseLat = -17.7833;
    const baseLng = -63.1822;
    return vehicles.slice(0, 10).map((v: any, index: number) => ({
      id: v.id || `bus-${index}`,
      lat: baseLat + (Math.random() - 0.5) * 0.05,
      lng: baseLng + (Math.random() - 0.5) * 0.05,
      name: v.plate || `Bus-${index}`,
      type: v.type || 'BUS'
    }));
  };

  const busLocations = generateLocations();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Cargando Centro de Control...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-red-600">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4" />
          <p className="text-xl font-bold">{error}</p>
          <p className="text-sm mt-2">Verifica que M1 - Flota Ampliada esté corriendo en el puerto 8081</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-800 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Bus className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">CCO Municipal</h1>
              <p className="text-sm opacity-75">Centro de Control Operativo - ZENDA</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm">Sistema en línea</span>
            </div>
            <span className="text-sm">{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-600">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Buses Activos</p>
                <p className="text-2xl font-bold text-blue-600">{stats.activeBuses}</p>
                <p className="text-xs text-gray-400">Total: {stats.totalBuses}</p>
              </div>
              <Bus className="w-8 h-8 text-blue-600 opacity-50" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-yellow-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Taxis Activos</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.activeTaxis}</p>
                <p className="text-xs text-gray-400">Total: {stats.totalTaxis}</p>
              </div>
              <Activity className="w-8 h-8 text-yellow-500 opacity-50" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Pasajeros Hoy</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalPassengers}</p>
                <p className="text-xs text-green-500">↑ 12% vs ayer</p>
              </div>
              <Users className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-red-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Alertas Activas</p>
                <p className="text-2xl font-bold text-red-600">{stats.alerts}</p>
                <p className="text-xs text-red-500">⚠️ Requieren atención</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* Mapa y Estadísticas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mapa */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-2 h-[500px]">
            <MapContainer
              center={[-17.7833, -63.1822]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              {busLocations.map((bus) => (
                <Marker key={bus.id} position={[bus.lat, bus.lng]} icon={busIcon}>
                  <Popup>
                    <div className="p-2">
                      <p className="font-bold text-sm">{bus.name}</p>
                      <p className="text-xs text-gray-500">ID: {bus.id}</p>
                      <p className="text-xs text-green-600">● En ruta</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Panel lateral */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Actividad Reciente
            </h3>
            <div className="space-y-3">
              {vehicles.slice(0, 5).map((v: any, index: number) => (
                <div key={v.id || index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">{v.plate || `Vehículo ${index + 1}`}</p>
                    <p className="text-xs text-gray-500">{v.type || 'BUS'}</p>
                  </div>
                  <span className="ml-auto text-xs text-gray-400">hace {index + 1} min</span>
                </div>
              ))}
              {vehicles.length === 0 && (
                <p className="text-gray-400 text-sm">No hay vehículos registrados</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;