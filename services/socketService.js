let io;

const init = (server) => {
  io = require('socket.io')(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join a room for specific user
    socket.on('join', (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their room`);
    });

    // Leave a room
    socket.on('leave', (userId) => {
      socket.leave(userId);
      console.log(`User ${userId} left their room`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};
const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
const emitMessage = (recipientId, data) => {
  if (!io) return;
  
  io.to(recipientId).emit('newMessage', data);
  console.log(`Message emitted to user ${recipientId}`);
};

module.exports = {
  init,
  getIO,
  emitMessage
};
