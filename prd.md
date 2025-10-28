Perfect — let’s now produce a **fully detailed, startup-grade PRD** for your project **AI Job Tracker UAE**, tuned for **Dubai/Abu Dhabi** job seekers and recruiters. This version combines the local hiring landscape (LinkedIn, Bayt, Naukrigulf, Dubizzle Jobs, etc.) with **AI-driven workflow automation** and **UAE-specific features** like visa type, salary ranges (AED), and free-zone vs mainland filters.

---

# 💼 **AI Job Tracker UAE — Product Requirements Document (PRD)**

**Version:** 1.0
**Date:** October 2025
**Author:** [Your Name]
**Product Owner:** [Your Name]
**Status:** MVP Planning

---

## 1. 🎯 Product Overview

### **Product Name:**

**AI Job Tracker UAE**

### **Tagline:**

*“Track every job. Automate every application. Land offers faster — built for Dubai & Abu Dhabi.”*

### **Vision:**

To become the **#1 AI-powered job-application operating system** for professionals and recruiters in the UAE — unifying all job portals, automating CV/cover-letter customization, and eliminating lost opportunities.

### **Mission:**

Help every job seeker in the UAE move from chaos (spreadsheets, missed follow-ups, generic CVs) to clarity — a single workspace that tracks every application, auto-writes tailored documents, and nudges you to follow up until you’re hired.

---

## 2. 💡 Problem Statement

UAE job seekers face unique challenges:

* They apply across **LinkedIn, Bayt, Indeed, Dubizzle**, etc. with no centralized tracker.
* Re-using generic CVs kills conversion rates in **ATS-filtered systems**.
* Most forget to follow up after applying.
* Recruiters often miss qualified candidates due to poor filtering.

**AI Job Tracker UAE** solves this by offering:

* A **unified job board tracker**,
* **AI-generated cover letters + CV variants**, and
* **Smart nudges** for timely follow-ups.

---

## 3. 🧩 MVP Features

| Feature                                    | Description                                                                | Priority |
| ------------------------------------------ | -------------------------------------------------------------------------- | -------- |
| **1. Unified Job Tracker Board**           | Kanban-style board: Applied → Interview → Offer → Hired/Rejected.          | ⭐️⭐️⭐️   |
| **2. Job Description Parser (AI)**         | Paste a JD → AI extracts must-have skills, visa hints, and keywords.       | ⭐️⭐️⭐️   |
| **3. 1-Click CV & Cover Letter Generator** | Auto-tailors your existing CV + personalized cover letter for each job.    | ⭐️⭐️⭐️   |
| **4. Multi-Portal Importer**               | Paste a LinkedIn / Bayt / Indeed URL → auto-populate details.              | ⭐️⭐️     |
| **5. Follow-Up Reminders**                 | Nudges: “Follow up 3 days after applying,” “Check reply at 7 days.”        | ⭐️⭐️⭐️   |
| **6. UAE-Specific Filters**                | Visa type, Emirate, salary (AED), company type (Gov/Mainland/Free-zone).   | ⭐️⭐️⭐️   |
| **7. Job Analytics Dashboard**             | Track stats: applied count, interview rate, offer ratio, rejection reason. | ⭐️⭐️     |
| **8. Document Vault**                      | Securely store all CVs, cover letters, offer letters.                      | ⭐️⭐️     |
| **9. Recruiter Mode (Phase 2)**            | Manage applicants per job posting.                                         | ⭐️       |
| **10. AI Career Insights (Phase 3)**       | Personalized career guidance based on your job-application data.           | ⭐️       |

---

## 4. 👥 User Personas

### 🧍‍♂️ **Individual Job Seeker – “Omar the Engineer”**

* Based in Dubai, applying to 50+ jobs/month.
* Pain: Loses track of where he applied.
* Goal: Centralize tracking and auto-generate tailored documents.

### 👩‍💼 **Recruiter / HR – “Sara from Emaar”**

* Handles 100+ candidates weekly.
* Pain: Messy spreadsheets and mismatched CVs.
* Goal: Filter by skills, location, and visa instantly.

### 👨‍💻 **Student / Fresh Graduate – “Nabil the Intern”**

* Limited experience; needs guidance on CV + cover letters.
* Goal: Learn, track, and improve success rate with AI feedback.

---

## 5. 🧰 Technical Architecture

### **Frontend:**

* **Next.js 15 (App Router)**
* **TypeScript + TailwindCSS + Shadcn UI**
* **Framer Motion** for micro-animations
* **TanStack Query** for data fetching
* **Recharts** for analytics

### **Backend:**

* **Supabase (Postgres + Auth + Storage)**
* **Prisma ORM**
* **Edge Functions** for AI doc generation & email reminders
* **Cron jobs** for follow-up notifications

### **AI Layer:**

* **GPT-5 API** for:

  * JD parsing
  * CV tailoring
  * Cover letter writing
  * “Follow-up email” generation

### **Hosting & DevOps:**

* **Vercel** for frontend
* **Supabase Functions** for serverless backend
* **GitHub Actions** for CI/CD pipeline

---

## 6. 🔒 Security & Privacy

* OAuth login via Google / Apple / LinkedIn.
* AES-256 encryption for resumes and sensitive data.
* Row-level security (RLS) per user.
* GDPR and UAE Data Protection Law compliant.

---

## 7. 📊 Data Schema (Simplified)

**`users`**

* id (UUID)
* name
* email
* visa_type (enum: tourist, employment, dependent, etc.)
* location (Emirate)
* created_at

**`applications`**

* id
* user_id (FK → users)
* company_name
* job_title
* source (LinkedIn/Bayt/Indeed/etc.)
* status (enum: applied/interview/offer/rejected/hired)
* applied_date
* follow_up_date
* notes
* salary_range (int range)

**`documents`**

* id
* user_id
* type (cv/cover_letter/offer_letter)
* url
* job_id (nullable FK → applications)

**`ai_reports`**

* id
* job_id
* required_skills (array)
* recommended_edits
* ats_score (0–100)

---

## 8. 📱 Core Screens / UX

| Screen                       | Description                                                       |
| ---------------------------- | ----------------------------------------------------------------- |
| **Dashboard / Kanban Board** | All applications by stage; drag-and-drop between columns.         |
| **Add Job Modal**            | Paste a JD link → auto-extracts details and keywords.             |
| **AI Docs Page**             | “Generate CV + Cover Letter” button with preview & export to PDF. |
| **Analytics Dashboard**      | Shows “Applications → Interviews → Offers” funnel.                |
| **Smart Alerts Panel**       | “You haven’t followed up with XYZ Company (5 days).”              |
| **Document Vault**           | Secure, searchable file manager for all generated docs.           |

---

## 9. 🚀 Success Metrics

| Metric                             | Target               |
| ---------------------------------- | -------------------- |
| Avg. jobs tracked per user         | 30+                  |
| Avg. follow-up rate                | 60%                  |
| CV generation usage                | 80%+ of active users |
| Job-to-interview conversion uplift | +25%                 |
| Retention (Month 1→2)              | >50%                 |

---

## 10. 📅 Roadmap

| Phase                                           | Duration                                                    | Key Deliverables |
| ----------------------------------------------- | ----------------------------------------------------------- | ---------------- |
| **Phase 1 — MVP Core (6 weeks)**                | Unified tracker, JD parser, manual entry, AI doc generation |                  |
| **Phase 2 — Smart Follow-Ups (3 weeks)**        | Reminders, auto-email templates, filters                    |                  |
| **Phase 3 — UAE Filters + Analytics (3 weeks)** | Visa type, Emirate, salary range, dashboards                |                  |
| **Phase 4 — Recruiter Portal (4 weeks)**        | Company dashboard, candidate pipeline                       |                  |
| **Phase 5 — Career AI Coach (4 weeks)**         | Personalized insights, ATS score improvement tips           |                  |

---

## 11. 💰 Monetization

| Tier                 | Features                                          | Price             |
| -------------------- | ------------------------------------------------- | ----------------- |
| **Free**             | Up to 10 tracked jobs, 3 AI-generated docs/month  | AED 0             |
| **Pro**              | Unlimited jobs, AI insights, follow-up automation | AED 19.99 / month |
| **Recruiter Pro**    | Multi-candidate dashboard, AI screening           | AED 79.99 / month |
| **Enterprise (API)** | Integration with HRMS/ATS                         | Custom pricing    |

---

## 12. 📈 Example Use Flow

1. User signs in via Google → lands on empty board.
2. Clicks “+ Add Job” → pastes LinkedIn job URL.
3. AI parses JD → extracts “Skills: React, Supabase, Tailwind, Next.js.”
4. Click “Generate Cover Letter” → system creates custom letter in 3s.
5. User applies → moves job to “Applied” column.
6. After 3 days → app sends a follow-up reminder.
7. After offer → uploads contract into Vault.

---

## 13. 🧠 AI Model Prompts (Simplified)

**JD Parser:**

> “Extract key skills, experience level, salary hints, and visa requirements from this UAE job description. Return as structured JSON.”

**Cover Letter Generator:**

> “Write a concise, ATS-friendly cover letter for this role using the extracted skills and candidate’s profile details.”

**ATS Score Analyzer:**

> “Compare this CV vs job description and return match percentage, missing keywords, and tone adjustments.”

---

## 14. 🧭 Competitive Analysis

| Competitor             | Weakness              | AI Job Tracker Edge                        |
| ---------------------- | --------------------- | ------------------------------------------ |
| Notion / Google Sheets | Manual tracking       | Auto-AI tracking & follow-ups              |
| Teal HQ                | Global-only           | UAE-localized filters (visa, Emirate, AED) |
| Huntr                  | Limited AI automation | AI CV/cover letter generator               |
| Bayt / LinkedIn        | Single-portal         | Multi-portal + unified AI workspace        |

---

## 15. 💡 Future Expansion

* **AI Resume Scorer for UAE companies** (detect free-zone hiring patterns).
* **Company Intelligence:** average reply time, salary trends by industry.
* **Recruiter CRM Integration (Zoho, HubSpot, Workable).**
* **AI-Voice Assistant:** “What’s my next follow-up due?”
* **Community Referrals:** match users applying to same company.

---

## 16. 📊 Success Criteria

✅ 1K users within first month (organic LinkedIn launch).
✅ 70%+ of users use AI doc generation.
✅ 20% of users upgrade to Pro within 60 days.
✅ Average user applies to 30+ jobs tracked in the app.

---

Would you like me to generate next:

* 🧱 **Production-ready repo tree** (Next.js 15 + Supabase + Prisma + OpenAI integration), or
* 🧠 **AI workflow prompts file** (for JD parser, CV writer, follow-up generator)?

I can output both as structured JSON + ERD for instant GitHub setup.
