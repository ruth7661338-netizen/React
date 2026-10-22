// מטפל מרכזי בשגיאות - כל שגיאה מוחזרת ללקוח בפורמט אחיד:
// { message: string, errors?: { [field]: string } }
export function notFound(req, res) {
  res.status(404).json({ message: `הנתיב ${req.method} ${req.originalUrl} לא קיים` });
}

const DUPLICATE_MESSAGES = {
  idNumber: 'קיים כבר משתמש עם תעודת זהות זו',
  name: 'מוסד בשם זה כבר קיים',
};

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  // שגיאת ולידציה של Mongoose - מחזירים הודעה לכל שדה
  if (err.name === 'ValidationError') {
    const errors = Object.fromEntries(
      Object.entries(err.errors).map(([field, e]) => [field, e.name === 'CastError' ? 'ערך לא תקין' : e.message])
    );
    return res.status(400).json({ message: 'הנתונים שנשלחו לא תקינים', errors });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: `ערך לא תקין בשדה ${err.path}` });
  }
  // ערך כפול בשדה ייחודי
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {}).find((k) => DUPLICATE_MESSAGES[k]);
    const message = DUPLICATE_MESSAGES[field] || 'הרשומה כבר קיימת';
    return res.status(409).json({ message, errors: field ? { [field]: message } : undefined });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'גוף הבקשה אינו JSON תקין' });
  }

  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({ message: status === 500 ? 'שגיאת שרת' : err.message, errors: err.errors });
}
