import { Router } from 'express';
import Submission from '../models/Submission.js';
import Assignment from '../models/Assignment.js';
import HttpError from '../utils/HttpError.js';
import { pick, searchRegex, parseSort } from '../utils/query.js';
import { authorize } from '../middleware/auth.js';
import { visibleAssignmentsFilter } from './assignments.js';

const router = Router();
const STUDENT_FIELDS = ['title', 'content', 'link'];

const populateAll = [
  { path: 'assignment', select: 'title subject classroom dueDate teacher' },
  { path: 'student', select: 'name idNumber classroom' },
];

// אילו עבודות המשתמש רשאי לראות:
// מנהל - הכל | מורה - עבודות שהוגשו על המטלות שלה | תלמידה - העבודות שלה
async function visibleSubmissionsFilter(user) {
  if (user.role === 'admin') return {};
  if (user.role === 'student') return { student: user._id };
  const ids = await Assignment.find({ teacher: user._id }).distinct('_id');
  return { assignment: { $in: ids } };
}

async function findVisibleSubmission(req) {
  const submission = await Submission.findOne({ _id: req.params.id, ...(await visibleSubmissionsFilter(req.user)) });
  if (!submission) throw new HttpError(404, 'העבודה לא נמצאה');
  return submission;
}

// GET /api/submissions?status=graded&assignment=<id>&search=&sort=-submittedAt
router.get('/', async (req, res) => {
  const { status, assignment, search, sort } = req.query;
  const filter = { $and: [await visibleSubmissionsFilter(req.user)] };
  if (status) filter.$and.push({ status });
  if (assignment) filter.$and.push({ assignment });
  if (search) filter.$and.push({ title: searchRegex(search) });

  const submissions = await Submission.find(filter)
    .populate(populateAll)
    .sort(parseSort(sort, ['submittedAt', 'grade', 'title', 'status'], { submittedAt: -1 }));
  res.json(submissions);
});

// GET /api/submissions/:id
router.get('/:id', async (req, res) => {
  const submission = await findVisibleSubmission(req);
  await submission.populate(populateAll);
  res.json(submission);
});

// POST /api/submissions - תלמידה מגישה עבודה על מטלה
router.post('/', authorize('student'), async (req, res) => {
  const assignmentId = req.body?.assignment;
  if (!assignmentId) throw new HttpError(400, 'יש לבחור מטלה');
  const assignment = await Assignment.findOne({ _id: assignmentId, ...visibleAssignmentsFilter(req.user) });
  if (!assignment) throw new HttpError(404, 'המטלה לא נמצאה');

  const submission = await Submission.create({
    ...pick(req.body, STUDENT_FIELDS),
    assignment: assignment._id,
    student: req.user._id,
  });
  await submission.populate(populateAll);
  res.status(201).json(submission);
});

// PUT /api/submissions/:id - תלמידה עורכת עבודה שלה (רק אם עוד לא נבדקה)
// עריכה של עבודה שהוחזרה לתיקון מגישה אותה מחדש
router.put('/:id', authorize('student'), async (req, res) => {
  const submission = await findVisibleSubmission(req);
  if (submission.status === 'graded') throw new HttpError(400, 'לא ניתן לערוך עבודה שכבר נבדקה');
  Object.assign(submission, pick(req.body, STUDENT_FIELDS), { status: 'submitted', submittedAt: new Date() });
  await submission.save();
  await submission.populate(populateAll);
  res.json(submission);
});

// PATCH /api/submissions/:id/grade - מורה בודקת: ציון, משוב וסטטוס
router.patch('/:id/grade', authorize('teacher', 'admin'), async (req, res) => {
  const submission = await findVisibleSubmission(req);
  const { grade, feedback, status = 'graded' } = req.body || {};
  if (!['graded', 'returned'].includes(status)) throw new HttpError(400, 'סטטוס בדיקה לא תקין');
  if (status === 'graded' && (grade === undefined || grade === null || grade === '')) {
    throw new HttpError(400, 'יש להזין ציון');
  }
  submission.status = status;
  if (grade !== undefined) submission.grade = grade === '' ? null : grade;
  if (feedback !== undefined) submission.feedback = feedback;
  await submission.save();
  await submission.populate(populateAll);
  res.json(submission);
});

// DELETE /api/submissions/:id - תלמידה (לפני בדיקה) או מנהל
router.delete('/:id', authorize('student', 'admin'), async (req, res) => {
  const submission = await findVisibleSubmission(req);
  if (req.user.role === 'student' && submission.status === 'graded') {
    throw new HttpError(400, 'לא ניתן למחוק עבודה שכבר נבדקה');
  }
  await submission.deleteOne();
  res.json({ message: 'העבודה נמחקה', id: submission._id });
});

export default router;
