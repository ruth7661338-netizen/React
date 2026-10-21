import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import HttpError from '../utils/HttpError.js';

export function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// בודק שנשלח טוקן תקין בכותרת Authorization: Bearer <token>
// ושם את המשתמש המחובר ב-req.user
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

  const user = await User.findById(payload.id);
  if (!user) throw new HttpError(401, 'המשתמש לא קיים');
  req.user = user;
  next();
}

// מאפשר גישה רק לתפקידים שהועברו, לדוגמה: authorize('admin', 'teacher')
export function authorize(...roles) {
  return (req, _res, next) => {
    if (!roles.includes(req.user.role)) throw new HttpError(403, 'אין לך הרשאה לפעולה זו');
    next();
  };
}
