let io;

module.exports = {
  init: function(socketIo) {
    io = socketIo;
  },
  getIO: function() {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  }
}; 