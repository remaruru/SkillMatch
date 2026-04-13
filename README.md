# SkillMatch - AI-Powered Internship Matching System

SkillMatch is a specialized platform designed to automate and optimize the internship recruitment process using artificial intelligence. By leveraging the Google Gemini API, the system analyzes student resumes to extract technical skills and calculates a compatibility score against employer requirements.

## Live Demo

The application is deployed on Render:
- **Frontend:** https://skillmatch-frontend.onrender.com
- **Backend API:** https://skillmatch-backend.onrender.com

---

## Core Objective

The primary goal of SkillMatch is to eliminate the inefficiency of manual resume screening. It provides students with data-driven insights into their career fit and allows employers to prioritize candidates based on objective technical alignment.

---

## System Workflows

### 1. Applicant Workflow
The process for students is designed to be automated and data-rich:

1.  Registration: Students create an account and provide basic academic details.
2.  Resume Upload: The student uploads a text-based PDF resume.
3.  Skill Extraction: The system uses pdf-parse to extract raw text and the Google Gemini API to identify specific technical skills (e.g., React, SQL, Python).
4.  Profile Customization: Extracted skills are automatically saved to the student's profile, though they can be updated later via another upload.
5.  Discovery and Matching: The student views a list of recommended internships. Each listing shows a Match Score (0-100%) calculated by comparing the student's skills to the job's requirements.
6.  AI Analysis: Students can view a breakdown of matched vs. missing skills and an AI-generated explanation of their compatibility.
7.  Application: The student applies with a resume and an optional cover message.
8.  Tracking: Students monitor their application status (Pending, Under Review, Accepted, or Rejected) through a centralized history dashboard.

### 2. Employer Workflow
The process for companies focuses on talent management and precise role definition:

1.  Registration: Employers create a company profile including industry and description.
2.  Internship Posting: Employers post roles by defining the title, description, and a specific list of required technical skills.
3.  Location Management: Employers use an integrated map to set the precise location of the internship.
4.  Applicant Review: Employers access a list of applicants for each internship, ranked by their AI-calculated Match Score.
5.  Candidate Analysis: For each applicant, the employer can see which required skills the candidate possesses and which ones they lack.
6.  Status Management: Employers update the status of each application. Updating a status to "Accepted" or "Rejected" triggers an automated notification to the applicant.
7.  History: Employers can review their historical tracking of all candidates across different positions.

### 3. Admin Workflow
The process for administrators ensures platform integrity and data compliance:

1.  Account Management: Admins review pending registrations for both students and employers to verify their legitimacy.
2.  Document Auditing: Admins use specialized filters to identify students who have not yet uploaded required documents, such as Resumes or School IDs.
3.  Compliance Filtering: Admins can filter the user database based on document status (e.g., "Missing School ID" or "Complete Profile") to facilitate follow-ups.
4.  System Analytics: Admins monitor total platform activity, including active listings and total applications.

---

## Technical Stack

- **Frontend:** React 19, Vite, TypeScript, TailwindCSS
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL (hosted on Render), Prisma ORM
- **AI Engine:** Google Gemini Pro (via @google/generative-ai)
- **File Storage:** Cloudinary (resume & school ID uploads in production)
- **Map Services:** React Leaflet (OpenStreetMap)
- **Utilities:** pdf-parse for resume text extraction, Multer for file handling
- **Deployment:** Render (backend as Web Service, frontend as Static Site)

---

## Setup and Installation (Local Development)

### 1. Prerequisites
- Node.js v18 or higher
- A PostgreSQL database (local or cloud — [Render](https://render.com) provides a free tier)

### 2. Backend Configuration
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Copy the environment template: `cp .env.example .env` (or `Copy-Item .env.example .env` on PowerShell)
4. Edit `.env` and fill in the following variables:
   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
   JWT_SECRET="any-long-random-string"
   GEMINI_API_KEY=""              # Optional — AI extraction is skipped if missing
   FRONTEND_URL="http://localhost:5173"

   # Cloudinary (required for file uploads in production)
   CLOUDINARY_CLOUD_NAME=""
   CLOUDINARY_API_KEY=""
   CLOUDINARY_API_SECRET=""
   ```
5. Push the database schema: `npx prisma db push`
6. Seed the initial admin and test accounts: `npx tsx prisma/seed.ts`
7. Start the server: `npm run dev`

### 3. Frontend Configuration
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Set the API URL (create `frontend/.env`):
   ```env
   VITE_API_URL=http://localhost:5000
   ```
4. Start the development server: `npm run dev`

The application will be accessible at **http://localhost:5173**.

---

## Deployment (Render)

This project includes a `render.yaml` file for one-click deployment on Render.

**Required environment variables to set in the Render dashboard:**

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string from Render DB |
| `JWT_SECRET` | Secure random string |
| `GEMINI_API_KEY` | Google AI Studio API key |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `FRONTEND_URL` | Your Render frontend static site URL |
| `VITE_API_URL` | Your Render backend URL (for the frontend service) |

---

## Team

| Name |
|---|
| Roldan, Earl Angelo L. |
| Barrientos, Clark |
| Muñoz, Jhon Marvin |
| Rosales, Enzo Benedict T. |
| Salazar, Maria Cielo L. |

*SkillMatch Capstone — April 2026*
