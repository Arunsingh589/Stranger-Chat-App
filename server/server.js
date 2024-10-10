const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const http = require('http');

// Create an Express application
const app = express();
const server = http.createServer(app);

// CORS configuration
app.use(cors({
    origin: "https://stranger-chat-app-client.vercel.app/", // Your client URL
    methods: ["GET", "POST"],
    credentials: true,
}));

// Example route to check if the server is running
app.get('/', (req, res) => {
    res.send("Socket.io server is running");
});

// Create a new Socket.IO instance
const io = new Server(server, {
    cors: {
        origin: "https://stranger-chat-app-client.vercel.app/", // Your client URL
        methods: ["GET", "POST"],
        credentials: true,
    }
});

// Store connected users
const users = {};

// Handle socket connection
io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on("join_room", (data) => {
        const { username, room } = data;
        socket.join(room);
        console.log(`User ${username} with ID ${socket.id} joined room: ${room}`);

        users[socket.id] = { username, room };

        // Emit a system message to notify others in the room
        const systemMessage = { username: "System", message: `${username} has joined the chat.` };
        io.to(room).emit("receive_message", systemMessage);

        // Emit updated user list to all clients in the room
        io.to(room).emit("update_users", Object.values(users).filter(user => user.room === room));
    });

    socket.on("leave_room", (data) => {
        const { username, room } = data;
        console.log(`${username} has left the room: ${room}`);
        socket.leave(room);

        // Remove the user from the users object
        delete users[socket.id];

        // Emit a system message to notify others in the room
        const systemMessage = { username: "System", message: `${username} has left the chat.` };
        io.to(room).emit("receive_message", systemMessage);

        // Emit the updated list of users in the room
        io.to(room).emit("update_users", Object.values(users).filter(user => user.room === room));
    });

    socket.on("send_message", (data) => {
        console.log(`Message from ${data.username} in room ${data.room}: ${data.message}`);
        socket.to(data.room).emit("receive_message", data);
    });

    socket.on("disconnect", () => {
        console.log(`User Disconnected: ${socket.id}`);
        const user = users[socket.id];
        if (user) {
            const { room } = user;
            delete users[socket.id];  // Remove the user from the list

            // Emit the updated list of users in the room after disconnection
            io.to(room).emit("update_users", Object.values(users).filter(u => u.room === room));
        }
    });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));
