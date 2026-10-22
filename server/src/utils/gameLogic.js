// חוקי המשחק - במקום אחד כדי שיהיה קל לשנות
import { POINTS_PER_LEVEL } from '../models/Student.js';

export const POINTS_PER_CORRECT_ANSWER = 10;

// מספר התרגילים במשחק לפי גיל התלמיד
export function exercisesCountForAge(age) {
  if (age <= 7) return 5;
  if (age <= 10) return 8;
  return 10;
}

export function calculate(operation, a, b) {
  return operation === 'multiplication' ? a * b : a + b;
}

const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// יוצר תרגילים אקראיים בטווח המספרים של המשחק
export function generateExercises(game, count) {
  return Array.from({ length: count }, () => ({
    a: randomBetween(game.startNumber, game.endNumber),
    b: randomBetween(game.startNumber, game.endNumber),
    operator: game.operation === 'multiplication' ? '×' : '+',
  }));
}

// הרמה נגזרת מהניקוד: כל 100 נקודות = רמה אחת
export function levelForScore(score) {
  return Math.floor(score / POINTS_PER_LEVEL);
}
