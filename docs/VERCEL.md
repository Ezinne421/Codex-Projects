# Deploy the full application on Vercel

This deploys the React app plus the Express API, with real online accounts and persistent PostgreSQL records. It does **not** deploy the browser-only HTML edition. `vercel.json` builds the frontend into `dist`, routes `/api/*` to `api/index.ts`, and embeds the licensed Unicode font in a server-only module for reliable PDF exports.

## Account and database prerequisites

You need access to your Vercel account and a **managed PostgreSQL database**, including an existing Supabase project. The application creates its own private `pm_ai_africa_auth` schema for accounts and one private schema per organisation. It does not use or modify Supabase public tables. Use a privileged server-side connection that can create schemas and tables; never use an anonymous browser key as a database credential. A separate database remains preferable where operational isolation is needed.

The local onboarding workspace is not signed into Vercel and contains no database connection. A prepared repository is not a live deployment. Never put connection strings, passwords or access tokens into chat, GitHub files or the frontend.

## Deploy using the Vercel dashboard

1. Open https://vercel.com/new, sign in, and import **Ezinne421/Codex-Projects** from GitHub. Use the repository root. Keep the checked-in `vercel.json` settings: framework **Other**, build **npm run build**, output **dist**, Node **24.x**. Do not set the root directory to `standalone`.
2. In Vercel Storage / Marketplace, connect a managed PostgreSQL service such as Neon, or use your own dedicated PostgreSQL database. Choose a database region near the function region. Review your provider's pricing and backup options before provisioning.
3. Add the connection string as the encrypted environment variable **DATABASE_URL**, available in Production and in any Preview environments that should use it. Keep TLS certificate verification enabled. Prefer a separate database for previews to avoid test changes to production records. Provider-generated variables with another name must be mapped to `DATABASE_URL`; this app does not guess a database from unrelated variables.
4. Leave Vercel's system environment variables enabled. The app derives its HTTPS URL from `VERCEL_PROJECT_PRODUCTION_URL` / `VERCEL_URL`. For a custom domain, set **APP_URL** to that exact HTTPS origin and redeploy.
5. Optionally add **AI_API_KEY** and **AI_MODEL** for live AI generation. The 16 structured management templates do not need an AI key. Add SMTP configuration only if you need password-recovery emails (see README).
6. Click **Deploy**. The application refuses to fall back to temporary SQLite files on Vercel if `DATABASE_URL` is missing. If a required variable changes, redeploy so it reaches the running functions.
7. Open the actual URL reported by Vercel. Verify `/api/health` returns `{"status":"ok"}`. A database outage or missing configuration must be resolved before inviting users; a static homepage alone does not demonstrate readiness.

## Connecting an existing Supabase project

In the selected Supabase project's **Connect** dialog, choose its PostgreSQL transaction pooler connection string. Replace the password placeholder with the existing database password, then enter the complete string as `DATABASE_URL` in Vercel's encrypted Production environment settings. Never paste it into chat or source files. Do not reset a shared database password just to connect this app; doing so could break other services. The connection must use a database owner/admin role with permission to create schemas, and preserve TLS verification.

This app uses its existing server-managed accounts; using Supabase for PostgreSQL does not automatically migrate accounts to Supabase Auth. Existing Supabase public data remains separate. No new Supabase project is created when reusing the connection.

## Acceptance checks on the live deployment

- Register an account, create a project, record budget lines and expenses, and check the totals.
- Open Templates, generate and edit a document, save it, then download its PDF / Word export.
- Sign out and sign in again. Check the same records remain after a new deployment or cold start.
- Register a second account. It should start with an empty organisation and must not access the first account's project IDs, exports or records.
- Verify secure cookies and your HTTPS domain. Test live AI and recovery email only after their credentials are configured. Mocked-provider tests do not establish live service access.

## Runtime design and operations

PostgreSQL connections are leased per HTTP request, so concurrent registration and project transactions do not share a transaction. Authentication records live in private `pm_ai_africa_auth`; organisation records live in server-selected `pm_org_<uuid>` schemas. Parameterised SQL and server-side membership checks scope access. These schemas revoke public/API-role privileges and enable row-level security without public-access policies. The privileged server role owns the tables and uses server-side membership checks; the Supabase browser API must not access these records.

Rate-limit counters are also stored in PostgreSQL, so separate Vercel instances and cold starts share limits. Session tokens remain hashed; password resets expire and revoke existing sessions. Connections preserve provider TLS verification; no certificate checks are disabled. The function has a 60-second limit; AI requests time out earlier so failures can be reported cleanly.

Enable the database provider's backups and test restore to a separate database. Monitor function and database errors without logging credentials or confidential project records. Vercel/serverless response and execution limits apply; very large exports may require a later background-export service.

Local SQLite data is preserved in `.data` for development, but is **not automatically migrated** to PostgreSQL. The new hosted database starts empty. Back up existing local records before a separate migration. The downloadable HTML edition keeps its own browser-local data and does not synchronise with hosted accounts.

## Agent / CLI deployment

After the operator has provided account access and securely configured the database, the CLI sequence is:

```sh
vercel login
vercel link
# Set DATABASE_URL securely in the Vercel dashboard for the linked project.
vercel deploy --prod
```

Do not pass raw secrets in command arguments or commit downloaded environment files. `.vercelignore` excludes databases, local environment files and development outputs. Deployment publication is authorised by the user's request, but it still requires working account access and database configuration. Report the real deployment URL only after the provider returns one and the live checks pass.

## Local validation

`npm test` exercises the SQLite development path. `npm run test:postgres` runs the same API suite and persistent rate-limit tests against an embedded PostgreSQL-compatible engine, including organisation-schema isolation. This validates SQL/application behavior, not live managed-database networking, credentials, TLS or Vercel's deployed runtime. `npm run build` checks types and produces frontend assets. Browser checks run with `npm run test:e2e`.
