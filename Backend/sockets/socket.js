import { Server } from 'socket.io';

const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_BASE_URL, // Dynamic from environment
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
