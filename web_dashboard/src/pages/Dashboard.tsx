import { useState, useEffect } from 'react';
import { orderService } from '../services/orderService';
import { StatusBadge } from '../components/ui/StatusBadge';

interface Order {
  request_id: string;
  status: string;
  order_data: {
    priority: string;
    description: string;
  };
}

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await orderService.getOrders();
        if (response.status === 'ok' && response.data) {
          setOrders(response.data);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Cargando...</div>;
  }

  const total = orders.length;
  const pending = orders.filter(o => o.status === 'PENDING').length;
  const inProgress = orders.filter(o => o.status === 'IN_PROGRESS').length;
  const completed = orders.filter(o => o.status === 'COMPLETED').length;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Panel de Control</h1>
      
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-medium text-blue-700">Total Órdenes</h3>
          <p className="text-3xl font-bold text-blue-700">{total}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-medium text-yellow-700">Pendientes</h3>
          <p className="text-3xl font-bold text-yellow-700">{pending}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-medium text-blue-700">En Progreso</h3>
          <p className="text-3xl font-bold text-blue-700">{inProgress}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-medium text-green-700">Completadas</h3>
          <p className="text-3xl font-bold text-green-700">{completed}</p>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N° Orden</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridad</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  No hay órdenes de mantenimiento
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.request_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {order.request_id.slice(0, 8)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      order.order_data?.priority === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                      order.order_data?.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                      order.order_data?.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {order.order_data?.priority || 'LOW'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {order.order_data?.description || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={order.status || 'PENDING'} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
