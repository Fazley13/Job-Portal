import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import fs from 'fs';

// Import routes
import authRoutes from './routes/authRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import postRoutes from './routes/postRoutes.js';
import followRoutes from './routes/followRoutes.js';
import cvRoutes from './routes/cvRoutes.js';
import userRoutes from './routes/userRoutes.js';
import roadmapRoutes from './routes/roadmapRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import companyApplicationRoutes from './routes/companyApplicationRoutes.js';
import mentorshipRoutes from './routes/mentorshipRoutes.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // Vite dev server
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  },
});

// Real-time connection tracking
global.connectedUsers = {};

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('registerUser', (userId) => {
    connectedUsers[userId] = socket.id;
    console.log(`User ${userId} registered for real-time updates`);
    
    // Send online users list
    io.emit('onlineUsers', Object.keys(connectedUsers));
  });

  socket.on('disconnect', () => {
    // Remove user from connected users
    for (const [userId, sockId] of Object.entries(connectedUsers)) {
      if (sockId === socket.id) {
        delete connectedUsers[userId];
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
    
    // Send updated online users list
    io.emit('onlineUsers', Object.keys(connectedUsers));
    console.log('Socket disconnected:', socket.id);
  });
});


// Make io and connectedUsers available in routes
app.use((req, res, next) => {
  req.io = io;
  req.connectedUsers = connectedUsers;
  next();
});

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// Serve static files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/cv', cvRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roadmaps', roadmapRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/company-applications', companyApplicationRoutes);
app.use('/api/mentorship', mentorshipRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Job Portal API is running!',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// MongoDB connection and server start
const port = process.env.PORT || 8080;
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/jobportal';

mongoose.connect(mongoURI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    httpServer.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  httpServer.close(() => {
    mongoose.connection.close();
    process.exit(0);
  });
});