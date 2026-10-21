import mongoose from 'mongoose';

// מטלה - נוצרת ע"י מורה, התלמידות מגישות עליה עבודות
const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'שם המטלה הוא שדה חובה'], trim: true, minlength: [2, 'שם קצר מדי'] },
    description: { type: String, trim: true, default: '' },
    subject: { type: String, required: [true, 'מקצוע הוא שדה חובה'], trim: true },
    // הכיתה שהמטלה מיועדת לה
    classroom: { type: String, required: [true, 'כיתה היא שדה חובה'], trim: true },
    dueDate: { type: Date, required: [true, 'תאריך הגשה הוא שדה חובה'] },
    // מטלה ציבורית - כל התלמידות רואות אותה, לא רק הכיתה
    isPublic: { type: Boolean, default: false },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model('Assignment', assignmentSchema);
