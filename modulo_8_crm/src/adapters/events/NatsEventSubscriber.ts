import { connect, NatsConnection, StringCodec } from 'nats';
import { TicketService } from '../../core/services/TicketService';

interface IncidentCreatedEvent {
  event_type: 'INCIDENT_CREATED';
  version: string;
  timestamp: string;
  payload: {
    incident_id: string;
    bus_id: string;
    driver_id: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    type: string;
    location: {
      latitude: number;
      longitude: number;
    };
    description: string;
    timestamp: string;
  };
}

export class NatsEventSubscriber {
  private nc: NatsConnection | null = null;
  private sc = StringCodec();

  constructor(
    private natsUrl: string,
    private ticketService: TicketService
  ) {}

  async connect(): Promise<void> {
    this.nc = await connect({ servers: this.natsUrl });
    console.log('✅ CRM: Conectado a NATS');
  }

  async subscribeToIncidents(): Promise<void> {
    if (!this.nc) throw new Error('NATS no conectado');

    const sub = this.nc.subscribe('incident.created');
    console.log('📡 CRM: Suscrito a incident.created');

    for await (const msg of sub) {
      try {
        const data = JSON.parse(this.sc.decode(msg.data)) as IncidentCreatedEvent;
        console.log(`🔔 CRM: Evento recibido: ${data.payload.incident_id}`);
        await this.ticketService.createFromIncident(data.payload);
      } catch (error) {
        console.error('❌ CRM: Error al procesar evento:', error);
      }
    }
  }

  async disconnect(): Promise<void> {
    if (this.nc) {
      await this.nc.drain();
      console.log('🛑 CRM: Desconectado de NATS');
    }
  }
}
