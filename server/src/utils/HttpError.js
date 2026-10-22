// שגיאה עם קוד HTTP - נזרקת מהראוטים ונתפסת ב-errorHandler
// errors (אופציונלי) - הודעה לכל שדה, כמו בשגיאות ולידציה
export default class HttpError extends Error {
  constructor(status, message, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}
