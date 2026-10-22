import mongoose from 'mongoose';
import { isValidIsraeliId } from '../utils/israeliId.js';

export const POINTS_PER_LEVEL = 100;

// תלמיד - נוסף ע"י המורה. רמה וניקוד מתחילים ב-0 ומתעדכנים בסיום משחק
const studentSchema = new mongoose.Schema(
  {
    idNumber: {
      type: String,
      required: [true, 'תעודת זהות היא שדה חובה'],
      unique: true,
      trim: true,
      validate: { validator: isValidIsraeliId, message: 'תעודת זהות לא תקינה' },
    },
    name: { type: String, required: [true, 'שם הוא שדה חובה'], trim: true, minlength: [2, 'שם קצר מדי'] },
    age: {
      type: Number,
      required: [true, 'גיל הוא שדה חובה'],
      min: [4, 'גיל מינימלי 4'],
      max: [18, 'גיל מקסימלי 18'],
    },
    institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: [true, 'יש לבחור מוסד לימודים'] },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    level: { type: Number, default: 0, min: 0 },
    score: { type: Number, default: 0, min: 0 },
    status: { type: String, default: 'student', immutable: true },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model('Student', studentSchema);
