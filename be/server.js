require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("🚀 PayNest Backend is Running Successfully");
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Socket.io setup
const io = new Server(server, {
    cors: {
        origin: "*", // allow front-end
        methods: ["GET", "POST"]
    }
});
app.set('io', io);

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('register', (userId) => {
        console.log("User joined room:", userId);
        socket.join(userId);
    });

    socket.on('send_message', async (data) => {
        try {
            const Message = require('./models/Message');
            const newMessage = new Message({
                senderId: data.senderId,
                receiverId: data.receiverId,
                message: data.message,
                timestamp: data.timestamp || new Date()
            });
            await newMessage.save();

            console.log("Receiver ID:", data.receiverId);
            console.log("Sending to:", data.receiverId);
            io.to(data.receiverId).emit('receive_message', data);
        } catch (error) {
            console.error('Socket DB save error:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5002;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please stop the other process and try again.`);
        process.exit(1);
    } else {
        console.error('Server error:', err);
    }
});
