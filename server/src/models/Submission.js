import mongoose from 'mongoose';

// סטטוס העבודה: הוגשה -> נבדקה / הוחזרה לתיקון
export const STATUSES = ['submitted', 'graded', 'returned'];

// עבודה - האובייקט המרכזי: תלמידה מגישה עבודה על מטלה, המורה בודקת ונותנת ציון
const submissionSchema = new mongoose.Schema(
  {
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: [true, 'יש לבחור מטלה'] },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: [true, 'כותרת היא שדה חובה'], trim: true, minlength: [2, 'כותרת קצרה מדי'] },
    content: { type: String, required: [true, 'תוכן העבודה הוא שדה חובה'], trim: true },
    // קישור לקובץ (Google Drive וכד')
    link: {
      type: String,
      trim: true,
      default: '',
      validate: { validator: (v) => !v || /^https?:\/\//.test(v), message: 'קישור חייב להתחיל ב-http:// או https://' },
    },
    status: { type: String, enum: STATUSES, default: 'submitted' },
    grade: { type: Number, min: [0, 'ציון מינימלי 0'], max: [100, 'ציון מקסימלי 100'], default: null },
    feedback: { type: String, trim: true, default: '' },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, versionKey: false }
);

// תלמידה מגישה עבודה אחת לכל מטלה
submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

export default mongoose.model('Submission', submissionSchema);
