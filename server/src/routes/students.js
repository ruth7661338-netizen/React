import { Router } from 'express';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Institution from '../models/Institution.js';
import HttpError from '../utils/HttpError.js';
import { pick, searchRegex, parseSort } from '../utils/query.js';
import { authorize } from '../middleware/auth.js';

const router = Router();
router.use(authorize('teacher'));

// המורה קובעת רק את הפרטים האלה. רמה, ניקוד וסטטוס נקבעים אוטומטית
const FIELDS = ['idNumber', 'name', 'age', 'institution'];

// מוודא שהמוסד שנבחר שייך למורה המחוברת
async function checkInstitution(teacherId, institutionId) {
  if (!institutionId) return;
  const ok = await Institution.exists({ _id: institutionId, teacher: teacherId });
  if (!ok) throw new HttpError(400, 'המוסד לא נמצא', { institution: 'יש לבחור מוסד מהרשימה' });
}

async function findOwnStudent(req) {
  const student = await Student.findOne({ _id: req.params.id, teacher: req.user._id });
  if (!student) throw new HttpError(404, 'התלמיד לא נמצא');
  return student;
}

// GET /api/students?institution=<id>&name=כהן&level=2&sort=-score
// כל התלמידים של המורה, עם חיפוש לפי מוסד / שם / רמה
router.get('/', async (req, res) => {
  const { institution, name, level, sort } = req.query;
  const filter = { teacher: req.user._id };
  if (institution) filter.institution = institution;
  if (name) filter.name = searchRegex(name);
  if (level !== undefined && level !== '') filter.level = Number(level);

  const students = await Student.find(filter)
    .populate('institution', 'name')
    .sort(parseSort(sort, ['name', 'age', 'level', 'score', 'createdAt'], { name: 1 }));
  res.json(students);
});

// GET /api/students/:id
router.get('/:id', async (req, res) => {
  const student = await findOwnStudent(req);
  await student.populate('institution', 'name');
  res.json(student);
});

// POST /api/students - הוספת תלמיד (רמה 0, ניקוד 0, סטטוס "תלמיד")
router.post('/', async (req, res) => {
  const data = pick(req.body, FIELDS);
  await checkInstitution(req.user._id, data.institution);
  if (data.idNumber && (await Teacher.exists({ idNumber: String(data.idNumber).trim() }))) {
    throw new HttpError(409, 'קיים כבר משתמש עם תעודת זהות זו', { idNumber: 'קיים כבר משתמש עם תעודת זהות זו' });
  }
  const student = await Student.create({ ...data, teacher: req.user._id });
  await student.populate('institution', 'name');
  res.status(201).json(student);
});

// PUT /api/students/:id - עריכת פרטי תלמיד
router.put('/:id', async (req, res) => {
  const student = await findOwnStudent(req);
  const data = pick(req.body, FIELDS);
  await checkInstitution(req.user._id, data.institution);
  Object.assign(student, data);
  await student.save();
  await student.populate('institution', 'name');
  res.json(student);
});

// DELETE /api/students/:id
router.delete('/:id', async (req, res) => {
  const student = await findOwnStudent(req);
  await student.deleteOne();
  res.json({ message: 'התלמיד נמחק', id: student._id });
});

export default router;
