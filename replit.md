# namFindz — Lost & Found / Missing Documents Portal

A community noticeboard for reporting and finding lost ID cards, passports, driver's licenses, electronics, wallets, and other personal items in Namibia.

## Architecture

OpenAPI-first contract → generated types/Zod/React hooks. React + Vite frontend, Express 5 backend, PostgreSQL via Drizzle ORM.

### Workspace layout
- `lib/api-spec/openapi.yaml` — single source of truth for the HTTP contract.
- `lib/api-zod` — generated Zod request/response schemas (Orval).
- `lib/api-client-react` — generated TanStack Query hooks (Orval).
- `lib/db/src/schema/reports.ts` — Drizzle schema (reports, messages, document_types, activity).
- `scripts/src/seed.ts` — seeds 12 reports + activity + sample messages. Run with `pnpm --filter @workspace/scripts run seed`.
- `artifacts/api-server` — Express server, mounts routes from `src/routes/reports.ts`.
- `artifacts/namfindz` — React + Vite + Wouter + shadcn UI.

### Frontend pages
- `/` — Hero, search bar, stats overview, recent activity, top categories.
- `/browse` — Filterable list (kind/category/location/free-text query).
- `/reports/:id` — Detail view with status updates, AI match suggestions, secure messaging thread, flag-as-suspicious dialog.
- `/report/lost`, `/report/found` — Report submission form.
- `/dashboard` — Recharts visualizations (bar + pie) and recent activity timeline.
- `/my-reports` — Authenticated user's own reports.
- `/about` — Static info page.

### Authentication
- Email + password auth with bcryptjs hashing and a server-side session table (`sessions`, `users`, `password_reset_tokens` in `lib/db/src/schema/auth.ts`). Session cookie `sid`, 7-day TTL. `secure` flag only set when `NODE_ENV==="production"`.
- Server: `artifacts/api-server/src/lib/auth.ts` (session helpers), `lib/email.ts` (SMTP via nodemailer), `middlewares/authMiddleware.ts`, `routes/auth.ts` mounted at `/api/auth/*`.
- Endpoints: `POST /register`, `POST /login`, `POST /logout`, `GET /user`, `POST /request-password-reset`, `POST /reset-password`.
- Password reset: 1-hour TTL, single-use tokens stored as sha256 hashes. Request endpoint always returns `{success:true}` to prevent account enumeration. Reset URL = `${APP_ORIGIN}/reset-password?token=...` (falls back to `x-forwarded-*`/host headers when `APP_ORIGIN` is unset).
- Email delivery: configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` (and optional `EMAIL_FROM`). With no SMTP env vars set, the email body is logged to stdout — useful for local development.
- Client: `lib/auth-web` (`@workspace/auth-web`) exposes `useAuth()` returning `{ user, isLoading, isAuthenticated, refresh, logout }`. Pages `/login`, `/register`, `/forgot-password`, `/reset-password` are wired in `App.tsx`.
- Reports created while signed in are linked via `reports.userId` (nullable, set null on user delete). `GET /api/me/reports` returns the caller's own reports.

### Self-hosting (Render + Neon)
- `scripts/src/export-data.ts` (run via `pnpm --filter @workspace/scripts run export-data`) writes `database-export.sql` containing TRUNCATE + INSERT statements for all tables. Run it after `pnpm --filter @workspace/db run push` on the new database to load seed data.

### Backend features
- Reports CRUD with filters (`kind`, `status`, `documentType`, `location`, `query`, `dateFrom`, `dateTo`).
- Status updates and flagging workflow.
- Secure messaging threads per report.
- Jaccard-similarity-based match suggestions across opposite kind.
- Stats endpoints (summary, recent activity, by-document-type) backed by SQL aggregates and an `activity` log table.
- Meta endpoints for document types and locations.

## Conventions
- Wouter base path = `import.meta.env.BASE_URL.replace(/\/$/, "")`.
- Date columns use Drizzle's `date` (string); convert `Date` → `toISOString().slice(0,10)` before query/insert.
- Generated hooks return `{ data, isLoading, ... }` directly — call `useGetReport(id, { query: { enabled, queryKey } })`, never wrap them in another `useQuery`.
