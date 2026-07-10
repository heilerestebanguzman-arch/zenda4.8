import { useState, useEffect } from 'react';
import { reportService } from '../services/reportService';

interface DashboardData {
  total_revenue: number;
  total_orders: number;
  avg_order_value: number;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await reportService.getDashboard();
        setData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Cargando datos...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Ingresos Totales</h3>
          <p className="text-2xl font-bold text-primary">
            ${data?.total_revenue?.toFixed(2) || '0.00'}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Órdenes</h3>
          <p className="text-2xl font-bold text-secondary">
            {data?.total_orders || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Valor Promedio</h3>
          <p className="text-2xl font-bold text-warning">
            ${data?.avg_order_value?.toFixed(2) || '0.00'}
          </p>
        </div>
      </div>
    </div>
  );
}
