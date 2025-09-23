# Project Specification

## Core Concept
A **minimalist, AI-powered dashboard** that transforms chaotic job hunting into a streamlined ritual. Think: *Monastery meets machine learning*.

## Key Pillars
1. **Localization** – Built for AED, visas, and UAE-specific job markets.
2. **AI Precision** – Summaries that cut through noise, highlighting visa requirements and "Emirates ID" flags.
3. **Privacy** – Zero third-party scraping. Data encrypted like a Dubai vault.

## Narrative
> *You're in a sunlit Dubai co-working space. The hum of the city fades as you open the app. Clean lines, AED values, and an AI that "gets" UAE hiring quirks. No clutter. Just flow. Apply smarter, not harder.*

---

## Design System
- **Aesthetic**: Monochrome base with gold/green accents (UAE flag colors).
- **UI Framework**: `shadcn/ui` + Tailwind.
- **Font**: Inter (clean, modern, no distractions).

## Tech Stack
| **Component**      | **Choice**                          |
|---------------------|-------------------------------------|
| Frontend            | Next.js 14 (App Router)            |
| Backend             | Vercel Edge Functions              |
| Database            | PostgreSQL (Supabase)              |
| AI                  | GPT-4o-mini + Redis caching        |
| Storage             | Cloudflare R2 (encrypted)          |

## Core Features (MVP)
1. **Job Capture**: Manual URL/Text → Auto-extract AED salary, company, location.
2. **AI Summary**: Bullet points + red flags (e.g., "no visa sponsorship").
3. **Pipeline**: Kanban board with stages (Applied → Offer).
4. **Localization**: Emirate dropdowns, AED currency formatting.

## Development Phases

### Phase 1: Foundation
- [ ] Initialize Next.js 14 project with TypeScript
- [ ] Configure Prisma + PostgreSQL schema (include `emirate`, `visa_status` enums)
- [ ] Build basic auth flow (NextAuth.js)

### Phase 2: AI & Data Processing
- [ ] Integrate OpenAI API with UAE-specific prompts (e.g., flag "Qiwa compliance" mentions)
- [ ] Add Redis caching layer for duplicate job descriptions
- [ ] Implement job data extraction and processing

### Phase 3: User Interface
- [ ] Implement shadcn/ui components with UAE color palette
- [ ] Create drag-and-drop pipeline board (react-dnd)
- [ ] Add AED salary input validation
- [ ] Build responsive job cards and forms

### Phase 4: Security & Polish
- [ ] Encrypt sensitive job data at rest (AES-GCM)
- [ ] Set up Sentry + Logtail for observability
- [ ] Performance optimization
- [ ] Testing suite

*Flow state activated. No distractions. Just code.*