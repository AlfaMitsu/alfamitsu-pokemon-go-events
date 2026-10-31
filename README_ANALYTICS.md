# Website visitor analytics (test)

The **Website Visitors** dashboard now has a dedicated top-level navigation entry. The Raid & Coin Estimate tool is removed.

## Connect analytics for genuine values

1. In Vercel's project Storage integrations, create/connect an Upstash Redis database.
2. Set `KV_REST_API_URL` / `KV_REST_API_TOKEN`, or `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`, in project environment variables. Keep token server-side only.
3. Redeploy, open the site, and wait for visits to be recorded.
4. Open **Website Visitors** from the left navigation (or mobile menu).

The tracking API logs one anonymous random browser ID and its latest seen time in Redis (up to 31 days). It does not record IP, names, or email in the database. Count metrics are unique browsers in rolling 24h, 7d, and 30d windows. Current users estimate is the last five minutes. Visitors who clear browser storage can be counted as new browsers. Tracking is not retrospectively available and needs Redis connected for real statistics; otherwise the dashboard explicitly states unconfigured.

Regular raid rotation auto-updates from V22 are preserved.


V26: Visitor counts (Online, 1 Day, 7 Days, 30 Days) display directly in the header beside the logo on desktop and on a compact second header row on mobile. No analytics page is needed. Counts remain unavailable (—) until a database is configured.
