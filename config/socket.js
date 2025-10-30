const { Server } = require("socket.io");

let io;

const initSocket = (server,corsSetting) => {
  io = new Server(server, {
    cors: corsSetting,
  });

  io.on("connection", (socket) => {
    socket.on("disconnect", () => {});});
  global._io = io; 
};

module.exports =  initSocket ;
