import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import institutionRoutes from './routes/institutions.js';
import studentRoutes from './routes/students.js';
import gameRoutes from './routes/games.js';
import { authenticate } from './middleware/auth.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

const allowedOrigins = Array.from(
  new Set(
    (process.env.CLIENT_URL || 'http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174').split(',').map((s) => s.trim()).filter(Boolean)
  )
);

app.use(cors({
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes(origin) || /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// הרשמה וכניסה פתוחות לכולם, כל השאר דורש טוקן
app.use('/api/auth', authRoutes);
app.use('/api/institutions', authenticate, institutionRoutes);
app.use('/api/students', authenticate, studentRoutes);
app.use('/api/games', authenticate, gameRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
