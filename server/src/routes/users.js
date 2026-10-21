import { Router } from 'express';
import User from '../models/User.js';
import HttpError from '../utils/HttpError.js';
import { pick, searchRegex, parseSort } from '../utils/query.js';
import { authorize } from '../middleware/auth.js';

const router = Router();
const FIELDS = ['name', 'idNumber', 'password', 'role', 'classroom', 'subject'];

// GET /api/users?role=student&classroom=ח1&search=כהן&sort=name
// מנהל רואה את כולם, מורה רואה רק תלמידות
router.get('/', authorize('admin', 'teacher'), async (req, res) => {
  const { role, classroom, search, sort } = req.query;
  const filter = {};
  if (req.user.role === 'teacher') filter.role = 'student';
  else if (role) filter.role = role;
  if (classroom) filter.classroom = classroom;
  if (search) filter.$or = [{ name: searchRegex(search) }, { idNumber: searchRegex(search) }];

  const users = await User.find(filter).sort(parseSort(sort, ['name', 'createdAt', 'classroom'], { name: 1 }));
  res.json(users);
});

// GET /api/users/classrooms - רשימת הכיתות הקיימות (לשדה בחירה בטפסים)
router.get('/classrooms', async (_req, res) => {
  const classrooms = await User.distinct('classroom', { role: 'student', classroom: { $nin: [null, ''] } });
  res.json(classrooms.sort());
});

// POST /api/users - מנהל מוסיף משתמש (מורה / תלמידה / מנהל)
router.post('/', authorize('admin'), async (req, res) => {
  const user = await User.create(pick(req.body, FIELDS));
  res.status(201).json(user);
});

// PUT /api/users/:id - מנהל מעדכן משתמש (סיסמה רק אם נשלחה)
router.put('/:id', authorize('admin'), async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new HttpError(404, 'המשתמש לא נמצא');
  const data = pick(req.body, FIELDS);
  if (!data.password) delete data.password;
  Object.assign(user, data);
  await user.save();
  res.json(user);
});

// DELETE /api/users/:id
router.delete('/:id', authorize('admin'), async (req, res) => {
  if (req.params.id === String(req.user._id)) throw new HttpError(400, 'לא ניתן למחוק את המשתמש המחובר');
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new HttpError(404, 'המשתמש לא נמצא');
  res.json({ message: 'המשתמש נמחק', id: user._id });
});

export default router;
