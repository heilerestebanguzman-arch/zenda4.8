import React, { useEffect, useState } from 'react';
import { 
  DollarSign, 
  Users, 
  Truck, 
  Map,
  TrendingUp,
  TrendingDown,
  UserPlus,
  Route,
  ClipboardList
} from 'lucide-react';
import api from '../services/api';

interface KPI {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Route {
  id: string;
  name: string;
  description: string;
  status: string;
  stops: number;
}

interface Driver {
  id: string;
  name: string;
  status: string;
  rating: number;
  total_trips: number;
}

const Dashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Cargando datos del dashboard...');
        
        // Hacer todas las peticiones en paralelo
        const [usersRes, routesRes, driversRes] = await Promise.all([
          api.get('/users'),
          api.get('/routes'),
          api.get('/drivers')
        ]);
        
        console.log('✅ Datos de usuarios:', usersRes.data);
        console.log('✅ Datos de rutas:', routesRes.data);
        console.log('✅ Datos de conductores:', driversRes.data);
        
        setUsers(usersRes.data.data || []);
        setRoutes(routesRes.data.data || []);
        setDrivers(driversRes.data.data || []);
        
      } catch (err: any) {
        console.error('❌ Error cargando datos:', err);
        setError(err.message || 'Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Calcular KPIs
  const totalUsers = users.length;
  const totalRoutes = routes.length;
  const totalDrivers = drivers.length;
  const activeDrivers = drivers.filter(d => d.status === 'available' || d.status === 'on_trip').length;
  
  // Datos simulados para los KPIs (más adelante se conectan con datos reales)
  const kpis: KPI[] = [
    {
      title: 'Usuarios Registrados',
      value: totalUsers,
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'bg-zenda-primary'
    },
    {
      title: 'Rutas Activas',
      value: totalRoutes,
      change: '+3.2%',
      trend: 'up',
      icon: Map,
      color: 'bg-zenda-accent'
    },
    {
      title: 'Conductores Activos',
      value: activeDrivers,
      change: `${totalDrivers > 0 ? '+' : ''}${totalDrivers > 0 ? '8.1%' : '0%'}`,
      trend: totalDrivers > 0 ? 'up' : 'down',
      icon: UserPlus,
      color: 'bg-zenda-secondary'
    },
    {
      title: 'Total Conductores',
      value: totalDrivers,
      change: '-1.5%',
      trend: 'down',
      icon: Truck,
      color: 'bg-zenda-primary-dark'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zenda-primary mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
          <p className="font-bold">❌ Error al cargar los datos</p>
          <p className="text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      {/* Header con branding */}
      <div className="mb-8">
        <h1 className="text-3xl font-zenda-display font-bold text-zenda-gradient">
          Panel de Control
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Visión general del sistema ZENDA Transport
        </p>
        <div className="mt-2 text-sm text-gray-400 dark:text-gray-500">
          <span className="bg-zenda-primary/10 px-3 py-1 rounded-full">
            📊 {users.length} usuarios · {routes.length} rutas · {drivers.length} conductores
          </span>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi, index) => (
          <div
            key={index}
            className="bg-white dark:bg-zenda-dark rounded-xl p-6 shadow-sm 
                       border border-gray-100 dark:border-gray-700 
                       hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className={`${kpi.color} p-3 rounded-xl`}>
                <kpi.icon className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <span className={`
                text-sm font-medium px-2.5 py-1 rounded-lg
                ${kpi.trend === 'up' 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }
              `}>
                {kpi.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-zenda-primary dark:text-white mt-3">
              {kpi.value}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {kpi.title}
            </p>
          </div>
        ))}
      </div>

      {/* Tabla de datos recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Últimos usuarios */}
        <div className="bg-white dark:bg-zenda-dark rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-zenda-display font-semibold text-zenda-primary dark:text-white mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-zenda-primary" />
            Últimos Usuarios
          </h3>
          <div className="space-y-2">
            {users.slice(0, 3).map((user) => (
              <div key={user.id} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-zenda-primary/10 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">{user.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  user.role === 'admin' ? 'bg-red-100 text-red-700' :
                  user.role === 'manager' ? 'bg-blue-100 text-blue-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {user.role}
                </span>
              </div>
            ))}
            {users.length === 0 && (
              <p className="text-gray-400 dark:text-gray-500 text-center py-4">No hay usuarios registrados</p>
            )}
          </div>
        </div>

        {/* Últimas rutas */}
        <div className="bg-white dark:bg-zenda-dark rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-zenda-display font-semibold text-zenda-primary dark:text-white mb-4 flex items-center">
            <Route className="w-5 h-5 mr-2 text-zenda-primary" />
            Rutas Activas
          </h3>
          <div className="space-y-2">
            {routes.slice(0, 3).map((route) => (
              <div key={route.id} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-zenda-primary/10 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">{route.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{route.description}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  route.status === 'active' ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {route.status === 'active' ? '✅ Activa' : '❌ Inactiva'}
                </span>
              </div>
            ))}
            {routes.length === 0 && (
              <p className="text-gray-400 dark:text-gray-500 text-center py-4">No hay rutas registradas</p>
            )}
          </div>
        </div>
      </div>

      {/* Conductores */}
      <div className="mt-6 bg-white dark:bg-zenda-dark rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-zenda-display font-semibold text-zenda-primary dark:text-white mb-4 flex items-center">
          <UserPlus className="w-5 h-5 mr-2 text-zenda-primary" />
          Conductores
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {drivers.slice(0, 4).map((driver) => (
            <div key={driver.id} className="p-3 border border-gray-100 dark:border-gray-700 rounded-lg">
              <p className="font-medium text-gray-800 dark:text-white">{driver.name}</p>
              <div className="flex items-center justify-between mt-1">
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  driver.status === 'available' ? 'bg-green-100 text-green-700' :
                  driver.status === 'on_trip' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {driver.status === 'available' ? '🟢 Disponible' :
                   driver.status === 'on_trip' ? '🟡 En viaje' :
                   '⚪ Offline'}
                </span>
                <span className="text-sm text-gray-500">
                  ⭐ {driver.rating || 0}
                </span>
              </div>
            </div>
          ))}
          {drivers.length === 0 && (
            <p className="text-gray-400 dark:text-gray-500 text-center py-4 col-span-4">No hay conductores registrados</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;