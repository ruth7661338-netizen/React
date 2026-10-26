// חוקי המשחק - במקום אחד כדי שיהיה קל לשנות
import { POINTS_PER_LEVEL } from '../models/Student.js';

export const POINTS_PER_CORRECT_ANSWER = 10;

// מספר התרגילים במשחק לפי גיל התלמיד
export function exercisesCountForAge(age) {
  if (age <= 7) return 5;
  if (age <= 10) return 8;
  return 10;
}

export function exercisesCountForGame(age, game) {
  const valuesCount = game.endNumber - game.startNumber + 1;
  const uniquePairCount = (valuesCount * (valuesCount + 1)) / 2;
  return Math.min(exercisesCountForAge(age), uniquePairCount);
}

export function calculate(operation, a, b) {
  return operation === 'multiplication' ? a * b : a + b;
}

// שולף צמדי מספרים אקראיים ללא חזרה בתוך אותו משחק
export function generateExercises(game, count) {
  const exercises = [];
  for (let a = game.startNumber; a <= game.endNumber; a += 1) {
    for (let b = a; b <= game.endNumber; b += 1) {
      exercises.push({
        a,
        b,
        operator: game.operation === 'multiplication' ? '×' : '+',
      });
    }
  }

  const selectedCount = Math.min(count, exercises.length);
  for (let index = 0; index < selectedCount; index += 1) {
    const randomIndex = index + Math.floor(Math.random() * (exercises.length - index));
    [exercises[index], exercises[randomIndex]] = [exercises[randomIndex], exercises[index]];
  }

  return exercises.slice(0, selectedCount);
}

// הרמה נגזרת מהניקוד: כל 100 נקודות = רמה אחת
export function levelForScore(score) {
  return Math.floor(score / POINTS_PER_LEVEL);
}
