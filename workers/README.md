# VPS Workers (Future Extension)

This folder is for **VPS-hosted workers** (not Raspberry Pi).

## Purpose
- Hold private service keys (service-role, Telegram, model APIs).
- Run Telegram bot services.
- Run scheduled jobs/content generation.
- Run OpenClaw/Claude agent job runners.
- Call Supabase securely from server environment.
- Call Next.js `/api/agent/*` routes using HMAC signatures.

## Deployment Notes
- Use Docker Compose for process isolation.
- Do not expose public ports unless strictly required.
- Telegram can start with long polling, migrate to webhook later.
- Keep this separated from Vercel public runtime.
