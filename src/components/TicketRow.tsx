import React from 'react';
import { Ticket, SEVERITY_COLORS } from '../types/ticket';
import { SeverityBadge } from './SeverityBadge';

interface TicketRowProps {
  ticket: Ticket;
}

export const TicketRow: React.FC<TicketRowProps> = ({ ticket }) => {
  const borderColor = SEVERITY_COLORS[ticket.severity];

  return (
    <tr
      style={{
        borderLeft: `4px solid ${borderColor}`,
        backgroundColor: ticket.severity === 'CRITICAL' ? 'rgba(231, 76, 60, 0.1)' : 'transparent',
        transition: 'background-color 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor =
          ticket.severity === 'CRITICAL' ? 'rgba(231, 76, 60, 0.1)' : 'transparent';
      }}
    >
      <td style={{ padding: '12px', color: '#ECF0F1' }}>
        <SeverityBadge severity={ticket.severity} />
      </td>
      <td style={{ padding: '12px', color: '#ECF0F1' }}>{ticket.incidentId.substring(0, 8)}</td>
      <td style={{ padding: '12px', color: '#ECF0F1' }}>{ticket.busId}</td>
      <td style={{ padding: '12px', color: '#ECF0F1' }}>{ticket.description}</td>
      <td style={{ padding: '12px', color: '#ECF0F1' }}>
        <span
          style={{
            backgroundColor: ticket.status === 'OPEN' ? '#E74C3C' : '#27AE60',
            color: '#FFFFFF',
            padding: '2px 10px',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: 'bold',
          }}
        >
          {ticket.status}
        </span>
      </td>
      <td style={{ padding: '12px', color: '#BDC3C7', fontSize: '12px' }}>
        {new Date(ticket.createdAt).toLocaleString()}
      </td>
    </tr>
  );
};
