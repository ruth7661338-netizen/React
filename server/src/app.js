import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import institutionRoutes from './routes/institutions.js';
import studentRoutes from './routes/students.js';
import gameRoutes from './routes/games.js';
import { authenticate } from './middleware/auth.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((s) => s.trim());
app.use(cors({ origin: allowedOrigins }));
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
