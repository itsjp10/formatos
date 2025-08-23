// servidor WebSocket (Socket.IO) para producción en Railway

import { createServer } from "http";
import { Server } from "socket.io";

const ALLOWED_ORIGIN =
  process.env.CORS_ORIGIN || "https://formatos.up.railway.app/"; // pon tu dominio web en prod para más seguridad

// healthcheck HTTP muy simple (Railway lo usa para marcar Healthy)
const httpServer = createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ ok: true }));
  }
  res.writeHead(200);
  res.end("OK");
});

// Socket.IO sobre el mismo server HTTP
const io = new Server(httpServer, {
  cors: { origin: ALLOWED_ORIGIN },
  path: "/socket.io", // default
  transports: ["websocket", "polling"], // por si el navegador no puede WS puro
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

const port = process.env.PORT || 3001;
httpServer.listen(port, "0.0.0.0", () => {
  console.log(`Socket.IO escuchando en puerto ${port}`);
});
