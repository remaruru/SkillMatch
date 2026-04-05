# 🚀 SkillMatch — AI-Powered Internship Matching System

![SkillMatch](https://img.shields.io/badge/Status-In%20Development-blue)
![Stack](https://img.shields.io/badge/Stack-React%20%2B%20Node%20%2B%20Prisma%20%2B%20MySQL-indigo)
![License](https://img.shields.io/badge/License-MIT-green)

SkillMatch is an AI-powered internship matching platform that connects students with employers using **skill-based matching**, **PDF resume parsing**, and **Google Gemini LLM skill extraction**. Built as an AppDev capstone project.

---

## ✨ Features

### 🎓 For Students (Applicants)
- Upload a **PDF resume** for automatic skill extraction via Google Gemini
- View **color-coded AI match scores** (0–100%) for every internship
- Track applications with full history
- Secure JWT authentication with role-based access

### 🏢 For Employers
- Post internship listings with required skills
- View applicants ranked by AI match score
- See **matched vs. missing skills** per applicant (AI Match Analysis)
- Full applicant tracking history with status updates

### 🔒 For Admins
- Approve / reject student & employer accounts
- **Document filter** — filter students by: with/without Resume, with/without School ID, complete/incomplete docs
- System-wide analytics

---

## 🛠 Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | React 19 + Vite + TypeScript + TailwindCSS v4  |
| Backend    | Node.js + Express + TypeScript                  |
| Database   | MySQL via XAMPP + Prisma ORM                    |
| Auth       | JWT + Bcrypt                                    |
| AI / LLM   | Google Gemini (`@google/generative-ai`)         |
| PDF Parser | `pdf-parse`                                     |

---

## ⚡ Quick Start (After Cloning)

### Prerequisites
- **Node.js** v18+ — [Download](https://nodejs.org)
- **XAMPP** (for MySQL) — [Download](https://www.apachefriends.org) — or any MySQL server
- **Git**

---

### 1. Clone the Repository

```bash
git clone https://github.com/remaruru/SkillMatch.git
cd SkillMatch
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

**Configure environment variables:**
```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
DATABASE_URL="mysql://root:@localhost:3306/skillmatch"
PORT=5000
JWT_SECRET="any-random-string-here"
GEMINI_API_KEY=""   # Optional — leave blank to disable AI extraction
```

> **Database note:** Make sure XAMPP is running and MySQL is active on port 3306 before the next step.

**Initialize the database and seed default accounts:**
```bash
npx prisma db push
npx tsx prisma/seed.ts
```

**Start the backend server (port 5000):**
```bash
npm run dev
```

---

### 3. Frontend Setup

Open a **new terminal window**:

```bash
cd frontend
npm install
npm run dev
```

The frontend will run at **http://localhost:5173**

---

## 🧪 Default Test Accounts

After running the seed (`npx tsx prisma/seed.ts`):

| Role      | Email                  | Password      |
|-----------|------------------------|---------------|
| Admin     | `admin@skillmatch.com` | `password123` |
| Applicant | `john@student.edu`     | `password123` |
| Employer  | `hr@techcorp.com`      | `password123` |

---

## 🤖 AI Resume Extraction

SkillMatch uses **Google Gemini** to extract skills from uploaded PDF resumes.

### How it works:
1. Student uploads a **text-based PDF** resume
2. `pdf-parse` extracts raw text
3. Gemini processes the text → returns a clean JSON skill array
4. Skills are saved to the student profile
5. Match scores are recalculated automatically

### Fallback behavior:
If `GEMINI_API_KEY` is **not set** or is empty:
- The system will still accept resume uploads
- Text extraction still runs (pdf-parse works without Gemini)
- Skill extraction will be **skipped gracefully** — no crash, no error to the user
- Match scores continue working based on manually entered skills

> **Scanned PDFs / image-based PDFs** are rejected with a clear error:
> *"This PDF could not be read as text. Please upload a text-based PDF resume."*

---

## 🔑 Environment Variables Reference

| Variable         | Required | Description                                              |
|------------------|----------|----------------------------------------------------------|
| `DATABASE_URL`   | ✅ Yes   | Prisma MySQL connection string                           |
| `PORT`           | ✅ Yes   | Backend server port (default: 5000)                      |
| `JWT_SECRET`     | ✅ Yes   | Secret key for signing JWT tokens (any long random string)|
| `GEMINI_API_KEY` | ⚠️ Optional | Google Gemini API key for AI skill extraction       |

---

## 📁 Project Structure

```
SkillMatch/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   └── seed.ts             # Default account seeder
│   ├── src/
│   │   ├── controllers/        # Route handlers
│   │   ├── middleware/         # Auth & role guards
│   │   ├── routes/             # Express routers
│   │   ├── services/
│   │   │   ├── resumeParser.service.ts   # PDF text extraction
│   │   │   ├── llm.service.ts            # Gemini skill extraction
│   │   │   └── matchingService.ts        # Match score engine
│   │   └── utils/
│   │       └── uploadHelpers.ts          # Multer + file validation
│   ├── uploads/                # Uploaded resumes & school IDs (git-ignored)
│   ├── .env.example            # ← Copy this to .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── applicant/      # Dashboard, Profile, History
│   │   │   ├── employer/       # Dashboard, Applicants, History
│   │   │   └── admin/          # Dashboard with document filters
│   │   ├── components/         # Reusable UI components
│   │   ├── services/api.ts     # Axios API client
│   │   └── utils/colorUtils.ts # Match score color system
│   └── package.json
├── .gitignore
└── README.md
```

---

## 🗃 Database

This project uses **Prisma** with MySQL. We intentionally use `db push` instead of migrations — simpler and more reliable for local student deployments.

```bash
# Create/sync database tables:
npx prisma db push

# View the database in browser (optional):
npx prisma studio
```

---

## ⚠️ Important Notes

- **Do NOT commit your `.env` file** — it contains secrets. The `.gitignore` already excludes it.
- **Uploaded files** (`uploads/`) are excluded from git. The folder is recreated automatically on first upload.
- **MySQL must be running** before starting the backend.
- All routes are **role-protected** — students cannot access employer endpoints and vice versa.

---

*Built with ❤️ for the AppDev capstone — SkillMatch Team*
