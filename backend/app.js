// backend/app.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Routes (pointing to src/routes/*.js)
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/users', require('./src/routes/users'));
app.use('/api/groups', require('./src/routes/groups'));
app.use('/api/scheduling', require('./src/routes/scheduling'));
app.use('/api/ai', require('./src/routes/ai'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    service: 'Study Group Backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join-group', (groupId) => {
    socket.join(groupId);
    console.log(`User ${socket.id} joined group ${groupId}`);
  });

  socket.on('whiteboard-update', (data) => {
    socket.to(data.groupId).emit('whiteboard-update', data);
  });

  socket.on('chat-message', (data) => {
    io.to(data.groupId).emit('chat-message', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling middleware (from src/middleware/errorHandler.js)
const errorHandler = require('./src/middleware/errorHandler');
app.use(errorHandler);

// ---------------------------------------------
// FIX: This section was changed to a standard Express 404 handler.
// The old line 'app.use('*', ...)' caused the 'PathError'.
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});
// ---------------------------------------------

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Socket.io ready for real-time connections`);
});

module.exports = { app, server, io };
