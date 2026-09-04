import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
      }
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const SOCKET_URL = import.meta.env.PROD ? 'https://fixit-dk08.onrender.com' : '/';

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    socket.on('connect', () => {
      setConnected(true);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      setConnected(false);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [isAuthenticated]);

  const joinChat = useCallback((requestId) => {
    socketRef.current?.emit('chat:join', requestId);
  }, []);

  const leaveChat = useCallback((requestId) => {
    socketRef.current?.emit('chat:leave', requestId);
  }, []);

  const sendMessage = useCallback((requestId, message, type = 'text') => {
    socketRef.current?.emit('chat:message', { requestId, message, type });
  }, []);

  const sendTyping = useCallback((requestId) => {
    socketRef.current?.emit('chat:typing', { requestId });
  }, []);

  const stopTyping = useCallback((requestId) => {
    socketRef.current?.emit('chat:stop-typing', { requestId });
  }, []);

  const updateLocation = useCallback((requestId, latitude, longitude) => {
    socketRef.current?.emit('location:update', { requestId, latitude, longitude });
  }, []);

  const on = useCallback((event, handler) => {
    socketRef.current?.on(event, handler);
    return () => socketRef.current?.off(event, handler);
  }, []);

  const value = {
    socket: socketRef.current,
    connected,
    joinChat,
    leaveChat,
    sendMessage,
    sendTyping,
    stopTyping,
    updateLocation,
    on,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

export default SocketContext;
