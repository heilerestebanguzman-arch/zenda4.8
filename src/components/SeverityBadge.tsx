import React from 'react';
import { Ticket, SEVERITY_COLORS, SEVERITY_LABELS } from '../types/ticket';

interface SeverityBadgeProps {
  severity: Ticket['severity'];
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity }) => {
  const color = SEVERITY_COLORS[severity];
  const label = SEVERITY_LABELS[severity];

  return (
    <span
      style={{
        backgroundColor: color,
        color: '#FFFFFF',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        display: 'inline-block',
      }}
    >
      {label}
    </span>
  );
};
