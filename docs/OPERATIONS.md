# Professional workspace operations

## Release and migration

The upgrade preserves existing organisation IDs, projects and records. New tables
are created additively. Tenant migration 1 adds task assignment, weights, calendar
controls, document revision/review fields and activity metadata. Applied versions
are recorded in `schema_migrations`; SQLite uses an immediate transaction and
PostgreSQL uses a transaction plus a schema-specific advisory lock. Repeated
initialisation is safe. Existing owners receive an owner membership on sign-in.
Membership invitations do not move or delete a user's original workspace.

Run `npm run build`, `npm test`, `npm run test:postgres` and `npm run test:e2e`
before deployment. The build compiles the server with NodeNext and loads the emitted request handler
in plain Node, so imports
that work in the development loader but fail in Node production are rejected.
PostgreSQL tests use an embedded compatible engine; validate
new releases against the actual hosted service too. CI performs these checks.

Retain a known-good release. Rolling back application code does not require
removing the additive tables or columns. Do not drop migration data during a
rollback. The previous owner-only app will not expose the new shared-workspace
features until the upgraded app is restored.

## Authentication, invitations and recovery

Workspace roles: owner/admin manage the workspace and access its projects;
member/viewer roles need explicit project grants. A workspace viewer remains
read-only even if a project grant is broader. Project managers manage access,
baselines and review decisions; editors update records; viewers read/export.
Removing workspace membership clears its project grants and assignments.

Invite links keep their token in the browser fragment so it is not part of the
normal page-request URL. They are secrets shown only on creation, addressed to one email, expire
after seven days and are single-use. They are copied and shared by an authorised
admin; this release does not send invitation emails automatically. Never record
links in project descriptions or public tickets.

Recovery kits require the current password. Eight random, hashed, single-use
codes expire after 365 days. Generating a kit replaces the previous one. A
successful recovery changes the password and revokes all sessions, reset tokens
and remaining recovery codes. Advise users to save the kit privately outside the
app. Codes cannot be retrieved later from the database.

Email reset still requires SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD,
SMTP_FROM and a correct HTTPS APP_URL. The server requires TLS/STARTTLS. Test
real delivery after secure provider configuration; a boolean readiness flag is
not proof of delivery. Set SUPPORT_EMAIL to an actual monitored support address.
Do not publish an invented contact or request passwords through support email.

## AI

Set AI_API_KEY through secure hosting configuration; AI_MODEL must be supported
by that provider account. Test a real, non-sensitive plan and verify quota and
error handling. Without credentials the application shows an unavailable state
and provides manual planning and templates. Mocked tests are not live-provider
verification. Review generated drafts before relying on them. Do not put keys
in frontend variables, chat, source control or project documents.

## Scheduling and controlled records

Dependencies support FS, SS, FF and SF with working-day lags. Calendar choices
are Monday–Friday or all seven days. Preview is dependency-based critical path,
not resource levelling. Unconstrained planned tasks can move earlier. Completed
actual dates are retained; fixed-date conflicts block application. Milestones
have zero duration; planned effort is zero. Progress weights determine weighted
completion; they do not constitute earned value or a completion forecast.

Applying a preview checks its data fingerprint and project revision. Review the
preview before committing dates. Baselines are immutable snapshots of saved
project assumptions, budget lines, tasks and dependencies, captured by an
authorised project manager. The comparison shows current forecast dates against
the saved task dates. Workload spreads planned effort over working days and
compares it with member weekly capacity; it does not create an optimised plan.
The interactive scheduler supports up to 2,000 tasks per project. Large exports
and complex programmes need separate scale validation.

Document edits create content revisions and reset review state to draft. The
flow is draft/changes requested → in review → approved/changes requested.
Approvals are tied to a revision. Owner or project-manager self-approval is
explicitly disclosed and recorded; this is not an enforced two-person policy.
Approved revision content is retained. Project activity records decisions and
changes; detailed events start with this release and are not reconstructed as
if they existed in the earlier app.

## Learning synchronisation

Authenticated attempts are stored per account, across workspaces and devices.
Version checks reject concurrent overwrites. Pending device attempts retry on
reconnection or Sync now. Existing device results can be imported; the server
recalculates review intervals from available attempts. Public and standalone
learning remain browser-local. Neither practice results nor imported scores
constitute verified professional competence or certification credit.

## Backups and recovery evidence

The app does not configure the database provider's backup plan. Verify the
actual Supabase plan's backup and restore capabilities and maintain suitable
encrypted exports/off-host copies under your retention policy. Database exports
must include the private auth schema and every organisation schema, not just
public tables. Keep credentials and recovery codes out of backup logs.

Perform a restore into a separate, access-restricted database. Validate known
accounts, workspace grants, project records, version history and exports there.
Record the backup time, restore time, scope, observed data loss/recovery interval
and responsible operator. Do not claim an RPO/RTO or successful recovery until
this evidence exists. Never test a destructive restore over production.

## Monitoring and launch ownership

Monitor `/api/health`, Vercel errors, PostgreSQL connections/storage and external
provider errors. Route alerts to a real owner. Logs deliberately omit keys,
passwords and reset tokens; restrict access to operational logs. CI is release
validation, not a substitute for continuous production monitoring. Configure
provider monitoring/alerts separately and test that an alert reaches its owner.

Before commercial launch, supply the operating legal entity, real support and
privacy contacts, retention/account-deletion process and final applicable terms.
The existing public disclosure is not a completed jurisdiction-specific legal
policy. Review processor agreements, AI data sharing, user consent, security,
accessibility and capacity for the intended customers. Email ownership
verification, MFA, payments, spreadsheet import, automatic FX conversion and
resource levelling remain outside this release. Do not advertise them as enabled.
