import jwt from 'jsonwebtoken';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';
import HttpError from '../utils/HttpError.js';

const MODELS = { teacher: Teacher, student: Student };

export function signToken(user) {
  return jwt.sign({ id: user._id, role: user.status }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// בודק שנשלח טוקן תקין בכותרת Authorization: Bearer <token>
// ושם את המשתמש המחובר ב-req.user (מורה או תלמיד)
export async function authenticate(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new HttpError(401, 'יש להתחבר למערכת');

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new HttpError(401, 'החיבור פג תוקף, יש להתחבר מחדש');
  }

  const Model = MODELS[payload.role];
  const user = Model && (await Model.findById(payload.id));
  if (!user) throw new HttpError(401, 'המשתמש לא קיים');
  req.user = user;
  next();
}

// מאפשר גישה רק לסטטוסים שהועברו, לדוגמה: authorize('teacher')
export function authorize(...statuses) {
  return (req, _res, next) => {
    if (!statuses.includes(req.user.status)) throw new HttpError(403, 'אין לך הרשאה לפעולה זו');
    next();
  };
}
