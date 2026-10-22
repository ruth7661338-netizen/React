import mongoose from 'mongoose';

export const OPERATIONS = ['addition', 'multiplication'];

// משחק חשבון: תרגילי חיבור או כפל על מספרים בטווח startNumber..endNumber
const gameSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'שם המשחק הוא שדה חובה'], trim: true },
    level: { type: Number, required: true, min: 0 },
    operation: { type: String, enum: OPERATIONS, required: true },
    startNumber: { type: Number, required: true, min: 0 },
    endNumber: {
      type: Number,
      required: true,
      validate: {
        validator(v) {
          return v >= this.startNumber;
        },
        message: 'מספר הסיום חייב להיות גדול או שווה למספר ההתחלה',
      },
    },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model('Game', gameSchema);
