const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');

const env = require('./config/env');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/error');
const runSeed = require('./utils/seed');

// Routes
const authRoutes = require('./routes/authRoutes');
const healthRoutes = require('./routes/healthRoutes');
const sosRoutes = require('./routes/sosRoutes');
const vaultRoutes = require('./routes/vaultRoutes');
const aiRoutes = require('./routes/aiRoutes');
const justiceRoutes = require('./routes/justiceRoutes');
const medicareRoutes = require('./routes/medicareRoutes');
const caseRoutes = require('./routes/caseRoutes');

const app = express();
const server = http.createServer(app);

// CORS Configuration supporting Vercel production domains and local dev
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.length === 0 ||
      allowedOrigins.includes('*') ||
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1')
    ) {
      return callback(null, true);
    }
    return callback(null, true); // Fallback permissive for demo resilience
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => callback(null, true),
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Attach socket io to req
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api', limiter);

// Body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health & Root
app.use('/api', healthRoutes);
app.get('/', (req, res) => {
  res.json({
    platform: 'NIRBHAYA X API Gateway',
    version: '1.0.0',
    status: 'online',
    tagline: 'From Safety to Evidence, From Evidence to Justice',
    docs: '/api/health'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/vault', vaultRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/justice', justiceRoutes);
app.use('/api/medicare', medicareRoutes);
app.use('/api/cases', caseRoutes);

// Socket.IO real-time location stream and alert broadcaster
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`[Socket.IO] Client ${socket.id} joined room ${roomId}`);
  });

  socket.on('sos:join-tracking', (sessionId) => {
    socket.join(`session_${sessionId}`);
    console.log(`[Socket.IO] Client ${socket.id} subscribed to tracking session: ${sessionId}`);
  });

  socket.on('sos:stream-location', async (payload) => {
    try {
      const { sessionId, lat, lng, speed, heading, accuracy } = payload;
      if (sessionId && lat && lng) {
        // Broadcast location update to all subscribers in this session's room
        io.to(`session_${sessionId}`).emit('sos:location-update', {
          sessionId,
          lat,
          lng,
          speed: speed || 0,
          heading: heading || 0,
          accuracy: accuracy || 5,
          timestamp: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('[Socket.IO stream error]:', err.message);
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Centralized error handler
app.use(errorHandler);

// Start server function
const startServer = async () => {
  await connectDB();

  if (env.DEMO_MODE) {
    await runSeed();
  }

  return new Promise((resolve) => {
    server.listen(env.PORT, () => {
      console.log(`\n======================================================`);
      console.log(`🛡️  NIRBHAYA X BACKEND API ONLINE`);
      console.log(`📡  Server running on http://localhost:${env.PORT}`);
      console.log(`⚙️   Mode: ${env.NODE_ENV} | Demo Mode: ${env.DEMO_MODE}`);
      console.log(`🔗  Health Check: http://localhost:${env.PORT}/api/health`);
      console.log(`======================================================\n`);
      resolve(server);
    });
  });
};

if (require.main === module) {
  startServer().catch((err) => {
    console.error('[Server Startup Failure]:', err.message);
    process.exit(1);
  });
}

module.exports = { app, server, io, startServer };
