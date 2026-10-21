import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { isValidIsraeliId } from '../utils/israeliId.js';

export const ROLES = ['admin', 'teacher', 'student'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'שם הוא שדה חובה'], trim: true, minlength: [2, 'שם קצר מדי'] },
    idNumber: {
      type: String,
      required: [true, 'תעודת זהות היא שדה חובה'],
      unique: true,
      trim: true,
      validate: { validator: isValidIsraeliId, message: 'תעודת זהות לא תקינה' },
    },
    // select: false - הסיסמה לא חוזרת בשאילתות אלא אם מבקשים אותה במפורש
    password: { type: String, required: true, minlength: [4, 'סיסמה חייבת להכיל לפחות 4 תווים'], select: false },
    role: { type: String, enum: ROLES, default: 'student' },
    // לתלמידה: הכיתה שלה. למורה: לא בשימוש
    classroom: { type: String, trim: true },
    // למורה: המקצוע שהיא מלמדת
    subject: { type: String, trim: true },
  },
  { timestamps: true }
);

// הצפנת הסיסמה לפני שמירה
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

// לעולם לא להחזיר סיסמה ללקוח
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model('User', userSchema);
