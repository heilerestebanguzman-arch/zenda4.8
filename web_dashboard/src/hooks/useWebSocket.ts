import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useWebSocket = (url: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const newSocket = io(url);
    setSocket(newSocket);

    newSocket.on('order:created', (data) => {
      console.log('📦 Nueva orden en tiempo real:', data);
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [url]);

  return { socket, messages };
};
