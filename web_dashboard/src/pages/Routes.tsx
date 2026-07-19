import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

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

const Routes: React.FC = () => {
  const { t } = useTranslation();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    try {
      console.log('🔍 Iniciando carga de rutas...');
      const tenant = localStorage.getItem('tenantId') || 'default';
      console.log('📡 Tenant:', tenant);
      
      const response = await api.get('/api/v1/routes', {
        headers: {
          'x-tenant-id': tenant
        }
      });
      
      console.log('📦 Respuesta completa:', response);
      console.log('📊 response.data:', response.data);
      console.log('📊 response.data.data:', response.data?.data);
      
      const routesData = response.data?.data || response.data || [];
      console.log('🚌 Rutas procesadas:', routesData);
      
      setRoutes(routesData);
      setError(null);
    } catch (error: any) {
      console.error('❌ Error cargando rutas:', error);
      setError(error.message || 'Error al cargar rutas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>❌ Error: {error}</p>
          <button 
            onClick={loadRoutes}
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">🚌 {t('routes.title') || 'Gestión de Rutas'}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {routes.length > 0 ? (
          routes.map((route) => (
            <div key={route.id} className="bg-white rounded-lg shadow p-4 border-l-4" style={{ borderColor: route.color }}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{route.name}</h3>
                  <p className="text-sm text-gray-500">{route.description}</p>
                  <div className="flex items-center mt-2 gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${route.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {route.status}
                    </span>
                    {route.is_active_trip && (
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        🟢 En servicio
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-500">🔄 {route.stops.length} paradas</span>
              </div>
              
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700">Paradas:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {route.stops.map((stop, index) => (
                    <span key={index} className="inline-block bg-gray-100 px-2 py-1 rounded text-xs">
                      {stop.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center py-8 text-gray-500">
            No hay rutas disponibles
          </div>
        )}
      </div>
    </div>
  );
};

export default Routes;
