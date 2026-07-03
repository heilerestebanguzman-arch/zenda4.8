import React, { useEffect, useState } from 'react';
import { type Ticket } from '../types/ticket';
import { api } from '../services/api';
import { TicketRow } from './TicketRow';
import { CriticalAlert } from './CriticalAlert';

export const Dashboard: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'OPEN' | 'CRITICAL'>('all');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        let data: Ticket[];
        if (filter === 'OPEN') {
          data = await api.getTicketsByStatus('OPEN');
        } else if (filter === 'CRITICAL') {
          data = await api.getTicketsBySeverity('CRITICAL');
        } else {
          data = await api.getTickets();
        }
        setTickets(data);
      } catch (error) {
        console.error('Error fetching tickets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
    const interval = setInterval(fetchTickets, 5000);

    return () => clearInterval(interval);
  }, [filter]);

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === 'OPEN').length,
    critical: tickets.filter((t) => t.severity === 'CRITICAL').length,
    resolved: tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length,
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#1E1E1E', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ color: '#ECF0F1', fontSize: '28px', fontWeight: 'bold' }}>
          🚀 ZENDA 4.8 - Panel de Control
        </h1>
        <div style={{ color: '#BDC3C7', fontSize: '14px' }}>
          Última actualización: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <CriticalAlert />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#2C3E50', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ color: '#ECF0F1', fontSize: '24px', fontWeight: 'bold' }}>{stats.total}</div>
          <div style={{ color: '#BDC3C7', fontSize: '12px' }}>Total Tickets</div>
        </div>
        <div style={{ backgroundColor: '#2C3E50', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ color: '#E74C3C', fontSize: '24px', fontWeight: 'bold' }}>{stats.open}</div>
          <div style={{ color: '#BDC3C7', fontSize: '12px' }}>Abiertos</div>
        </div>
        <div style={{ backgroundColor: '#2C3E50', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ color: '#F39C12', fontSize: '24px', fontWeight: 'bold' }}>{stats.critical}</div>
          <div style={{ color: '#BDC3C7', fontSize: '12px' }}>Críticos</div>
        </div>
        <div style={{ backgroundColor: '#2C3E50', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ color: '#27AE60', fontSize: '24px', fontWeight: 'bold' }}>{stats.resolved}</div>
          <div style={{ color: '#BDC3C7', fontSize: '12px' }}>Resueltos</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <button
          onClick={() => setFilter('all')}
          style={{
            backgroundColor: filter === 'all' ? '#3498DB' : '#2C3E50',
            color: '#FFFFFF',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Todos
        </button>
        <button
          onClick={() => setFilter('OPEN')}
          style={{
            backgroundColor: filter === 'OPEN' ? '#E74C3C' : '#2C3E50',
            color: '#FFFFFF',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Abiertos
        </button>
        <button
          onClick={() => setFilter('CRITICAL')}
          style={{
            backgroundColor: filter === 'CRITICAL' ? '#F39C12' : '#2C3E50',
            color: '#FFFFFF',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Críticos
        </button>
      </div>

      <div style={{ backgroundColor: '#2C3E50', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#1E1E1E', borderBottom: '2px solid #34495E' }}>
              <th style={{ padding: '12px', textAlign: 'left', color: '#BDC3C7', fontSize: '12px', fontWeight: 'bold' }}>
                Severidad
              </th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#BDC3C7', fontSize: '12px', fontWeight: 'bold' }}>
                Incidente
              </th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#BDC3C7', fontSize: '12px', fontWeight: 'bold' }}>
                Bus
              </th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#BDC3C7', fontSize: '12px', fontWeight: 'bold' }}>
                Descripción
              </th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#BDC3C7', fontSize: '12px', fontWeight: 'bold' }}>
                Estado
              </th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#BDC3C7', fontSize: '12px', fontWeight: 'bold' }}>
                Fecha
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#BDC3C7' }}>
                  Cargando tickets...
                </td>
              </tr>
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#BDC3C7' }}>
                  No hay tickets para mostrar
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => <TicketRow key={ticket.id} ticket={ticket} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
