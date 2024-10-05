const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const http = require('http');
require('dotenv').config(); // If you plan to use environment variables

const app = express();
const server = http.createServer(app);

// Update CORS settings to allow both localhost and production frontend
const io = new Server(server, {
  cors: {
    origin: ["https://stranger-chat-application-frontend.vercel.app", "http://localhost:3000"],
    methods: ["GET", "POST"], // You can also add PUT if needed
    credentials: true,
  },
});

app.use(cors({
  origin: ["https://stranger-chat-application-frontend.vercel.app", "http://localhost:3000"],
  credentials: true,
}));

app.get("/", (req, res) => {
  res.json("Hello from backend!");
});

const users = {};

io.on("connection", (socket) => {
  console.log(`User Connected ${socket.id}`);

  socket.on("join_room", (data) => {
    const { username, room } = data;
    socket.join(room);
    console.log(`User ${username} with ID ${socket.id} joined room: ${room}`);

    users[socket.id] = { username, room };

    // Emit updated user list to all clients in the room
    io.to(room).emit("update_users", Object.values(users).filter(user => user.room === room));
  });

  socket.on("leave_room", (data) => {
    const { username, room } = data;
    console.log(`${username} has left the room: ${room}`);
    socket.leave(room);

    // Remove the user from the users object
    delete users[socket.id];

    // Emit the updated list of users in the room
    io.to(room).emit("update_users", Object.values(users).filter(user => user.room === room));
  });

  socket.on("send_message", (data) => {
    console.log(`Message from ${data.username} in room ${data.room}: ${data.message}`);
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);

    const user = users[socket.id];
    if (user) {
      const { room } = user;
      delete users[socket.id]; // Remove the user from the list

      // Emit the updated list of users in the room after disconnection
      io.to(room).emit("update_users", Object.values(users).filter(u => u.room === room));
    }
  });
});

// Use environment variable for PORT, or default to 5000
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));
