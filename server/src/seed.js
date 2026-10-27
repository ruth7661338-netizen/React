// מילוי מסד הנתונים בנתוני דוגמה: npm run seed
// שימו לב - מוחק את כל הנתונים הקיימים!
import 'dotenv/config';
import mongoose from 'mongoose';
import Teacher from './models/Teacher.js';
import Student from './models/Student.js';
import Institution from './models/Institution.js';
import Game from './models/Game.js';
import { DEFAULT_GAMES } from './utils/defaultGames.js';

await mongoose.connect(process.env.MONGO_URI);
await Promise.all([Teacher.deleteMany({}), Student.deleteMany({}), Institution.deleteMany({}), Game.deleteMany({})]);

// Teacher.create ולא insertMany - כדי שהסיסמה תוצפן ב-pre('save')
const teacher = await Teacher.create({ name: 'רחל לוי', idNumber: '100000009', age: 35, password: '1234' });

const [school1, school2] = await Institution.create([
  { name: 'בית יעקב', teacher: teacher._id },
  { name: 'תלמוד תורה', teacher: teacher._id },
]);

await Student.create([
  { name: 'מיכל אברהם', idNumber: '300000007', age: 7, institution: school1._id, teacher: teacher._id },
  { name: 'נועה ישראלי', idNumber: '300000015', age: 9, institution: school1._id, teacher: teacher._id, level: 1, score: 140 },
  { name: 'יוסי דוד', idNumber: '300000023', age: 11, institution: school2._id, teacher: teacher._id, level: 2, score: 230 },
]);

await Game.create(DEFAULT_GAMES);

console.log('Seed completed.');
await mongoose.disconnect();
