const { Server } = require("socket.io");

let io;

const initSocket = (server, corsSetting) => {
  io = new Server(server, {
    cors: corsSetting,
  });

  io.on("connection", (socket) => {
    //console.log("Socket connected:", socket.id);
    //for real time membership number of req. track 
    socket.on("join-library-room", (libId) => {
      socket.join(libId);
    });

    socket.on("leave-library-room", (libId) => {
      socket.leave(libId);
    });

    socket.on("disconnect", () => {
      //console.log("Socket disconnected:", socket.id);
    });
  });

  global._io = io; // make it accessible in controllers
};

module.exports = initSocket;
