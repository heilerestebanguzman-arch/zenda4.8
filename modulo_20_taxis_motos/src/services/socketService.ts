import { Server } from 'socket.io';
import http from 'http';

class SocketService {
  private io: Server | null = null;
  private clients: Map<string, string> = new Map(); // driverId -> socketId

  initialize(server: http.Server) {
    this.io = new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    this.io.on('connection', (socket) => {
      console.log(`🔌 Nuevo cliente conectado: ${socket.id}`);

      // Registrar conductor
      socket.on('register-driver', (driverId) => {
        this.clients.set(driverId, socket.id);
        console.log(`🚗 Conductor ${driverId} registrado para WebSocket`);
        
        // Confirmar registro
        socket.emit('registration-confirmed', { driverId });
      });

      // Actualizar ubicación en tiempo real
      socket.on('update-location', (data) => {
        const { driverId, lat, lng } = data;
        // Emitir a todos los clientes (para heatmap)
        socket.broadcast.emit('driver-location-update', { driverId, lat, lng });
      });

      // Desconexión
      socket.on('disconnect', () => {
        console.log(`🔌 Cliente desconectado: ${socket.id}`);
        // Limpiar registro
        for (const [driverId, socketId] of this.clients) {
          if (socketId === socket.id) {
            this.clients.delete(driverId);
            break;
          }
        }
      });
    });

    console.log('✅ Socket.io inicializado');
  }

  // Enviar notificación de nuevo viaje a un conductor específico
  notifyDriver(driverId: string, tripData: any) {
    const socketId = this.clients.get(driverId);
    if (socketId && this.io) {
      this.io.to(socketId).emit('new-trip', tripData);
      console.log(`📱 Notificación enviada a conductor ${driverId}`);
      return true;
    }
    console.log(`⚠️ Conductor ${driverId} no conectado`);
    return false;
  }

  // Enviar notificación a todos los conductores
  broadcastToDrivers(event: string, data: any) {
    if (this.io) {
      this.io.emit(event, data);
    }
  }

  // Verificar si un conductor está conectado
  isDriverConnected(driverId: string): boolean {
    return this.clients.has(driverId);
  }

  // Obtener estadísticas de conexión
  getStats() {
    return {
      connectedDrivers: this.clients.size,
      totalClients: this.io ? this.io.sockets.sockets.size : 0,
    };
  }
}

export default new SocketService();
