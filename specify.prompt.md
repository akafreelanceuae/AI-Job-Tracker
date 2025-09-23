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