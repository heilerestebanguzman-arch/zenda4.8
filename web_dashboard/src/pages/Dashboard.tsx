import React from 'react';
import { 
  DollarSign, 
  Users, 
  Truck, 
  Map,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface KPI {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const Dashboard: React.FC = () => {
  const kpis: KPI[] = [
    {
      title: 'Ingresos Totales',
      value: '$ 124,850',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-zenda-primary'
    },
    {
      title: 'Rutas Activas',
      value: '45',
      change: '+3.2%',
      trend: 'up',
      icon: Map,
      color: 'bg-zenda-accent'
    },
    {
      title: 'Conductores',
      value: '128',
      change: '+8.1%',
      trend: 'up',
      icon: Users,
      color: 'bg-zenda-secondary'
    },
    {
      title: 'Vehículos',
      value: '89',
      change: '-1.5%',
      trend: 'down',
      icon: Truck,
      color: 'bg-zenda-primary-dark'
    }
  ];

  return (
    <div className="w-full p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-zenda-display font-bold text-zenda-gradient">
          Panel de Control
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Visión general del sistema ZENDA Transport
        </p>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zenda-dark rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-zenda-display font-semibold text-zenda-primary dark:text-white mb-4">
            Ingresos Mensuales
          </h3>
          <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500">
            📊 Próximamente
          </div>
        </div>
        <div className="bg-white dark:bg-zenda-dark rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-zenda-display font-semibold text-zenda-primary dark:text-white mb-4">
            Estado de Órdenes
          </h3>
          <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500">
            📈 Próximamente
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
