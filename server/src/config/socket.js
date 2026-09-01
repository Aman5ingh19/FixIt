const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('./index');
const logger = require('./logger');

let io = null;

function initSocketIO(server) {
  io = new Server(server, {
    cors: {
      origin: config.cors.origins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Auth middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = jwt.verify(token, config.jwt.accessSecret);
      socket.userId = decoded.userId;
      socket.userRole = decoded.role;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info('Socket connected', { userId: socket.userId, socketId: socket.id });

    // Join user's personal room
    socket.join(`user:${socket.userId}`);

    // Join role-based room
    socket.join(`role:${socket.userRole}`);

    // ── Chat ──
    socket.on('chat:join', (requestId) => {
      socket.join(`chat:${requestId}`);
      logger.debug('Joined chat room', { userId: socket.userId, requestId });
    });

    socket.on('chat:leave', (requestId) => {
      socket.leave(`chat:${requestId}`);
    });

    socket.on('chat:message', (data) => {
      const { requestId, message, type = 'text' } = data;
      const payload = {
        senderId: socket.userId,
        requestId,
        message,
        type,
        timestamp: new Date().toISOString(),
      };
      // Broadcast to everyone in the chat room (including sender)
      io.to(`chat:${requestId}`).emit('chat:message', payload);
      logger.debug('Chat message sent', { requestId, senderId: socket.userId });
    });

    socket.on('chat:typing', (data) => {
      socket.to(`chat:${data.requestId}`).emit('chat:typing', {
        userId: socket.userId,
        requestId: data.requestId,
      });
    });

    socket.on('chat:stop-typing', (data) => {
      socket.to(`chat:${data.requestId}`).emit('chat:stop-typing', {
        userId: socket.userId,
        requestId: data.requestId,
      });
    });

    // ── Technician location tracking ──
    socket.on('location:update', (data) => {
      const { requestId, latitude, longitude } = data;
      io.to(`chat:${requestId}`).emit('location:update', {
        technicianId: socket.userId,
        latitude,
        longitude,
        timestamp: new Date().toISOString(),
      });
    });

    // ── Disconnect ──
    socket.on('disconnect', (reason) => {
      logger.debug('Socket disconnected', { userId: socket.userId, reason });
    });
  });

  logger.info('✓ Socket.IO initialized');
  return io;
}

function getIO() {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}

// Helper to emit to a specific user
function emitToUser(userId, event, data) {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
}

// Helper to emit to all users with a specific role
function emitToRole(role, event, data) {
  if (io) {
    io.to(`role:${role}`).emit(event, data);
  }
}

module.exports = { initSocketIO, getIO, emitToUser, emitToRole };
