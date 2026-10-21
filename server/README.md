# שרת - מערכת הגשת עבודות

Node.js + Express + MongoDB (Mongoose), התחברות עם JWT.

## הרצה מקומית

```bash
npm install
cp .env.example .env      # ולמלא ערכים
npm run seed              # נתוני דוגמה (מוחק את הקיים!)
npm run dev               # http://localhost:5000
```

### משתמשי דוגמה (סיסמה לכולם: `1234`)

| תפקיד | שם | ת"ז | פרטים |
|---|---|---|---|
| מנהל | מנהלת המערכת | 000000018 | |
| מורה | רחל לוי | 100000009 | מתמטיקה |
| מורה | שרה כהן | 200000008 | אנגלית |
| תלמידה | מיכל אברהם | 300000007 | כיתה ח1 |
| תלמידה | נועה ישראלי | 300000015 | כיתה ח1 |
| תלמידה | אסתר דוד | 300000023 | כיתה ח2 |

---

## מבנה מסד הנתונים

**User - משתמש**
| שדה | סוג | הערות |
|---|---|---|
| name | String | חובה |
| idNumber | String | חובה, ייחודי, נבדקת ספרת ביקורת של ת"ז |
| password | String | נשמרת מוצפנת (bcrypt), לא חוזרת אף פעם ללקוח |
| role | `admin` / `teacher` / `student` | |
| classroom | String | לתלמידה |
| subject | String | למורה |

**Assignment - מטלה** (נוצרת ע"י מורה)
| שדה | סוג |
|---|---|
| title | String, חובה |
| description | String |
| subject | String, חובה (מקצוע) |
| classroom | String, חובה (לאיזו כיתה) |
| dueDate | Date, חובה |
| isPublic | Boolean - מטלה ציבורית שכל התלמידות רואות |
| teacher | הפניה ל-User |

**Submission - עבודה מוגשת** (האובייקט המרכזי)
| שדה | סוג |
|---|---|
| assignment | הפניה ל-Assignment |
| student | הפניה ל-User |
| title | String, חובה |
| content | String, חובה |
| link | String - קישור לקובץ, חייב להתחיל ב-http |
| status | `submitted` (הוגשה) / `graded` (נבדקה) / `returned` (הוחזרה לתיקון) |
| grade | Number 0-100 |
| feedback | String - משוב המורה |
| submittedAt | Date |

תלמידה יכולה להגיש עבודה אחת לכל מטלה.

## הרשאות

| | מנהל | מורה | תלמידה |
|---|---|---|---|
| מטלות - צפייה | הכל | שיצרה | של הכיתה שלה + ציבוריות |
| מטלות - הוספה/עריכה/מחיקה | ✓ | רק שלה | ✗ |
| עבודות - צפייה | הכל | שהוגשו על המטלות שלה | שלה בלבד |
| עבודות - הגשה/עריכה | ✗ | ✗ | שלה, כל עוד לא נבדקה |
| עבודות - בדיקה וציון | ✓ | על המטלות שלה | ✗ |
| משתמשים - צפייה | הכל | תלמידות בלבד | ✗ |
| משתמשים - הוספה/עריכה/מחיקה | ✓ | ✗ | ✗ |

## איך עובדת ההתחברות

1. הקליינט שולח `POST /api/auth/login` עם ת"ז וסיסמה.
2. השרת מוצא את המשתמש, משווה את הסיסמה למוצפנת (bcrypt), ומחזיר **token** (JWT) ואת פרטי המשתמש.
3. הקליינט שומר את הטוקן (למשל ב-localStorage) ושולח אותו בכל בקשה בכותרת:
   `Authorization: Bearer <token>`
4. ה-middleware `authenticate` מאמת את הטוקן ושם את המשתמש ב-`req.user`;
   `authorize('admin', 'teacher')` בודק את התפקיד. בנוסף, כל ראוט מסנן את הנתונים לפי התפקיד (טבלת ההרשאות למעלה).
5. אחרי רענון דף הקליינט קורא ל-`GET /api/auth/me` כדי לדעת מי מחובר.

## API

כל הנתיבים (חוץ מ-login/register) דורשים טוקן.
שגיאות חוזרות תמיד בפורמט `{ "message": "...", "errors": { "שדה": "הודעה" } }`
(`errors` מופיע בשגיאות ולידציה - נוח להצגה ליד כל שדה בטופס).

קודי סטטוס: `400` נתונים לא תקינים, `401` לא מחובר, `403` אין הרשאה, `404` לא נמצא, `409` כפילות.

### Auth
| Method | נתיב | שולחים | מקבלים |
|---|---|---|---|
| POST | `/api/auth/login` | `{ idNumber, password, role? }` | `{ token, user }` |
| POST | `/api/auth/register` | `{ name, idNumber, password, classroom }` | `{ token, user }` (נרשמת כתלמידה) |
| GET | `/api/auth/me` | - | `{ user }` |

`role` בהתחברות אופציונלי - אם מסך הכניסה הוא "כניסת מורה", שולחים `role: "teacher"` והשרת יחזיר 403 אם המשתמש אינו מורה.

### מטלות - `/api/assignments`
| Method | נתיב | שולחים | מקבלים |
|---|---|---|---|
| GET | `/` | query: `search`, `subject`, `classroom`, `sort` | מערך מטלות |
| GET | `/subjects` | - | מערך מקצועות (לשדה סינון) |
| GET | `/:id` | - | מטלה |
| POST | `/` | `{ title, description, subject, classroom, dueDate, isPublic }` | המטלה שנוצרה |
| PUT | `/:id` | אותם שדות (חלקי) | המטלה המעודכנת |
| DELETE | `/:id` | - | `{ message, id }` (מוחק גם את העבודות שהוגשו עליה) |

`sort`: `dueDate`, `title`, `createdAt`, `subject`, עם מינוס למיון יורד (`-dueDate`).

### עבודות - `/api/submissions`
| Method | נתיב | שולחים | מקבלים |
|---|---|---|---|
| GET | `/` | query: `status`, `assignment`, `search`, `sort` | מערך עבודות (עם פרטי מטלה ותלמידה) |
| GET | `/:id` | - | עבודה |
| POST | `/` | `{ assignment, title, content, link? }` | העבודה שנוצרה |
| PUT | `/:id` | `{ title, content, link }` | העבודה (חוזרת לסטטוס "הוגשה") |
| PATCH | `/:id/grade` | `{ grade, feedback, status: "graded" \| "returned" }` | העבודה |
| DELETE | `/:id` | - | `{ message, id }` |

`sort`: `submittedAt`, `grade`, `title`, `status`.

### משתמשים - `/api/users`
| Method | נתיב | שולחים | מקבלים |
|---|---|---|---|
| GET | `/` | query: `role`, `classroom`, `search`, `sort` | מערך משתמשים |
| GET | `/classrooms` | - | מערך כיתות (לשדה בחירה) |
| POST | `/` | `{ name, idNumber, password, role, classroom?, subject? }` | המשתמש |
| PUT | `/:id` | אותם שדות (סיסמה רק אם רוצים לשנות) | המשתמש |
| DELETE | `/:id` | - | `{ message, id }` |

---

## העלאה לענן

### מסד נתונים - MongoDB Atlas (חינם)
1. ליצור Cluster חינמי (M0) ב-mongodb.com/atlas.
2. Database Access: ליצור משתמש וסיסמה.
3. Network Access: להוסיף `0.0.0.0/0` (כדי ש-Render יוכל להתחבר).
4. Connect → Drivers: להעתיק את ה-connection string ולהוסיף שם DB, למשל
   `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/assignments`

### שרת - Render
1. New → **Web Service**, לחבר את ריפו הגיט.
2. Root Directory: `server` · Build: `npm install` · Start: `npm start`
3. Environment Variables: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` (כתובת הקליינט ב-Render).
4. למילוי נתוני דוגמה: להריץ מקומית `npm run seed` כש-`MONGO_URI` ב-.env מצביע ל-Atlas.

בקליינט - כתובת השרת במשתנה סביבה, למשל `VITE_API_URL=https://your-server.onrender.com/api`.
