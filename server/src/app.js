import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import assignmentRoutes from './routes/assignments.js';
import submissionRoutes from './routes/submissions.js';
import { authenticate } from './middleware/auth.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((s) => s.trim());
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// התחברות פתוחה לכולם, כל השאר דורש טוקן
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticate, userRoutes);
app.use('/api/assignments', authenticate, assignmentRoutes);
app.use('/api/submissions', authenticate, submissionRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
