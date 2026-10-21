import { Router } from 'express';
import User from '../models/User.js';
import HttpError from '../utils/HttpError.js';
import { pick } from '../utils/query.js';
import { authenticate, signToken } from '../middleware/auth.js';

const router = Router();

const ROLE_LABELS = { admin: 'מנהל', teacher: 'מורה', student: 'תלמידה' };

// POST /api/auth/register - הרשמה עצמית של תלמידה
router.post('/register', async (req, res) => {
  const data = pick(req.body, ['name', 'idNumber', 'password', 'classroom']);
  if (!data.classroom) throw new HttpError(400, 'יש לבחור כיתה');
  const user = await User.create({ ...data, role: 'student' });
  res.status(201).json({ token: signToken(user), user });
});

// POST /api/auth/login - התחברות עם ת"ז וסיסמה
// role אופציונלי: אם נשלח (מסך כניסת מורה / מנהל / תלמידה) בודקים שהמשתמש באמת בתפקיד הזה
router.post('/login', async (req, res) => {
  const { idNumber, password, role } = req.body || {};
  if (!idNumber || !password) throw new HttpError(400, 'יש להזין תעודת זהות וסיסמה');

  const user = await User.findOne({ idNumber: String(idNumber).trim() }).select('+password');
  if (!user || !(await user.comparePassword(String(password)))) {
    throw new HttpError(401, 'תעודת זהות או סיסמה שגויים');
  }
  if (role && role !== user.role) {
    throw new HttpError(403, `למשתמש זה אין הרשאת כניסה כ${ROLE_LABELS[role] || role}`);
  }

  res.json({ token: signToken(user), user });
});

// GET /api/auth/me - מי המשתמש המחובר (לשחזור התחברות אחרי רענון דף)
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

export default router;
