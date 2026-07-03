import { PostgresTicketRepository } from '../../adapters/repositories/PostgresTicketRepository';

export class TicketService {
  constructor(private ticketRepo: PostgresTicketRepository) {}

  async createFromIncident(incident: any): Promise<void> {
    const severityPriority: Record<string, number> = {
      LOW: 1,
      MEDIUM: 2,
      HIGH: 3,
      CRITICAL: 4,
    };

    const description = incident.description || incident.type || 'Incidente reportado';
    const incidentType = incident.type || 'DESCONOCIDO';
    const severity = incident.severity || 'MEDIUM';
    const busId = incident.bus_id || 'No especificado';
    const driverId = incident.driver_id || null;
    const incidentId = incident.incident_id || 'unknown';

    console.log(`🎫 CRM: Creando ticket para incidente ${incidentId}`);
    console.log(`   - Tipo: ${incidentType}`);
    console.log(`   - Severidad: ${severity} (Prioridad: ${severityPriority[severity] || 2})`);
    console.log(`   - Descripción: ${description}`);
    console.log(`   - Bus: ${busId}`);
    console.log(`   - Conductor: ${driverId || 'No asignado'}`);

    await this.ticketRepo.create({
      incidentId,
      busId,
      driverId,
      type: incidentType,
      severity,
      description,
      status: 'OPEN',
    });

    console.log(`✅ Ticket creado en la base de datos para incidente ${incidentId}`);
  }
}
