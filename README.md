# AI Job Tracker

> *Monastery meets machine learning* - A minimalist, AI-powered dashboard for UAE job hunting.

## 🎯 Core Concept

Transform chaotic job hunting into a streamlined ritual with AI precision, UAE localization, and privacy-first design.

## ✨ Key Features

- **🇦🇪 UAE-Focused**: Built for AED, visas, and Emirates-specific job markets
- **🤖 AI-Powered**: Smart summaries with visa requirement detection
- **🔒 Privacy-First**: Zero third-party scraping, vault-level encryption
- **📱 Clean Interface**: Monochrome + UAE flag colors (gold/green accents)

## 🛠 Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 14 (App Router) |
| Backend | Vercel Edge Functions |
| Database | PostgreSQL (Supabase) |
| AI | GPT-4o-mini + Redis caching |
| Storage | Cloudflare R2 (encrypted) |
| UI | shadcn/ui + Tailwind |

## 🚀 Getting Started

Environment flags (all default to safe OFF unless noted):
- NEXT_PUBLIC_NOTIFICATIONS_TOASTS_ENABLED=true to show summary toasts (default off unless set)
- NEXT_PUBLIC_ANALYTICS_USE_MOCK=false to use real analytics (set true for mock)
- NEXT_PUBLIC_NOTIFICATIONS_SSE_ENABLED=false enable server-backed settings + SSE
- SERVER_NOTIFICATIONS_BATCHING_ENABLED=false enable server batching (or NOTIFICATIONS_SERVER_BATCHING_ENABLED)
- NEXT_PUBLIC_DELIVERY_EMAIL_ENABLED=false enable log-only email adapter
- NEXT_PUBLIC_DELIVERY_PUSH_ENABLED=false enable log-only push adapter
- NEXT_PUBLIC_DELIVERY_WEBHOOK_ENABLED=false enable log-only webhook adapter
- SENTRY_DSN (server) and/or NEXT_PUBLIC_SENTRY_DSN (client) to enable Sentry

Testing
- npm run test

Dev helper scripts
- npm run flush:dev:hourly | flush:dev:daily | flush:dev:weekly

```bash
# Clone the repository
git clone <repository-url>
cd ai-job-tracker

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

## 📋 Development Status

- [ ] Project initialization
- [ ] Next.js setup with TypeScript
- [ ] Database schema with UAE-specific enums
- [ ] Authentication system
- [ ] AI integration with OpenAI
- [ ] UI components with UAE design system
- [ ] Job pipeline board
- [ ] Data encryption layer

## 🌟 Vision

*You're in a sunlit Dubai co-working space. The hum of the city fades as you open the app. Clean lines, AED values, and an AI that "gets" UAE hiring quirks. No clutter. Just flow. Apply smarter, not harder.*

---

Built with ❤️ for the UAE job market