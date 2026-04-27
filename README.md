# family-learning-world (MVP Foundation)

Private family learning game MVP built with Next.js App Router + Supabase-first architecture.

## Implemented MVP Foundation
- Parent-authenticated route skeleton (`/family`, `/play`, `/parent`).
- Household onboarding with server-side PIN hashing.
- Kid profile picker and protected active-profile cookie.
- Math Kingdom first playable activity UI (React shell with Phaser placeholder block).
- Attempt submission and pending token transaction creation.
- Parent dashboard with:
  - Today summary
  - Profiles list
  - Attempts table
  - Approval queue (approve/reject)
  - Rewards CRUD (create/list)
  - Tutor logs placeholder
- Supabase SQL migration with RLS from day one.
- Agent API extension points with HMAC verification placeholders.
- VPS worker scaffolding docs + compose template.

## Architecture Guardrails
- One Supabase auth user = parent.
- Kids are profile rows under household.
- No service-role key in client components.
- Private secrets are server-only.
- RLS enabled on household-scoped tables.
- No crypto/wallet/payments in MVP.

## Environment Variables
Copy `.env.example` to `.env.local`.

Public-safe:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Private server-only:
- `SUPABASE_SERVICE_ROLE_KEY`
- `PARENT_PIN_HASH_SECRET`
- `AGENT_HMAC_SECRET`
- `ANTHROPIC_API_KEY`
- `TELEGRAM_BOT_TOKEN`
- `APP_BASE_URL`

## Local Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start dev server:
   ```bash
   npm run dev
   ```
3. Run checks:
   ```bash
   npm run typecheck
   npm run lint
   ```

## Supabase
- Run migration in `supabase/migrations/20260427161000_init_family_learning_world.sql`.
- Run seed file `supabase/seed.sql`.

## Agent API placeholders
All `/api/agent/*` endpoints require `x-agent-signature` (HMAC SHA256).

- `POST /api/agent/lessons`
  - payload: generated lesson package `{ household_id, lessons: [...] }`
- `POST /api/agent/grade`
  - payload: grading package `{ attempt_id, feedback, model }`
- `POST /api/agent/notify`
  - payload: notification package `{ household_id, channel, message }`
- `GET /api/agent/struggling-skills?household_id=...`
  - returns placeholder struggling skill list

## TODO (Next Iterations)
- Replace login placeholder with Supabase auth UI/actions.
- Integrate actual Phaser 3 scene lifecycle with React bridge.
- Add robust input validation + error boundaries for all server actions.
- Add parent profile editing and reward update/delete.
- Add tutor logs writing/reading flow.
- Implement worker services (Telegram/jobs/agent) on VPS.
