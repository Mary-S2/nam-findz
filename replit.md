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
- `/about` — Static info page.

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
