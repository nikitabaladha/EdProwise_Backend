// EdProwise_Backend\socket.js
let ioInstance = null;

export const setIO = (io) => {
  ioInstance = io;
};

export const getIO = () => {
  if (!ioInstance) {
    throw new Error(
      "Socket.io not initialized! Make sure to call setIO() first"
    );
  }
  return ioInstance;
};
