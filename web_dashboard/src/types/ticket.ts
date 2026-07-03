export interface Ticket {
  id: string;
  incidentId: string;
  busId: string;
  driverId?: string;
  type: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO' | 'LOW';
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
}

export type SeverityColor = '#E74C3C' | '#F39C12' | '#3498DB' | '#27AE60';

export const SEVERITY_COLORS: Record<Ticket['severity'], SeverityColor> = {
  CRITICAL: '#E74C3C',
  WARNING: '#F39C12',
  INFO: '#3498DB',
  LOW: '#27AE60',
};

export const SEVERITY_LABELS: Record<Ticket['severity'], string> = {
  CRITICAL: '🚨 CRÍTICO',
  WARNING: '⚠️ ADVERTENCIA',
  INFO: 'ℹ️ INFORMACIÓN',
  LOW: '✅ NORMAL',
};

export const STATUS_LABELS: Record<Ticket['status'], string> = {
  OPEN: 'ABIERTO',
  IN_PROGRESS: 'EN PROCESO',
  RESOLVED: 'RESUELTO',
  CLOSED: 'CERRADO',
};
