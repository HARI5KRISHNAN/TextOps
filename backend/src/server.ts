import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { startWatchingPods, getPods, stopWatchingPods } from './services/k8s.service';
import aiRoutes from './routes/ai.routes';

// FIX: Switched from `declare global` to module augmentation for 'express-serve-static-core'.
// This is a more robust way to extend Express's Request type and resolves the issue where
// the custom `io` property was not being recognized.
declare module 'express-serve-static-core' {
  interface Request {
    io: Server;
    user?: any;
  }
}

const app = express();
const httpServer = createServer(app);

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow all origins in development; restrict in production
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
};

const io = new Server(httpServer, {
  cors: corsOptions,
  transports: ['websocket', 'polling'] // Support both WebSocket and HTTP polling
});

const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Attach io instance to request object
// FIX: Removed explicit types from middleware arguments to resolve an Express overload error
// and to align with the pattern of relying on type inference used in other controllers.
// The `req.io` property is now correctly typed via module augmentation.
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/ai', aiRoutes);

// Health check route
app.get('/', (req, res) => {
  res.send('Kubernetes Dashboard API is running!');
});

// API route to get current pod list
app.get('/api/pods', (req, res) => {
  const pods = getPods();
  res.json(pods);
});

// --- Socket.IO Events ---

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Send initial pod list to new clients
  socket.emit('initial_pods', getPods());

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Start the server
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Initialize Kubernetes watcher
startWatchingPods(io).catch(err => {
  console.error('Failed to start Kubernetes watcher:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  stopWatchingPods();
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
