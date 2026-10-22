// מילוי מסד הנתונים בנתוני דוגמה: npm run seed
// שימו לב - מוחק את כל הנתונים הקיימים!
import 'dotenv/config';
import mongoose from 'mongoose';
import Teacher from './models/Teacher.js';
import Student from './models/Student.js';
import Institution from './models/Institution.js';
import Game from './models/Game.js';

await mongoose.connect(process.env.MONGO_URI);
await Promise.all([Teacher.deleteMany({}), Student.deleteMany({}), Institution.deleteMany({}), Game.deleteMany({})]);

const teacher = await Teacher.create({ name: 'רחל לוי', idNumber: '100000009', age: 35 });

const [school1, school2] = await Institution.create([
  { name: 'בית יעקב', teacher: teacher._id },
  { name: 'תלמוד תורה', teacher: teacher._id },
]);

await Student.create([
  { name: 'מיכל אברהם', idNumber: '300000007', age: 7, institution: school1._id, teacher: teacher._id },
  { name: 'נועה ישראלי', idNumber: '300000015', age: 9, institution: school1._id, teacher: teacher._id, level: 1, score: 140 },
  { name: 'יוסי דוד', idNumber: '300000023', age: 11, institution: school2._id, teacher: teacher._id, level: 2, score: 230 },
]);

// 6 משחקים - שניים לכל רמה
await Game.create([
  { name: 'חיבור עד 10', level: 0, operation: 'addition', startNumber: 0, endNumber: 5 },
  { name: 'לוח הכפל של 1-3', level: 0, operation: 'multiplication', startNumber: 1, endNumber: 3 },
  { name: 'חיבור עד 20', level: 1, operation: 'addition', startNumber: 1, endNumber: 10 },
  { name: 'כפל עד 25', level: 1, operation: 'multiplication', startNumber: 1, endNumber: 5 },
  { name: 'חיבור עד 100', level: 2, operation: 'addition', startNumber: 10, endNumber: 50 },
  { name: 'לוח הכפל המלא', level: 2, operation: 'multiplication', startNumber: 1, endNumber: 10 },
]);

console.log('Seed completed.');
await mongoose.disconnect();
