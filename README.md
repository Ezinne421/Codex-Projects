# ProjectManager AI Africa

A professional project-management workspace: React + TypeScript + Tailwind, Express, SQLite for local development, and managed PostgreSQL for Vercel. Empty accounts start with real empty states. No sample project progress or financial metrics are seeded.

Read [the implementation plan and database design](docs/IMPLEMENTATION.md).

## Run locally

Requires **Node.js 24.15 or newer in the 24.x LTS line** and npm. Run from the repository root:

```sh
npm ci
cp .env.example .env
npm run dev
```

Open the app on port **3000**. Register an account to create a private organisation. Each new registration creates a distinct organisation; this release does not have team invitations. For another port, set both `PORT` and `APP_URL` in `.env`. The application loads `.env` on startup. Restart after configuration changes; development does not automatically restart the backend.

When `DATABASE_URL` is unset, local development data persists in `.data/` (or the absolute `DATA_DIR`). When it is set, accounts and projects use PostgreSQL instead. This directory is ignored by Git, outside the web root, and must be on a persistent local disk. Do not delete it to refresh the app. Never commit `.env`, keys, databases or backups.

## What works

- Registration, sign-in, seven-day HTTP-only sessions, logout, persistent accounts and one-time recovery kits; email password recovery when SMTP is configured.
- Organisation-isolated project creation, editing, deletion and plan duplication. Duplication copies planned tasks, budget items, risks and documents; it excludes expenses and progress updates.
- Budgets with quantity/rate calculations, contingency, tax, actual expenses, remaining budget, variance, utilisation and non-persistent what-if scenarios. Money is stored in integer minor units; each line rounds once. Tax applies to subtotal plus contingency. The configured tax is a user assumption, not tax advice.
- NGN, USD, GHS and KES, kept separate. There are no fabricated currency conversions. Dashboard financial totals include only the selected currency.
- Editable tasks with owners, dates, status and progress; schedule bars and overdue indicators. A Done task must have 100% progress.
- Editable risks, scores, warning indicators, mitigations, contingency, owner and review date.
- Dated progress records; manual document authoring and editing; AI plans, progress reports and contextual advice when configured.
- PDF and DOCX summaries / individual documents; XLSX workbook containing budgets, actual expenses, tasks, risks, updates and documents. Export access requires the same project permissions as viewing.
- Responsive public pages and application screens, empty/loading/error states and text search.

## Generate project management templates

Open **Templates** in the sidebar or inside a project workspace. The library contains 16 templates: project plan, proposal, charter, Terms of Reference, WBS, work plan, business case, budget, risk register, procurement plan, monitoring & evaluation plan, meeting minutes, weekly report, monthly report, lessons-learned report and closure report.

Choose a template, optionally select a project, and fill in the template-specific details. **Generate template** produces an editable draft. Save it to the project's Documents tab for PDF / Word export, or download HTML / text directly without a project. These are rule-based templates, independent of the AI provider. Unknown information stays in brackets; approvals, market prices and verified achievements are never invented. Reporting dates filter recorded progress updates; financial and task snapshots are explicitly cumulative current data.

The standalone edition has a **Templates** button at the top and the same library. Download `standalone/projectmanager-ai-africa.zip`, extract it and open the HTML in Chrome. To move records from an older file, export a JSON backup from that file and restore it in the new edition. File locations can affect browser storage. The local edition has no account authentication or server synchronisation.

Template definitions and generation logic live in `shared/templates.ts`. `npm run build` synchronises that engine into the self-contained HTML. `npm run package:standalone` also creates the downloadable ZIP (Python 3 is needed for ZIP packaging only). Keep the generated HTML and ZIP in sync when publishing updates.

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

`npm run test:postgres` runs the API and persistent rate-limit checks against a PostgreSQL-compatible embedded engine; it does not validate a live managed database.

`npm test` uses temporary databases, a local HTTP server and tests calculations, registration, login, logout, persistent records, invalid input, cross-organisation access, CSRF, edits, duplication and file exports. AI success-path tests use an explicitly mocked provider; these are not evidence of live model connectivity.

Browser tests use `/usr/bin/chromium` by default (change `playwright.config.ts` if needed), start an isolated app on port 3100 and use `/tmp/pm-browser-test` for non-production records. They exercise registration, a project, budget, task, risk, document download, login persistence and mobile navigation. The test server is stopped automatically. Screenshots are written to `/tmp/projectmanager-*.png`.

## Deployment and operations

For the full app on Vercel, follow [the Vercel deployment guide](docs/VERCEL.md). It requires a Vercel account and a dedicated managed PostgreSQL database, supplied securely as `DATABASE_URL`. Vercel deployments refuse ephemeral SQLite storage. The commands below describe the alternative single-node hosting mode.

1. Provision Node 24, TLS reverse proxy and persistent **local** storage. Use a dedicated unprivileged app account. Run `npm ci` and `npm run build` in the checkout.
2. Set `NODE_ENV=production`, `APP_URL=https://your-host.example`, `PORT=3000` and an absolute `DATA_DIR` writable only by the application account. Add AI and SMTP credentials as needed. Run `npm start` with a process supervisor. Production serves `dist/` and requires HTTPS `APP_URL`; cookies are Secure. Forward traffic from your TLS proxy to port 3000; do not expose the internal service directly.
3. Validate `/api/health`, register a real account, create/save records, sign out/in, export documents, test tenant isolation and test configured live integrations before inviting customers. The default rate limits use the direct client IP; behind a shared proxy these are conservative shared limits. Configure a trusted proxy/rate-limit strategy appropriate to your host before scaling. Do not enable arbitrary trust of forwarded headers.
4. For a consistent backup, stop the app briefly and copy the **entire** data directory (including any WAL files) to encrypted storage with restricted permissions. Restart and verify health. Retain backups according to your legal policy and test restore to a separate directory before relying on them. Never expose the data directory through the web server.
5. Restore only while the app is stopped, restoring all identity and organisation databases together. Restart with the restored `DATA_DIR`; verify sign-in and known records. SQLite is single-node; do not mount it on a shared network filesystem or start multiple independent hosts against copied files.

Logs include error categories and upstream status, not passwords, AI keys, prompts or reset tokens. Audit records track project resource changes. There is no public metrics/logging endpoint. Authenticated responses are not cached; the app uses helmet headers, JSON limits, input validation, same-origin/header checks and parameterised SQL.

### Explicit release boundaries

This release includes shared workspace/project roles, invitation links, dependencies,
calendar-based schedule previews, baselines, document revision/review, in-app
notifications and account-synced learning. Live AI and email delivery still need
secure provider configuration and actual end-to-end testing. One-time recovery
kits provide a separate, tested recovery option without SMTP.

Email ownership verification, MFA, resource levelling, project-derived earned
value baselines/CPI/SPI, external exchange rates, spreadsheet import, billing and
payments remain outside this release. It does not charge users or invent
successful provider connections. PostgreSQL schemas are private with API-role
privileges revoked and RLS enabled; the privileged server enforces membership and
project permissions. SQLite remains a single-node development option.

The deployment owner must configure backups and verify a restore, monitoring
and alerts, real support/privacy contacts, retention/account deletion and final
legal terms before a commercial launch. These are not asserted to be configured
by this code release. See [Operations](docs/OPERATIONS.md).

### Knowledge Centre

Open **Knowledge Centre** in the app menu, public website navigation/footer, or
standalone HTML header. The library contains 738 original definitions across 29
topics in project and operations management: governance, scope, scheduling,
finance, earned value, Agile, risk, quality, Lean, inventory, procurement,
supply chains, maintenance, people, monitoring and evaluation, service management,
business analysis, African delivery contexts and management documents.

Search terms, acronyms and definition text; combine topic and A–Z filters, open
related definitions, save bookmarks and export the filtered glossary as CSV.
Selected metrics include formulas, assumptions and illustrative examples. Saved
terms stay in the current browser (scoped per account in the hosted app); they
are not shared organisation records. Public access requires no account.

The catalogue is a broad reference, not an exhaustive list of every possible
framework-specific term. Summaries are original explanations. Official sources
are linked for further study and do not imply endorsement. For formal work use
the definitions required by the applicable organisation, framework or contract.

Maintain entries and references in `shared/knowledge/catalog.ts`; shared search
and CSV logic live in `shared/knowledge/search.ts`. The hosted UI lazy-loads this
library. `npm run sync:standalone` embeds the same catalogue, search engine,
styles and offline interface into the single HTML file. Definitions, bookmarks
and CSV exports work without internet; external reference links require access.

#### Skills refresh and practice

The Knowledge Centre opens on **Learn & refresh**, with 24 original lessons,
six guided learning paths and 48 scenario questions. Lessons cover value,
governance, planning, cost and earned value, risk, quality, change, engagement,
Scrum, Kanban, hybrid delivery, responsible AI, data, evaluation, procurement,
operations, inventory, Lean, reliability, sustainability and handover. Each
contains a learning objective, explanation, recommended steps, worked decision,
common mistake, application task, connected glossary terms and further reading.

Passing a lesson schedules recall after 1, 3, 7, 14 and 30 days. Same-day or early
retakes do not advance the interval; an unsuccessful check resets it to one day.
The due-review view and learning paths use saved browser progress, scoped per
account in the hosted app. Progress is not synced across devices and does not
represent certification, eligible training hours or PDUs.

**Practice lab** offers earned value/EAC, PERT, Little's Law and OEE exercises
with explicit assumptions, input checks and results. They use illustrative input,
not stored project records. **Current guidance** provides dated, manually curated
summaries and official links. It is not a live feed; a warning appears when the
source review snapshot is over 90 days old. Check official requirements before
making certification or framework decisions.

Learning material is in `shared/knowledge/learning.ts`; progress scheduling,
validation and calculator logic are in `shared/knowledge/practice.ts`. The same
`src/LearningHub.tsx` runs in the hosted app and, bundled without external assets,
in the standalone HTML. Source review notes are in `docs/knowledge-source-review.md`.


#### Expanded practitioner glossary

The additional 200 entries cover eight areas: advanced planning and schedule
risk; commercial, construction contracts and disputes; programme and portfolio
investment; leadership and organisational learning; product discovery, DevOps
and AI; queueing and production simulation; industry-specific delivery; and
African trade, community and delivery contexts.

**250 entries** now include an original example, a practical application and a
common mistake. **50 bidirectional concept comparisons** explain distinctions
such as verification/validation, claims/variations, continuous delivery/deployment,
ATP/CTP, consultation/consent and local content/supplier localisation. Use the
**With examples & applications** and **With comparisons** filters in the Glossary.
Search covers the deeper guidance, and CSV exports include applications,
pitfalls, comparisons, related terms, references and available review dates.

New topic content is in `shared/knowledge/expansion.ts`. Existing-term guidance,
comparisons and selected advanced formulas are in `shared/knowledge/insights.ts`.
Keep original summaries, model assumptions and illustrative examples together.
Do not turn context-dependent contract or country requirements into universal
rules. Use the relevant authoritative reference and actual governing framework
for formal decisions. References are further reading, not attributed quotations.


### Professional workspace upgrade

The public site and application have a new editorial identity: self-hosted
Manrope/Newsreader typography, a custom mark, deep plum, warm paper and citrus,
original layouts and licensed project photography. PMI's professional tone is a
reference; its branding and proprietary fonts are not copied. Asset provenance
is documented in [ASSETS](docs/ASSETS.md).

- **Team & access:** create one-use, email-matched invitation links; manage roles,
  capacity and workspace switching without losing an original workspace.
- **Team & discussion:** grant project access, post discussions and mentions;
  task assignments use actual members and generate inbox notifications.
- **Schedule & baselines:** define four dependency types and working-day lags,
  preview critical path/float, resolve conflicts, apply a current preview and
  capture immutable approved snapshots. Workload reports capacity separately.
- **Document control / Activity:** retain content revisions, submit/review
  specific versions, approve or request changes and inspect recorded history.
- **Knowledge Centre:** signed-in learning progress syncs across devices and
  completed lessons lead to a relevant project template. The public/offline
  editions remain local.
- **Settings & account:** generate private recovery codes, download the kit and
  inspect actual AI/email/support readiness. Email credentials are not invented.

Database changes are additive and versioned; tests preserve original records.
CI checks SQLite, PostgreSQL semantics, build and browser workflows. See
[Operations](docs/OPERATIONS.md) for deployment and real-world release boundaries.
