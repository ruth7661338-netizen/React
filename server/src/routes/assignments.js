import { Router } from 'express';
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import HttpError from '../utils/HttpError.js';
import { pick, searchRegex, parseSort } from '../utils/query.js';
import { authorize } from '../middleware/auth.js';

const router = Router();
const FIELDS = ['title', 'description', 'subject', 'classroom', 'dueDate', 'isPublic'];

// אילו מטלות המשתמש רשאי לראות:
// מנהל - הכל | מורה - המטלות שלה | תלמידה - של הכיתה שלה + הציבוריות
export function visibleAssignmentsFilter(user) {
  if (user.role === 'admin') return {};
  if (user.role === 'teacher') return { teacher: user._id };
  return { $or: [{ classroom: user.classroom }, { isPublic: true }] };
}

async function findOwnAssignment(req) {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) throw new HttpError(404, 'המטלה לא נמצאה');
  if (req.user.role !== 'admin' && !assignment.teacher.equals(req.user._id)) {
    throw new HttpError(403, 'ניתן לערוך רק מטלות שיצרת');
  }
  return assignment;
}

// GET /api/assignments?search=&subject=&classroom=&sort=-dueDate
router.get('/', async (req, res) => {
  const { search, subject, classroom, sort } = req.query;
  const filter = { $and: [visibleAssignmentsFilter(req.user)] };
  if (search) filter.$and.push({ $or: [{ title: searchRegex(search) }, { description: searchRegex(search) }] });
  if (subject) filter.$and.push({ subject });
  if (classroom) filter.$and.push({ classroom });

  const assignments = await Assignment.find(filter)
    .populate('teacher', 'name subject')
    .sort(parseSort(sort, ['dueDate', 'title', 'createdAt', 'subject'], { dueDate: 1 }));
  res.json(assignments);
});

// GET /api/assignments/subjects - רשימת המקצועות הקיימים (לסינון)
router.get('/subjects', async (req, res) => {
  const subjects = await Assignment.distinct('subject', visibleAssignmentsFilter(req.user));
  res.json(subjects.sort());
});

// GET /api/assignments/:id
router.get('/:id', async (req, res) => {
  const assignment = await Assignment.findOne({ _id: req.params.id, ...visibleAssignmentsFilter(req.user) }).populate(
    'teacher',
    'name subject'
  );
  if (!assignment) throw new HttpError(404, 'המטלה לא נמצאה');
  res.json(assignment);
});

// POST /api/assignments - מורה (או מנהל) יוצרת מטלה
router.post('/', authorize('teacher', 'admin'), async (req, res) => {
  const assignment = await Assignment.create({ ...pick(req.body, FIELDS), teacher: req.user._id });
  await assignment.populate('teacher', 'name subject');
  res.status(201).json(assignment);
});

// PUT /api/assignments/:id
router.put('/:id', authorize('teacher', 'admin'), async (req, res) => {
  const assignment = await findOwnAssignment(req);
  Object.assign(assignment, pick(req.body, FIELDS));
  await assignment.save();
  await assignment.populate('teacher', 'name subject');
  res.json(assignment);
});

// DELETE /api/assignments/:id - מוחק גם את העבודות שהוגשו עליה
router.delete('/:id', authorize('teacher', 'admin'), async (req, res) => {
  const assignment = await findOwnAssignment(req);
  await Submission.deleteMany({ assignment: assignment._id });
  await assignment.deleteOne();
  res.json({ message: 'המטלה נמחקה', id: assignment._id });
});

export default router;
