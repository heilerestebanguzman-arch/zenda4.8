import React, { useEffect, useState } from 'react';
import { type Ticket } from '../types/ticket';
import { api } from '../services/api';

export const CriticalAlert: React.FC = () => {
  const [criticalTickets, setCriticalTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCritical = async () => {
      try {
        const data = await api.getCriticalOpen();
        setCriticalTickets(data);
      } catch (error) {
        console.error('Error fetching critical tickets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCritical();
    const interval = setInterval(fetchCritical, 10000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div style={{ color: '#BDC3C7' }}>Cargando alertas...</div>;
  }

  if (criticalTickets.length === 0) {
    return (
      <div
        style={{
          backgroundColor: 'rgba(39, 174, 96, 0.1)',
          border: '1px solid #27AE60',
          borderRadius: '8px',
          padding: '16px 24px',
          color: '#27AE60',
          fontWeight: 'bold',
        }}
      >
        ✅ No hay incidentes críticos abiertos
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: 'rgba(231, 76, 60, 0.15)',
        border: `2px solid #E74C3C`,
        borderRadius: '8px',
        padding: '16px 24px',
        animation: 'pulse 2s infinite',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '32px' }}>🚨</span>
        <div>
          <div style={{ color: '#E74C3C', fontWeight: 'bold', fontSize: '18px' }}>
            {criticalTickets.length} INCIDENTE{criticalTickets.length > 1 ? 'S' : ''} CRÍTICO{criticalTickets.length > 1 ? 'S' : ''} PENDIENTE{criticalTickets.length > 1 ? 'S' : ''}
          </div>
          <div style={{ color: '#BDC3C7', fontSize: '14px' }}>
            {criticalTickets.map((t) => t.busId).join(', ')}
          </div>
        </div>
      </div>
    </div>
  );
};
