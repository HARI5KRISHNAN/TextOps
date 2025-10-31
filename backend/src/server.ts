import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { createServer as createHttpServer } from 'http';
import { createServer as createHttpsServer } from 'https';
import fs from 'fs';
import path from 'path';
import { Server } from 'socket.io';
import helmet from 'helmet';

import { startWatchingPods, getPods, stopWatchingPods } from './services/k8s.service';
import aiRoutes from './routes/ai.routes';
import authRoutes from './routes/auth.routes';
import chatRoutes from './routes/chat.routes';
import { apiLimiter } from './middleware/rateLimit.middleware';

declare module 'express-serve-static-core' {
  interface Request {
    io: Server;
    user?: any;
  }
}

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

// --- Server setup (HTTP or HTTPS) ---
let server;
if (isProduction) {
  try {
    const options = {
      key: fs.readFileSync(process.env.SSL_KEY_PATH!),
      cert: fs.readFileSync(process.env.SSL_CERT_PATH!),
    };
    server = createHttpsServer(options, app);
    console.log('✓ Running on HTTPS');
  } catch (err) {
    console.error('SSL certificate error. Falling back to HTTP.', err);
    server = createHttpServer(app);
    console.log('⚠️ Running on HTTP (production fallback)');
  }
} else {
  server = createHttpServer(app);
  console.log('Running on HTTP (development)');
}

const io = new Server(server, {
  cors: { origin: process.env.CORS_ORIGIN || '*' }
});

const PORT = process.env.PORT || 5001;

// --- Security Middleware ---
app.use(helmet()); // Set security-related HTTP headers
app.set('trust proxy', 1); // Trust first proxy for rate limiting, etc.

// Force HTTPS redirect in production
if (isProduction) {
  app.use((req, res, next) => {
    if (!req.secure) {
      return res.redirect('https://' + req.headers.host + req.url);
    }
    next();
  });
}

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use('/api/', apiLimiter); // Apply global rate limiting to all API routes

// Attach io instance to request object
app.use((req, res, next) => {
  req.io = io;
  next();
});

// --- Routes ---
app.use('/api/ai', aiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

app.get('/', (req, res) => res.send('Whooper API is running!'));
app.get('/api/pods', (req, res) => res.json(getPods()));

// --- Socket.IO Events ---
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  socket.emit('initial_pods', getPods());
  socket.on('disconnect', () => console.log(`Client disconnected: ${socket.id}`));
});

// --- Server Start & Shutdown ---
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

startWatchingPods(io).catch(err => {
  console.error('Top-level error starting Kubernetes watcher:', err);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  stopWatchingPods();
  server.close(() => console.log('Server closed'));
});
