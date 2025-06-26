import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/auth.js';
import quizRoutes from './routes/quiz.js';
import tournamentRoutes from './routes/tournament.js';
import userRoutes from './routes/user.js';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'https://final-fullstack-umber.vercel.app/'
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// --- CORS MUST BE FIRST ---
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://final-fullstack-umber.vercel.app/'
  ],
  credentials: true
}));
app.options('*', cors()); // handle preflight

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not set!');
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log('\u2705 Connected to MongoDB'))
  .catch((error) => console.error('\u274c MongoDB connection error:', error));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/tournament', tournamentRoutes);
app.use('/api/user', userRoutes);

// Socket.IO for real-time features
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-tournament', (tournamentId) => {
    socket.join(tournamentId);
    console.log(`User ${socket.id} joined tournament ${tournamentId}`);
  });

  socket.on('tournament-answer', (data) => {
    socket.to(data.tournamentId).emit('player-answered', {
      playerId: socket.id,
      answer: data.answer,
      timeLeft: data.timeLeft
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export { io };
