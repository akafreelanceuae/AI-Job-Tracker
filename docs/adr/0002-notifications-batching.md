# ADR 0002: Notifications batching (client vs. server)

Decision:
- Preserve client-only batching/flush by default for a zero-backend baseline.
- Add server-side batching behind a flag using pluggable storage (Vercel KV preferred, Prisma fallback).
- Trigger flush via cron or ad-hoc endpoints; broadcast summaries via SSE.

Rationale:
- Gradual rollout with flags allows safe migration and easy backout.
- KV is operationally simple on Vercel; Prisma fallback covers non-KV environments.

Tradeoffs:
- Client-only mode lacks shared state across devices; server batching resolves this at the cost of backend complexity.
- SSE requires long-lived connections; acceptable within dev/staging; production may later need pub/sub.