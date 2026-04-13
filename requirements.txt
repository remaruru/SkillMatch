# SETUP.md — SkillMatch: AI Agent Setup Instructions

> This file is written for an AI assistant (or developer) to follow on a **fresh machine** after cloning this repository.
> Follow every step in order. Do not skip steps.

---

## Prerequisites (Verify Before Starting)

The following must be available on the machine before running any commands:

- **Node.js v18+** — verify with: `node -v`
- **npm** — verify with: `npm -v`
- **MySQL running on port 3306** — XAMPP is recommended. Start the **Apache** and **MySQL** modules from the XAMPP Control Panel before continuing.
- **Git** — only needed if cloning (already done if you're reading this)

---

## Step 1 — Clone the Repository (if not already done)

```bash
git clone https://github.com/remaruru/SkillMatch.git
cd SkillMatch
```

---

## Step 2 — Backend Setup

### 2a. Install backend dependencies

```bash
cd backend
npm install
```

### 2b. Create the environment file

**Windows (Command Prompt):**
```cmd
copy .env.example .env
```

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

**Mac/Linux:**
```bash
cp .env.example .env
```

### 2c. Edit the `.env` file

Open `backend/.env` and fill in the values. The defaults below work for a standard XAMPP install:

```env
DATABASE_URL="mysql://root:@localhost:3306/skillmatch"
PORT=5000
JWT_SECRET="any-long-random-string-here"
GEMINI_API_KEY=""
```

> `GEMINI_API_KEY` is **optional**. Leave it empty if you don't have one.
> The system will still work — AI skill extraction will be skipped gracefully.
> To get a key: https://aistudio.google.com/app/apikey

### 2d. Initialize the database

> ⚠️ MySQL must be running before this step.

```bash
npx prisma db push
```

This creates the `skillmatch` database and all tables automatically.

### 2e. Seed default accounts

```bash
npx tsx prisma/seed.ts
```

This creates the following test accounts:

| Role       | Email                  | Password      |
|------------|------------------------|---------------|
| Admin      | admin@skillmatch.com   | password123   |
| Applicant  | john@student.edu       | password123   |
| Employer   | hr@techcorp.com        | password123   |

### 2f. Start the backend server

```bash
npm run dev
```

The backend should now be running at: **http://localhost:5000**

You should see output like:
```
Server running on port 5000
```

---

## Step 3 — Frontend Setup

Open a **second terminal window** (keep the backend running in the first).

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at: **http://localhost:5173**

---

## Step 4 — Verify the Application Works

1. Open **http://localhost:5173** in a browser
2. Log in with the Admin account: `admin@skillmatch.com` / `password123`
3. Log in with the Applicant account: `john@student.edu` / `password123`
4. Log in with the Employer account: `hr@techcorp.com` / `password123`

---

## Project Structure Reference

```
SkillMatch/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma         # All database models
│   │   └── seed.ts               # Default account seeder
│   ├── src/
│   │   ├── controllers/          # Business logic handlers
│   │   ├── middleware/           # JWT auth + role guards
│   │   ├── routes/               # Express API routes
│   │   ├── services/
│   │   │   ├── resumeParser.service.ts   # PDF text extraction (pdf-parse)
│   │   │   ├── llm.service.ts            # Gemini LLM skill extraction
│   │   │   └── matchingService.ts        # Match score computation
│   │   └── utils/
│   │       └── uploadHelpers.ts          # Multer file upload config
│   ├── uploads/                  # Resume & school ID uploads (auto-created, git-ignored)
│   ├── .env.example              # ← Template — copy to .env and fill in
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── applicant/        # Dashboard, Profile, History pages
│   │   │   ├── employer/         # Dashboard, Applicants, History pages
│   │   │   └── admin/            # Admin dashboard with document filters
│   │   ├── components/           # Shared UI components
│   │   ├── services/api.ts       # Axios HTTP client (base URL: http://localhost:5000)
│   │   └── utils/colorUtils.ts   # Match score → color badge utility
│   └── package.json
├── .gitignore
├── README.md
└── SETUP.md                      # ← You are reading this file
```

---

## Key Technical Notes for AI Agents

### API Base URL
The frontend talks to the backend at `http://localhost:5000`. This is configured in:
```
frontend/src/services/api.ts
```

### Upload Directory
Uploaded files go to `backend/uploads/`. This folder:
- Is **excluded from git** (only a `.gitkeep` is committed)
- Is **auto-created** on the first upload via `uploadHelpers.ts`
- Do NOT manually delete this folder while the server is running

### PDF Resume Pipeline
1. Student uploads a PDF via the Profile page
2. Backend extracts text using `pdf-parse` (`resumeParser.service.ts`)
3. Text is sent to Google Gemini → returns JSON skill array (`llm.service.ts`)
4. Skills are saved to the applicant profile
5. `matchingService.ts` recalculates match scores for all internships

If `GEMINI_API_KEY` is missing, steps 3–4 are skipped gracefully without error.

### Authentication Flow
- JWT tokens are issued on login
- Stored in localStorage on the frontend
- All protected routes check `Authorization: Bearer <token>` header
- Role-based: `APPLICANT`, `EMPLOYER`, `ADMIN`

### Database: Using `db push` vs `migrate`
This project uses `npx prisma db push` (not `prisma migrate dev`).
- Simpler for local development
- No migration history to conflict between machines
- If schema changes: re-run `npx prisma db push`

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `Can't connect to MySQL` | Make sure XAMPP MySQL module is started on port 3306 |
| `P1001: Can't reach database server` | Same as above — check XAMPP |
| `GEMINI_API_KEY not set` | Expected — AI extraction is optional, app still works |
| `Port 5000 in use` | Change `PORT=5001` in `.env` and update `frontend/src/services/api.ts` |
| `Port 5173 in use` | Vite will auto-assign the next available port — check terminal output |
| Uploads folder missing | It's auto-created on first file upload — no action needed |
| `prisma db push` fails | Ensure DATABASE_URL in `.env` is correct and MySQL is running |

---

*Last updated: April 2026 — SkillMatch AppDev Capstone Project*
