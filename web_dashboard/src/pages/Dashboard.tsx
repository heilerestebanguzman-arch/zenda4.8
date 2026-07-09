import { useEffect, useState } from 'react';

export function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [newOrder, setNewOrder] = useState({
    vehicle_id: '123e4567-e89b-12d3-a456-426614174000',
    type: 'PREVENTIVE',
    priority: 'HIGH',
    description: '',
    scheduled_date: new Date().toISOString().slice(0, 16)
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token) {
      window.location.href = '/';
      return;
    }

    if (userData) {
      setUser(JSON.parse(userData));
    }
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await fetch('http://localhost:8093/api/v1/orders', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('http://localhost:8093/api/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newOrder),
      });
      const data = await response.json();
      if (data.status === 'accepted') {
        setMessage(`✅ Orden ${data.request_id.slice(0, 8)} creada exitosamente`);
        setShowForm(false);
        setNewOrder({
          vehicle_id: '123e4567-e89b-12d3-a456-426614174000',
          type: 'PREVENTIVE',
          priority: 'HIGH',
          description: '',
          scheduled_date: new Date().toISOString().slice(0, 16)
        });
        loadOrders();
      } else {
        setMessage('❌ Error al crear la orden');
      }
    } catch (error) {
      setMessage('❌ Error al conectar con el servidor');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">ZENDA 4.8</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-800">Cerrar sesión</button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Órdenes de Mantenimiento</h2>
            <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              {showForm ? 'Cancelar' : '+ Nueva Orden'}
            </button>
          </div>

          {message && <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-800">{message}</div>}

          {showForm && (
            <form onSubmit={handleCreateOrder} className="bg-white p-6 rounded-lg shadow-md mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Vehículo ID</label>
                  <input type="text" value={newOrder.vehicle_id} onChange={(e) => setNewOrder({...newOrder, vehicle_id: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo</label>
                  <select value={newOrder.type} onChange={(e) => setNewOrder({...newOrder, type: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                    <option value="PREVENTIVE">Preventivo</option>
                    <option value="CORRECTIVE">Correctivo</option>
                    <option value="EMERGENCY">Emergencia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prioridad</label>
                  <select value={newOrder.priority} onChange={(e) => setNewOrder({...newOrder, priority: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                    <option value="CRITICAL">Crítica</option>
                    <option value="HIGH">Alta</option>
                    <option value="MEDIUM">Media</option>
                    <option value="LOW">Baja</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha Programada</label>
                  <input type="datetime-local" value={newOrder.scheduled_date} onChange={(e) => setNewOrder({...newOrder, scheduled_date: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Descripción</label>
                  <textarea value={newOrder.description} onChange={(e) => setNewOrder({...newOrder, description: e.target.value})} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="Descripción..." required />
                </div>
              </div>
              <div className="mt-4">
                <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">Crear Orden</button>
              </div>
            </form>
          )}

          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prioridad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No hay órdenes registradas</td></tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id || order.request_id}>
                      <td className="px-6 py-4 text-sm text-gray-900">{(order.id || order.request_id || '').slice(0, 8)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{order.type || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${order.priority === 'CRITICAL' ? 'bg-red-100 text-red-800' : order.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' : order.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                          {order.priority || 'LOW'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : order.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {order.status || 'PENDING'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{order.scheduled_date ? new Date(order.scheduled_date).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
