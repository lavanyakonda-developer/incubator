import http from "http";
import { Server } from "socket.io";

const server = http.createServer();

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("join_room", (data) => {
    if (!socket.rooms.has(data)) {
      socket.join(data);
    }
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("send_notification", (data) => {
    socket.to(data.room).emit("receive_notification", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

// Starting the socket server on port 3001
const socketPort = 3001;
server.listen(socketPort, () => {
  console.log(`Socket.IO server is running at ${socketPort}`);
});
