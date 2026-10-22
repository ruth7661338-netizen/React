import { Router } from 'express';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';
import HttpError from '../utils/HttpError.js';
import { pick } from '../utils/query.js';
import { authenticate, signToken } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/register - הרשמת מורה (תלמידים מתווספים ע"י המורה)
// systemCode = סיסמת המערכת (TEACHER_CODE ב-.env) - בודקת שרק מורות יכולות להירשם
// password = הסיסמה האישית של המורה - נשמרת מוצפנת ומשמשת לכניסה
router.post('/register', async (req, res) => {
  if (!req.body?.systemCode || req.body.systemCode !== process.env.TEACHER_CODE) {
    throw new HttpError(403, 'סיסמת המערכת שגויה', { systemCode: 'סיסמת המערכת שגויה' });
  }
  const data = pick(req.body, ['name', 'idNumber', 'age', 'password']);
  if (data.idNumber && (await Student.exists({ idNumber: String(data.idNumber).trim() }))) {
    throw new HttpError(409, 'קיים כבר משתמש עם תעודת זהות זו', { idNumber: 'קיים כבר משתמש עם תעודת זהות זו' });
  }
  const teacher = await Teacher.create(data);
  res.status(201).json({ token: signToken(teacher), user: teacher });
});

// POST /api/auth/login - כניסה עם שם ותעודת זהות
// תלמיד: שם + ת"ז. מורה: שם + ת"ז + סיסמה אישית
// השרת מחפש את ת"ז אצל המורים ואצל התלמידים ובודק שהשם (ולמורה גם הסיסמה) תואמים
router.post('/login', async (req, res) => {
  const name = String(req.body?.name ?? '').trim();
  const idNumber = String(req.body?.idNumber ?? '').trim();
  const password = req.body?.password;
  if (!name || !idNumber) throw new HttpError(400, 'יש להזין שם ותעודת זהות');

  const teacher = await Teacher.findOne({ idNumber }).select('+password');
  if (teacher) {
    if (teacher.name !== name) throw new HttpError(401, 'שם או תעודת זהות שגויים');
    if (!password) throw new HttpError(400, 'מורה חייבת להזין סיסמה', { password: 'יש להזין סיסמה' });
    if (!(await teacher.comparePassword(password))) {
      throw new HttpError(401, 'סיסמה שגויה', { password: 'סיסמה שגויה' });
    }
    return res.json({ token: signToken(teacher), user: teacher });
  }

  const student = await Student.findOne({ idNumber }).populate('institution', 'name');
  if (!student || student.name !== name) throw new HttpError(401, 'שם או תעודת זהות שגויים');
  res.json({ token: signToken(student), user: student });
});

// GET /api/auth/me - מי המשתמש המחובר (לשחזור התחברות אחרי רענון, ולרמה/ניקוד עדכניים של תלמיד)
router.get('/me', authenticate, async (req, res) => {
  if (req.user.status === 'student') await req.user.populate('institution', 'name');
  res.json({ user: req.user });
});

export default router;
