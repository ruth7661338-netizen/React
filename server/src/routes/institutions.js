import { Router } from 'express';
import Institution from '../models/Institution.js';
import Student from '../models/Student.js';
import HttpError from '../utils/HttpError.js';
import { authorize } from '../middleware/auth.js';

const router = Router();
router.use(authorize('teacher'));

// GET /api/institutions - המוסדות של המורה המחוברת (לרשימת הבחירה בהוספת תלמיד)
router.get('/', async (req, res) => {
  const institutions = await Institution.find({ teacher: req.user._id }).sort({ name: 1 });
  res.json(institutions);
});

// POST /api/institutions - הוספת מוסד
router.post('/', async (req, res) => {
  const institution = await Institution.create({ name: req.body?.name, teacher: req.user._id });
  res.status(201).json(institution);
});

// DELETE /api/institutions/:id - רק אם אין בו תלמידים
router.delete('/:id', async (req, res) => {
  const institution = await Institution.findOne({ _id: req.params.id, teacher: req.user._id });
  if (!institution) throw new HttpError(404, 'המוסד לא נמצא');
  if (await Student.exists({ institution: institution._id })) {
    throw new HttpError(400, 'לא ניתן למחוק מוסד שיש בו תלמידים');
  }
  await institution.deleteOne();
  res.json({ message: 'המוסד נמחק', id: institution._id });
});

export default router;
