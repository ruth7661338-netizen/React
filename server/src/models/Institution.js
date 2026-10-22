import mongoose from 'mongoose';

// מוסד לימודים - שייך למורה שהוסיפה אותו
const institutionSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'שם המוסד הוא שדה חובה'], trim: true, minlength: [2, 'שם קצר מדי'] },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  },
  { timestamps: true, versionKey: false }
);

// לאותה מורה לא יהיו שני מוסדות באותו שם
institutionSchema.index({ teacher: 1, name: 1 }, { unique: true });

export default mongoose.model('Institution', institutionSchema);
