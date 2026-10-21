// בדיקת תקינות תעודת זהות ישראלית (ספרת ביקורת)
export function isValidIsraeliId(value) {
  const id = String(value ?? '').trim();
  if (!/^\d{5,9}$/.test(id)) return false;
  const padded = id.padStart(9, '0');
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let n = Number(padded[i]) * ((i % 2) + 1);
    if (n > 9) n -= 9;
    sum += n;
  }
  return sum % 10 === 0;
}
