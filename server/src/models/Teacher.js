import mongoose from 'mongoose';
import { isValidIsraeliId } from '../utils/israeliId.js';

// מורה - נרשמת בעצמה (עם סיסמת המערכת), מוסיפה מוסדות ותלמידים
const teacherSchema = new mongoose.Schema(
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
      min: [18, 'גיל מורה חייב להיות לפחות 18'],
      max: [120, 'גיל לא תקין'],
    },
    status: { type: String, default: 'teacher', immutable: true },
  },
  {
    timestamps: true,
    versionKey: false,
    id: false,
    toJSON: { virtuals: true },
  }
);

// רשימת המוסדות והתלמידים של המורה - נשמרים במוסד/בתלמיד (שדה teacher) ונשלפים מכאן
teacherSchema.virtual('institutions', { ref: 'Institution', localField: '_id', foreignField: 'teacher' });
teacherSchema.virtual('students', { ref: 'Student', localField: '_id', foreignField: 'teacher' });

export default mongoose.model('Teacher', teacherSchema);
