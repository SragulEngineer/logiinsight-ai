const { Server } = require('socket.io');

let io = null;

module.exports = {
  init: (httpServer) => {
    io = new Server(httpServer, {
      cors: {
        origin: '*', // Restrict this in production matching frontend URL
        methods: ['GET', 'POST']
      }
    });

    io.on('connection', (socket) => {
      console.log(`🔌 Client connected to Socket.io: ${socket.id}`);
      
      // Clients join rooms corresponding to specific services they monitor
      socket.on('join-service-room', (serviceId) => {
        socket.join(serviceId);
        console.log(`📁 Socket ${socket.id} joined room: ${serviceId}`);
      });

      socket.on('disconnect', () => {
        console.log(`❌ Client disconnected: ${socket.id}`);
      });
    });

    return io;
  },
  getIoInstance: () => {
    if (!io) {
      throw new Error('Socket.io has not been initialized!');
    }
    return io;
  }
};