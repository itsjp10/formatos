// server.js
import { Server } from "socket.io";
import { createServer } from "http";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*", // permitir cualquier origen
  },
});

io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);

  socket.on("join-formato", (formatoID) => {
    socket.join(formatoID);
    console.log(`Cliente ${socket.id} se unió a formato ${formatoID}`);
  });

  socket.on("update-formato", ({ formatoID, data }) => {
    socket.to(formatoID).emit("formato-actualizado", data);
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });
});

httpServer.listen(3001, () => {
  console.log("Servidor Socket.IO en http://localhost:3001");
});
