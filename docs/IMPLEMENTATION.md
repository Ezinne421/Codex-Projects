# Phase 1 implementation plan

1. Establish TypeScript React frontend, Express server, validation and repeatable commands.
2. Build real account registration, password authentication, expiring sessions and organisation isolation. Use scrypt password hashes and HTTP-only cookies. Password recovery requires SMTP; never expose reset tokens through the API.
3. Persist projects, budget lines, expenses, tasks, risks, updates and documents. All dashboards derive from saved records; new accounts start empty.
4. Provide editable server-generated AI plans and reports with explicit missing-data instructions. Without an API key, expose an honest configuration state and a manual document editor.
5. Calculate finances deterministically in integer minor units; track separate currencies without invented FX conversions. Build task schedules, risk scores and downloadable PDF, DOCX and XLSX documents.
6. Test financial logic, authentication, persistence, cross-organisation access, exports and responsive user journeys. Document deployment and operational limitations.

Phase 2: multi-member invitations and project permissions, dependency propagation, advanced earned value metrics with baseline data, notifications, richer templates. Phase 3: provider-confirmed billing, pricing by market and integrations. These are not presented as implemented.

# Database design

SQLite is the supported single-node MVP backend. `auth.sqlite` stores users (id, unique email, password hash, name, organisation id, country, currency, industry, created timestamp), organisations, hashed sessions and password reset tokens. Foreign keys and unique indexes enforce identity relationships. Each organisation's project records live in a separate SQLite database, selected only from the authenticated server-side membership. The API never accepts a tenant database path. This gives database-file isolation rather than simulated PostgreSQL row-level security. There is no shared project table that a missing WHERE clause can expose across organisations.

Each organisation database contains projects; tasks (project FK, owner, dates, status, progress); budget_items (project FK, category, quantity, rate in minor units); expenses (project FK, budget item FK, date, amount); risks (project FK, probability, impact, warning, mitigation, contingency, owner, review date, status); updates (project FK, text, date); documents (project FK, type, editable content, source, created/updated timestamps); AI history (project FK, model, source references, created timestamp); and audit logs (actor, action, record id, timestamp). All rows have UUID primary keys; child tables cascade on project deletion; project/date indexes serve workspace queries. Subscription and collaborative permissions are deferred rather than unused placeholder records.

Storage access requires a live session and verified membership before opening a tenant database. Every child write also validates the parent project and referenced budget item within the same tenant. Tests attempt both foreign project IDs and child IDs. SQLite files must remain outside the public/static directory and be readable only by the app account. Back up the entire data directory together using SQLite's online backup API. Production horizontal scaling and shared managed storage require a separate PostgreSQL migration with tested RLS policies; do not share SQLite over network filesystems.

# Acceptance boundaries

MVP includes account login, persistent owner workspaces, planning when AI configured, manual editing, budgets/expenses, task and risk updates, recorded progress reports and three export formats. It does not assert email delivery or live AI success without credentials, real-time currency rates, collaboration, subscription charging, or advanced scheduling. No demo metrics, generated market prices or fake successful payments are shown.
