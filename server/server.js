const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);

app.use(cors()); // Enable CORS for all routes

// Example route to check if the server is running
app.get('/', (req, res) => {
    res.send("Socket.io server is running");
});

// Example route to get connected users
app.get('/api/users', (req, res) => {
    res.json(Object.values(users));
});

// Update CORS settings for Socket.io
const io = new Server(server, {
    cors: {
        origin: ["https://stranger-chat-app-client.vercel.app"], // Add your client URL
        methods: ["GET", "POST"],
        credentials: true,
    }
});

const users = {};

io.on("connection", (socket) => {
    console.log(`User Connected ${socket.id}`);

    socket.on("join_room", (data) => {
        const { username, room } = data;
        socket.join(room);
        console.log(`User ${username} with ID ${socket.id} joined room: ${room}`);

        users[socket.id] = { username, room };

        const systemMessage = { username: "System", message: `${username} has joined the chat.` };
        io.to(room).emit("receive_message", systemMessage);
        io.to(room).emit("update_users", Object.values(users).filter(user => user.room === room));
    });

    socket.on("leave_room", (data) => {
        const { username, room } = data;
        console.log(`${username} has left the room: ${room}`);
        socket.leave(room);
        delete users[socket.id];

        const systemMessage = { username: "System", message: `${username} has left the chat.` };
        io.to(room).emit("receive_message", systemMessage);
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
            delete users[socket.id];
            io.to(room).emit("update_users", Object.values(users).filter(u => u.room === room));
        }
    });
});

server.listen(5000, () => console.log("Server is running on port: 5000"));
