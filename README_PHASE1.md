# AlfaMitsu Services — Phase 1 Quality & Owner Review

The public Event Tracker, existing calendar, raid tools, original posters, historical archive and calculators are preserved. No public trainer account is required.

## Owner dashboard

- Owner sign-in: `/admin/login`
- Private dashboard: `/admin`
- Build-time quality findings: `/api/admin/quality` (401 without a valid owner session)
- No dashboard navigation link appears in the public site.
- The dashboard lists event IDs, issue codes, severity, suggested fixes, filters, browser-local review decisions and complete JSON export.
- Review decisions do **not** edit published event data or synchronize across devices. Export the report and apply reviewed source changes via GitHub.
- Every production/preview build runs the event and poster checks and writes a fresh private report to `lib/quality-report.json`. Clicking Reload refreshes this deployment's report. External URLs and image CDNs are not probed during builds.

## Authentication (required before owner login can work)

Configure two **Sensitive** server-side variables in the Vercel project for the desired environment:

- `ALFAMITSU_ADMIN_PASSWORD_SHA256`: lowercase SHA-256 hex digest of a strong unique password
- `ALFAMITSU_ADMIN_SESSION_SECRET`: cryptographically random string of at least 32 characters

Never put the plaintext password or session signing key in GitHub, in client-side variables or in issue reports. Keep the secret to rotate authentication if needed.

Sessions are HMAC-SHA256 signed, HttpOnly, Secure, SameSite=Strict, host-only and expire in eight hours. Login/logout require a same-origin POST. No login is accepted when either server variable is missing or invalid, and all private API endpoints return unauthorized without a valid session.

This dashboard uses a high-entropy password and no server-side rate-limit database. If replacing the owner access key with a human-memorable password, first add persistent rate limiting and alerting.

## Checks

- Required `npm run check:events`: IDs, names, date ranges, event links, local images, generated poster references, source metadata and artwork labels. Fatal integrity issues exit nonzero.
- Required `npm run check:posters`: original poster file existence, nonempty size, allowed extensions and basic file-signature warnings.
- `npm run test:quality`: deterministic regression tests using Node's built-in test runner.
- `npm run check:quality`: combines the above audits and tests.
- `npm run build`: performs the mandatory audits automatically.

Only confirmed local integrity violations block deployment. Unsupported/ambiguous timezones, external source issues and uncertain metadata are reported as warnings for review, not silently rewritten. Original AlfaMitsu poster priority remains unchanged.

## Safe deployment

1. Work on a branch and run quality tests / production build.
2. Check a Vercel preview, including unauthenticated rejection at `/api/admin/quality`.
3. Merge to `main` only after passing checks and review the production deployment.
4. Preserve the previous production deployment as a rollback target.

## Current scope and follow-up

The quality check validates repository records and bundled local poster references. A live external HTTP image/link checker, automated correction proposals and shared server-side review state can be added later; they are not claimed to be provided by this phase.
