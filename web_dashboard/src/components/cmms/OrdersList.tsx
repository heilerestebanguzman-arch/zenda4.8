import React, { useEffect, useState } from 'react';
import type { MaintenanceOrder } from '../../services/api';
import { api } from '../../services/api';

const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: '#E74C3C',
  HIGH: '#F39C12',
  MEDIUM: '#3498DB',
  LOW: '#27AE60',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#E74C3C',
  IN_PROGRESS: '#F39C12',
  COMPLETED: '#27AE60',
  CANCELLED: '#95A5A6',
  APPROVED: '#3498DB',
};

const TYPE_LABELS: Record<string, string> = {
  PREVENTIVE: '🔧 Preventivo',
  CORRECTIVE: '🔨 Correctivo',
  EMERGENCY: '🚨 Emergencia',
  INSPECTION: '🔍 Inspección',
};

export const OrdersList: React.FC = () => {
  const [orders, setOrders] = useState<MaintenanceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'>('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        let data: MaintenanceOrder[];
        if (filter === 'all') {
          data = await api.getOrders();
        } else {
          data = await api.getOrdersByStatus(filter);
        }
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [filter]);

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'PENDING').length,
    inProgress: orders.filter((o) => o.status === 'IN_PROGRESS').length,
    completed: orders.filter((o) => o.status === 'COMPLETED').length,
  };

  return (
    <div style={{ backgroundColor: '#1E1E1E', padding: '24px', borderRadius: '8px' }}>
      <h2 style={{ color: '#ECF0F1', marginBottom: '16px' }}>🔧 Órdenes de Mantenimiento</h2>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
        <div style={{ backgroundColor: '#2C3E50', padding: '12px 20px', borderRadius: '8px' }}>
          <div style={{ color: '#BDC3C7', fontSize: '12px' }}>Total</div>
          <div style={{ color: '#ECF0F1', fontSize: '24px', fontWeight: 'bold' }}>{stats.total}</div>
        </div>
        <div style={{ backgroundColor: '#2C3E50', padding: '12px 20px', borderRadius: '8px' }}>
          <div style={{ color: '#E74C3C', fontSize: '12px' }}>Pendientes</div>
          <div style={{ color: '#E74C3C', fontSize: '24px', fontWeight: 'bold' }}>{stats.pending}</div>
        </div>
        <div style={{ backgroundColor: '#2C3E50', padding: '12px 20px', borderRadius: '8px' }}>
          <div style={{ color: '#F39C12', fontSize: '12px' }}>En Progreso</div>
          <div style={{ color: '#F39C12', fontSize: '24px', fontWeight: 'bold' }}>{stats.inProgress}</div>
        </div>
        <div style={{ backgroundColor: '#2C3E50', padding: '12px 20px', borderRadius: '8px' }}>
          <div style={{ color: '#27AE60', fontSize: '12px' }}>Completadas</div>
          <div style={{ color: '#27AE60', fontSize: '24px', fontWeight: 'bold' }}>{stats.completed}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        {['all', 'PENDING', 'IN_PROGRESS', 'COMPLETED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status as any)}
            style={{
              backgroundColor: filter === status ? '#3498DB' : '#2C3E50',
              color: '#FFFFFF',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '12px',
            }}
          >
            {status === 'all' ? 'Todos' : status}
          </button>
        ))}
      </div>

      <div style={{ backgroundColor: '#2C3E50', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#1E1E1E' }}>
              <th style={{ padding: '12px', textAlign: 'left', color: '#BDC3C7', fontSize: '12px' }}>N° Orden</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#BDC3C7', fontSize: '12px' }}>Prioridad</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#BDC3C7', fontSize: '12px' }}>Título</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#BDC3C7', fontSize: '12px' }}>Tipo</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#BDC3C7', fontSize: '12px' }}>Estado</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#BDC3C7', fontSize: '12px' }}>Técnico</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#BDC3C7' }}>
                  Cargando órdenes...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#BDC3C7' }}>
                  No hay órdenes de mantenimiento
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.id}
                  style={{
                    borderLeft: `4px solid ${PRIORITY_COLORS[order.priority] || '#3498DB'}`,
                    backgroundColor: order.priority === 'CRITICAL' ? 'rgba(231, 76, 60, 0.1)' : 'transparent',
                  }}
                >
                  <td style={{ padding: '12px', color: '#ECF0F1', fontSize: '14px' }}>
                    {order.order_number}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span
                      style={{
                        backgroundColor: PRIORITY_COLORS[order.priority] || '#3498DB',
                        color: '#FFFFFF',
                        padding: '2px 10px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                      }}
                    >
                      {order.priority}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: '#ECF0F1' }}>{order.title}</td>
                  <td style={{ padding: '12px', color: '#BDC3C7', fontSize: '13px' }}>
                    {TYPE_LABELS[order.type] || order.type}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span
                      style={{
                        backgroundColor: STATUS_COLORS[order.status] || '#95A5A6',
                        color: '#FFFFFF',
                        padding: '2px 10px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                      }}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: '#BDC3C7' }}>{order.technician || 'N/A'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
