import { Router } from 'express';
import Game from '../models/Game.js';
import HttpError from '../utils/HttpError.js';
import { authorize } from '../middleware/auth.js';
import {
  POINTS_PER_CORRECT_ANSWER,
  exercisesCountForAge,
  generateExercises,
  calculate,
  levelForScore,
} from '../utils/gameLogic.js';

const router = Router();

// תלמיד רואה רק משחקים ברמה שלו ומתחת. מורה רואה את כולם
function visibleGamesFilter(user) {
  return user.status === 'student' ? { level: { $lte: user.level } } : {};
}

async function findVisibleGame(req) {
  const game = await Game.findOne({ _id: req.params.id, ...visibleGamesFilter(req.user) });
  if (!game) throw new HttpError(404, 'המשחק לא נמצא או שעדיין לא הגעת לרמה שלו');
  return game;
}

// GET /api/games - המשחקים המתאימים לתלמיד
// לכל משחק מצורף exercisesCount - מספר התרגילים לפי גיל התלמיד
router.get('/', async (req, res) => {
  const games = await Game.find(visibleGamesFilter(req.user)).sort({ level: 1, name: 1 });
  const count = req.user.status === 'student' ? exercisesCountForAge(req.user.age) : null;
  res.json(games.map((g) => ({ ...g.toJSON(), exercisesCount: count })));
});

// GET /api/games/:id/play - התחלת משחק: פרטי המשחק + רשימת תרגילים (בלי התשובות)
router.get('/:id/play', authorize('student'), async (req, res) => {
  const game = await findVisibleGame(req);
  const exercises = generateExercises(game, exercisesCountForAge(req.user.age));
  res.json({ game, exercises });
});

// POST /api/games/:id/finish - סיום משחק
// שולחים: { answers: [{ a, b, answer }, ...] }
// השרת בודק כל תשובה, מוסיף ניקוד לתלמיד ומעדכן את הרמה
router.post('/:id/finish', authorize('student'), async (req, res) => {
  const game = await findVisibleGame(req);
  const student = req.user;
  const answers = req.body?.answers;
  const expected = exercisesCountForAge(student.age);

  if (!Array.isArray(answers) || answers.length !== expected) {
    throw new HttpError(400, `יש לשלוח ${expected} תשובות`);
  }
  const inRange = (n) => Number.isInteger(n) && n >= game.startNumber && n <= game.endNumber;
  if (!answers.every((x) => inRange(x?.a) && inRange(x?.b))) {
    throw new HttpError(400, 'התרגילים שנשלחו לא מתאימים למשחק');
  }

  const results = answers.map(({ a, b, answer }) => {
    const correctAnswer = calculate(game.operation, a, b);
    return { a, b, answer, correctAnswer, isCorrect: Number(answer) === correctAnswer };
  });
  const correctCount = results.filter((r) => r.isCorrect).length;
  const pointsEarned = correctCount * POINTS_PER_CORRECT_ANSWER;

  const previousLevel = student.level;
  student.score += pointsEarned;
  student.level = Math.max(student.level, levelForScore(student.score));
  await student.save();

  res.json({
    correctCount,
    total: answers.length,
    pointsEarned,
    score: student.score,
    level: student.level,
    levelUp: student.level > previousLevel,
    results,
  });
});

export default router;
