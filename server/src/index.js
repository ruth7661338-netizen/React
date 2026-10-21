import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';

const { MONGO_URI, JWT_SECRET, PORT = 5000 } = process.env;

if (!MONGO_URI || !JWT_SECRET) {
  console.error('חסרים משתני סביבה MONGO_URI / JWT_SECRET (ראו .env.example)');
  process.exit(1);
}

await mongoose.connect(MONGO_URI);
console.log('Connected to MongoDB');

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
