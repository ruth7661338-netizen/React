// מילוי מסד הנתונים בנתוני דוגמה: npm run seed
// שימו לב - מוחק את כל הנתונים הקיימים!
import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import Assignment from './models/Assignment.js';
import Submission from './models/Submission.js';

await mongoose.connect(process.env.MONGO_URI);
await Promise.all([User.deleteMany({}), Assignment.deleteMany({}), Submission.deleteMany({})]);

const daysFromNow = (d) => new Date(Date.now() + d * 24 * 60 * 60 * 1000);

// User.create ולא insertMany - כדי שהסיסמאות יוצפנו ב-pre('save')
const [, teacher1, teacher2, student1, student2, student3] = await User.create([
  { name: 'מנהלת המערכת', idNumber: '000000018', password: '1234', role: 'admin' },
  { name: 'רחל לוי', idNumber: '100000009', password: '1234', role: 'teacher', subject: 'מתמטיקה' },
  { name: 'שרה כהן', idNumber: '200000008', password: '1234', role: 'teacher', subject: 'אנגלית' },
  { name: 'מיכל אברהם', idNumber: '300000007', password: '1234', role: 'student', classroom: 'ח1' },
  { name: 'נועה ישראלי', idNumber: '300000015', password: '1234', role: 'student', classroom: 'ח1' },
  { name: 'אסתר דוד', idNumber: '300000023', password: '1234', role: 'student', classroom: 'ח2' },
]);

const [a1, a2, a3] = await Assignment.create([
  { title: 'תרגילי שברים', description: 'לפתור את תרגילים 1-20 בעמוד 45', subject: 'מתמטיקה', classroom: 'ח1', dueDate: daysFromNow(7), teacher: teacher1._id },
  { title: 'גאומטריה - משולשים', description: 'דף עבודה על משולשים חופפים', subject: 'מתמטיקה', classroom: 'ח2', dueDate: daysFromNow(10), teacher: teacher1._id },
  { title: 'חיבור באנגלית', description: 'Write 150 words about your summer vacation', subject: 'אנגלית', classroom: 'ח1', dueDate: daysFromNow(3), isPublic: true, teacher: teacher2._id },
]);

await Submission.create([
  { assignment: a1._id, student: student1._id, title: 'פתרון שברים', content: 'כל התרגילים פתורים בקובץ המצורף', link: 'https://drive.google.com/example1', status: 'graded', grade: 95, feedback: 'עבודה מצוינת!' },
  { assignment: a1._id, student: student2._id, title: 'שברים - נועה', content: 'פתרתי את תרגילים 1-15', status: 'returned', feedback: 'חסרים תרגילים 16-20' },
  { assignment: a3._id, student: student1._id, title: 'My summer', content: 'This summer I went to the north with my family...' },
  { assignment: a2._id, student: student3._id, title: 'משולשים', content: 'דף העבודה מצורף', link: 'https://drive.google.com/example2' },
  { assignment: a3._id, student: student3._id, title: 'Summer vacation', content: 'In my vacation I read many books...' },
]);

console.log('Seed completed. All passwords: 1234');
await mongoose.disconnect();
