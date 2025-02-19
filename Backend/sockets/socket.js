import { Server } from 'socket.io';

const allowedOrigins =
  process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_BASE_URL, process.env.FFRONTEND_BASE_URL]
    : [process.env.FRONTEND_BASE_URL];

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: allowedOrigins, // Allow multiple origins in production
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('order:created', (order) => {
      console.log('New order:', order);
      io.emit('order:created', order);
    });

    socket.on('order:statusChanged', (data) => {
      console.log('Order status changed:', data);
      io.emit('order:updated', data);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};

export default initializeSocket;
