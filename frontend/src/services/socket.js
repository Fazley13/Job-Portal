import io from 'socket.io-client';

const socket = io(process.env.REACT_APP_BACKEND_URL, {
  withCredentials: true,
  autoConnect: false
});

export const connectSocket = (userId) => {
  if (!socket.connected) {
    socket.connect();
    socket.emit('subscribe', userId);
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export const onApplicationUpdate = (callback) => {
  socket.on('applicationUpdate', callback);
};

export const offApplicationUpdate = (callback) => {
  socket.off('applicationUpdate', callback);
};

export default socket;