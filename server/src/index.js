import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';
import { ensureDefaultGames } from './utils/defaultGames.js';

const { MONGO_URI, JWT_SECRET, TEACHER_CODE, PORT = 5000 } = process.env;

if (!MONGO_URI || !JWT_SECRET || !TEACHER_CODE) {
  console.error('חסרים משתני סביבה MONGO_URI / JWT_SECRET / TEACHER_CODE (ראו .env.example)');
  process.exit(1);
}

await mongoose.connect(MONGO_URI);
console.log('Connected to MongoDB');
await ensureDefaultGames();
console.log('Default games are ready');

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
