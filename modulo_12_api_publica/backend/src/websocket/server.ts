import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { StringCodec } from 'nats';

const sc = StringCodec();

export const setupWebSocket = (server: HttpServer, nc: any) => {
  const io = new Server(server, {
    cors: { origin: '*' }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Cliente conectado: ${socket.id}`);

    // Suscribirse a eventos de NATS
    const sub = nc.subscribe('order.created', (msg: any) => {
      const data = JSON.parse(sc.decode(msg.data));
      io.emit('order:created', data);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Cliente desconectado: ${socket.id}`);
      sub.unsubscribe();
    });
  });

  return io;
};
