# ADR 0003: Settings real-time sync via SSE

Decision:
- Use a simple in-memory event bus with a Server-Sent Events endpoint to push updates between tabs/dev processes when feature flag is enabled.

Rationale:
- SSE is simpler than WebSockets on Vercel; good fit for unilateral server-to-client updates.
- Feature-flagged approach avoids changing baseline behavior.

Tradeoffs:
- In-memory broadcaster does not span multiple instances; suitable for dev/staging only.
- A shared pub/sub (e.g., Redis) would be required to scale to multi-instance deployments.