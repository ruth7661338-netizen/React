import Game from '../models/Game.js';

export const DEFAULT_GAMES = [
  { name: 'חיבור עד 10', level: 0, operation: 'addition', startNumber: 0, endNumber: 5 },
  { name: 'לוח הכפל של 1-3', level: 0, operation: 'multiplication', startNumber: 1, endNumber: 3 },
  { name: 'חיבור עד 20', level: 1, operation: 'addition', startNumber: 1, endNumber: 10 },
  { name: 'כפל עד 25', level: 1, operation: 'multiplication', startNumber: 1, endNumber: 5 },
  { name: 'חיבור עד 100', level: 2, operation: 'addition', startNumber: 10, endNumber: 50 },
  { name: 'לוח הכפל המלא', level: 2, operation: 'multiplication', startNumber: 1, endNumber: 10 },
];

export async function ensureDefaultGames() {
  for (const game of DEFAULT_GAMES) {
    const exists = await Game.exists({ name: game.name, level: game.level, operation: game.operation });
    if (!exists) await Game.create(game);
  }
}