import * as Sentry from '@sentry/nextjs'

// Initialize Sentry on the client only if a DSN is provided
const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN

if (typeof window !== 'undefined' && DSN) {
  Sentry.init({
    dsn: DSN,
    tracesSampleRate: 0.1,
    // Adjust this value as needed; avoid PII and reduce noise.
    replaysOnErrorSampleRate: 0.0,
    replaysSessionSampleRate: 0.0,
  })
}