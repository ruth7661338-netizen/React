// עזרים לחיפוש ומיון מתוך ה-query string

// מחזיר RegExp לחיפוש חלקי ללא רגישות לאותיות (עם escape לתווים מיוחדים)
export function searchRegex(text) {
  const escaped = String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(escaped, 'i');
}

// sort=dueDate או sort=-dueDate (מינוס = יורד). מאפשר רק שדות מהרשימה
export function parseSort(sort, allowed, fallback) {
  if (!sort) return fallback;
  const field = String(sort).replace(/^-/, '');
  if (!allowed.includes(field)) return fallback;
  return { [field]: String(sort).startsWith('-') ? -1 : 1 };
}

// מחזיר רק את השדות המותרים מתוך גוף הבקשה (מונע שליחת שדות כמו role / teacher)
export function pick(obj, keys) {
  return Object.fromEntries(keys.filter((k) => obj?.[k] !== undefined).map((k) => [k, obj[k]]));
}
