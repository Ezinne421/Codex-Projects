# ProjectManager AI Africa

A functional Phase 1 project-management MVP: React + TypeScript + Tailwind, Express and persistent SQLite. Empty accounts start with real empty states. No sample project progress or financial metrics are seeded.

Read [the implementation plan and database design](docs/IMPLEMENTATION.md).

## Run locally

Requires **Node.js 24.15 or newer in the 24.x LTS line** and npm. Run from the repository root:

```sh
npm ci
cp .env.example .env
npm run dev
```

Open the app on port **3000**. Register an account to create a private organisation. Each new registration creates a distinct organisation; this release does not have team invitations. For another port, set both `PORT` and `APP_URL` in `.env`. The application loads `.env` on startup. Restart after configuration changes; development does not automatically restart the backend.

Data persists in `.data/` (or the absolute `DATA_DIR`). This directory is ignored by Git, outside the web root, and must be on a persistent local disk. Do not delete it to refresh the app. Never commit `.env`, keys, databases or backups.

## What works

- Registration, sign-in, seven-day HTTP-only sessions, logout and persistent accounts; password recovery when SMTP is configured.
- Organisation-isolated project creation, editing, deletion and plan duplication. Duplication copies planned tasks, budget items, risks and documents; it excludes expenses and progress updates.
- Budgets with quantity/rate calculations, contingency, tax, actual expenses, remaining budget, variance, utilisation and non-persistent what-if scenarios. Money is stored in integer minor units; each line rounds once. Tax applies to subtotal plus contingency. The configured tax is a user assumption, not tax advice.
- NGN, USD, GHS and KES, kept separate. There are no fabricated currency conversions. Dashboard financial totals include only the selected currency.
- Editable tasks with owners, dates, status and progress; schedule bars and overdue indicators. A Done task must have 100% progress.
- Editable risks, scores, warning indicators, mitigations, contingency, owner and review date.
- Dated progress records; manual document authoring and editing; AI plans, progress reports and contextual advice when configured.
- PDF and DOCX summaries / individual documents; XLSX workbook containing budgets, actual expenses, tasks, risks, updates and documents. Export access requires the same project permissions as viewing.
- Responsive public pages and application screens, empty/loading/error states and text search.

## Enable server-side AI

Set `AI_API_KEY` to your OpenAI credential using your host's secure environment settings (or local `.env`). Set `AI_MODEL` to a model your account supports; the default is `gpt-4.1-mini`. The server calls `https://api.openai.com/v1/chat/completions`; allow outbound HTTPS to `api.openai.com`. Never use a `VITE_`-prefixed key. Keys are never returned by the API or bundled into frontend assets. The managed environment supports proxy injection for `AI_API_KEY` to this host.

Select a project, write its brief, and open **AI Planner**. Generation saves an editable document labelled **AI draft — review required**. The selected project's records are sent to the provider; obtain permission before sharing sensitive data. The prompt requires missing-information flags and separates records, estimates and suggestions. Human review remains necessary. A configured key is not proof of provider quota or successful generation. Errors are reported without replacing existing documents.

Without a key the AI buttons clearly show the missing configuration; all manual project-management features remain available. Never paste secrets into chat or project descriptions.

## Password recovery

Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`, and a valid public `APP_URL`. Port 465 uses TLS; other ports require STARTTLS. Keep credentials on the server. The SMTP service must permit outbound access from the host. Reset links expire in 30 minutes, are single-use, and revoke existing sessions after a password change. The API never returns reset tokens. Live SMTP delivery requires your service credentials and has not been verified in this environment.

## Validation

```sh
npm run build
npm test
npm run test:e2e
```

`npm test` uses temporary databases, a local HTTP server and tests calculations, registration, login, logout, persistent records, invalid input, cross-organisation access, CSRF, edits, duplication and file exports. AI success-path tests use an explicitly mocked provider; these are not evidence of live model connectivity.

Browser tests use `/usr/bin/chromium` by default (change `playwright.config.ts` if needed), start an isolated app on port 3100 and use `/tmp/pm-browser-test` for non-production records. They exercise registration, a project, budget, task, risk, document download, login persistence and mobile navigation. The test server is stopped automatically. Screenshots are written to `/tmp/projectmanager-*.png`.

## Deployment and operations

1. Provision Node 24, TLS reverse proxy and persistent **local** storage. Use a dedicated unprivileged app account. Run `npm ci` and `npm run build` in the checkout.
2. Set `NODE_ENV=production`, `APP_URL=https://your-host.example`, `PORT=3000` and an absolute `DATA_DIR` writable only by the application account. Add AI and SMTP credentials as needed. Run `npm start` with a process supervisor. Production serves `dist/` and requires HTTPS `APP_URL`; cookies are Secure. Forward traffic from your TLS proxy to port 3000; do not expose the internal service directly.
3. Validate `/api/health`, register a real account, create/save records, sign out/in, export documents, test tenant isolation and test configured live integrations before inviting customers. The default rate limits use the direct client IP; behind a shared proxy these are conservative shared limits. Configure a trusted proxy/rate-limit strategy appropriate to your host before scaling. Do not enable arbitrary trust of forwarded headers.
4. For a consistent backup, stop the app briefly and copy the **entire** data directory (including any WAL files) to encrypted storage with restricted permissions. Restart and verify health. Retain backups according to your legal policy and test restore to a separate directory before relying on them. Never expose the data directory through the web server.
5. Restore only while the app is stopped, restoring all identity and organisation databases together. Restart with the restored `DATA_DIR`; verify sign-in and known records. SQLite is single-node; do not mount it on a shared network filesystem or start multiple independent hosts against copied files.

Logs include error categories and upstream status, not passwords, AI keys, prompts or reset tokens. Audit records track project resource changes. There is no public metrics/logging endpoint. Authenticated responses are not cached; the app uses helmet headers, JSON limits, input validation, same-origin/header checks and parameterised SQL.

### Explicit release boundaries

This is a production-oriented starting point, not a completed commercial service. Live AI and SMTP need external configuration and testing. Email ownership verification, MFA, collaborative memberships/roles, invitations, automatic dependency scheduling, earned-value baselines/CPI/SPI, external exchange rates, spreadsheet import, usage-based subscriptions and payments are not implemented. It does not charge users or claim successful payments. No fabricated testimonials or client logos are displayed.

This MVP enforces tenant isolation using separate SQLite databases plus server-side membership checks, rather than claiming PostgreSQL RLS. A managed PostgreSQL deployment with RLS and a fresh isolation test suite is a separate migration. Operational monitoring, off-host backups, final privacy/terms, support contact, account-deletion policy and disaster-recovery drills must be configured by the deployment owner before a public commercial launch.
