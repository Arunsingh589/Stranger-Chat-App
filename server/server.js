const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const http = require('http')


const app = express();
const server = http.createServer(app);

// Example route to check if the server is running
app.get('/', (req, res) => {
    res.send("Socket.io server is running");
});

// Example route to get connected users
app.get('/api/users', (req, res) => {
    res.json(Object.values(users));
});

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "PUT"]
    }
});


const users = {};

io.on("connection", (socket) => {
    console.log(`User Connected ${socket.id}`)

    socket.on("join_room", (data) => {
        const { username, room } = data
        socket.join(room);
        console.log(`User ${username} with ID ${socket.id} joined room: ${room}`);

        users[socket.id] = { username, room };

        // / Emit a system message to notify others in the room
        const systemMessage = { username: "System", message: `${username} has joined the chat.` };
        io.to(room).emit("receive_message", systemMessage);

        // Emit updated user list to all clients in the room
        io.to(room).emit("update_users", Object.values(users).filter(user => user.room === room));

    });

    // When a user leaves the room
    socket.on("leave_room", (data) => {
        const { username, room } = data;
        console.log(`${username} has left the room: ${room}`);
        socket.leave(room);

        // Remove the user from the users object
        delete users[socket.id];

        // / Emit a system message to notify others in the room
        const systemMessage = { username: "System", message: `${username} has left the chat.` };
        io.to(room).emit("receive_message", systemMessage);

        // Emit the updated list of users in the room
        io.to(room).emit("update_users", Object.values(users).filter(user => user.room === room));
    });


    socket.on("send_message", (data) => {
        console.log(`Message from ${data.username} in room ${data.room}: ${data.message}`);
        socket.to(data.room).emit("receive_message", data);

    })



    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);

        const user = users[socket.id];
        if (user) {
            const { room } = user;
            delete users[socket.id];  // Remove the user from the list

            // Emit the updated list of users in the room after disconnection
            io.to(room).emit("update_users", Object.values(users).filter(u => u.room === room));
        }
    })

})

app.use(cors())

server.listen(5000, () => console.log("Server is running on port: 5000"));









// io.on("connection", (socket) => {
//     console.log(socket.id)

//     socket.on("join_room", (data) => {
//         socket.join(data);
//         console.log(UserId: ${socket.id} room: ${data});

//         users[socket.id] = { username: data.username, room: data.room };

//         // Emit updated user list to all clients in the room
//         io.to(data.room).emit("update_users", Object.values(users).filter(user => user.room === data.room));

//     })

//     socket.on("send_message", (data) => {
//         console.log("send message data", data);
//         socket.to(data.room).emit("receive_message", data)

//     })



//     socket.on("disconnect", () => {
//         console.log("User disconnected", socket.id);

//         // Remove the user from the users object
//         const user = users[socket.id];
//         if (user) {
//             delete users[socket.id];
//             // Emit updated user list to all clients in the room
//             io.to(user.room).emit("update_users", Object.values(users).filter(u => u.room === user.room));
//         }


//     })

// })





