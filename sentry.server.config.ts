import * as Sentry from '@sentry/nextjs'

// Initialize Sentry on the server only if a DSN is provided
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
  })
}