import { io } from 'socket.io-client';

const rawSocketUrl = import.meta.env.VITE_SOCKET_URL || 
  (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : 'http://localhost:5000');
const SOCKET_URL = rawSocketUrl.replace(/\/+$/, '');

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected to NIRBHAYA X WebSocket Hub:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.warn('[Socket] Disconnected:', reason);
    });
  }
  return socket;
};

export const subscribeToTracking = (sessionId, onLocationUpdate) => {
  const s = getSocket();
  s.emit('sos:join-tracking', sessionId);
  s.on('sos:location-update', onLocationUpdate);
  return () => {
    s.off('sos:location-update', onLocationUpdate);
  };
};

export const streamGPSLocation = (sessionId, coords) => {
  const s = getSocket();
  if (s && s.connected) {
    s.emit('sos:stream-location', {
      sessionId,
      lat: coords.latitude,
      lng: coords.longitude,
      speed: coords.speed,
      heading: coords.heading,
      accuracy: coords.accuracy
    });
  }
};

