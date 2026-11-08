# AlfaMitsu Services — Next.js Event Tracker V12

Next.js App Router + React + Tailwind + reusable shadcn-style UI primitives (Button, Card, Input built with Radix Slot, class-variance-authority, clsx, tailwind-merge). Public/no account. The existing 14 poster assets live in `public/posters`.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000. `npm run build` for production; deploy this project directory to Vercel as a **Next.js** app. Internet connectivity is required for first-time npm installation and for remote data calls.

## Data caveats

- `/api/raids` fetches Leek Duck every 30 minutes and parses image alt names from the published page (no official public JSON API); parsing can break if the upstream site changes. Failures are explicitly flagged and a *dated historical reference* is shown instead of claiming stale data is live. Regional raid schedules may vary.
- `/api/pokemon` proxies PokeAPI on demand; its main-series stats and provided `rankIV` level multiplier are **approximations**, not exact Pokémon GO PvP ranking logic. Compare with pvpivs.com for accurate rankings.
- Max Particle shop packs, raid rewards and pass prices are **user-editable estimates**, not guaranteed store values. Pokémon Stardust and Candy costs are rough modeling estimates; verify in-game.
- Rocket Leaders and Giovanni are a dated roster. Grunt type counters are generic; exact current lineups must be checked at Leek Duck.
- The page preserves saved event name/schedule/posters but does not claim a complete new write-up for each poster.
- No account. Local data only. This source is a **test build**, not deployed.


## V14 raid and Rocket changes
Added the Leek Duck October 30 raid snapshot across all tiers, Shadow and Dynamax Max Battle. The snapshot automatically expires; this is NOT a live API for future rotations. Rocket portraits use original Leek Duck CDN URLs and fall back to locally bundled drawings when blocked.


## V15 Raid Planner changes
- Exact display order: Mega Legendary, Gigantamax, Legendary, Mythical, Ultra Beasts, Mega, Shadows, 3 Star, 1 Star.
- Regular Dynamax is not listed in Raid Planner; separate Max Battle Calculator remains.
- Region-exclusive raids are supported with `region` in the raid API records and a dedicated list. No regional boss is claimed active without confirmation.
- The October 2026 roster is a dated snapshot, not a live automated feed.

## V16 regional raids and counters
- Verified PokéPark KANTO seasonal Articuno raids (Oct–Jan). Source: https://pokemongo.com/news/ppk_launch
- Field Museum Chicago Excavator Pikachu and Mega Aerodactyl raids, May 22 2026–Apr 11 2027. Source: https://pokemongo.com/en/news/pgo-pokemon-fossil-musuem-chicago-2026
- Boss counter Pokémon shown in every raid card (illustrative picks; not a DPS simulation).
- No other region-restricted wild Pokémon are implied to be raid bosses. Global snapshot expires independently.

### V17 — Raid end dates and Shadow ordering
- Every listed raid displays its known ending date or an explicit 'not confirmed' message.
- The Shadows category is ordered by tier: Shadow 5-Star, then Shadow 3-Star, then Shadow 1-Star.
- Articuno's seasonal raid period ends in January 2027; the official announcement does not give an exact day, so the display does not claim one.
- Fossil Museum Pikachu and Mega Aerodactyl continue through April 11, 2027.
- Current raid rotation data remains a dated snapshot, not a reliable live feed.

## V18 changes
- Removed the duplicate region-exclusive section. Confirmed regional raids appear only in their regular tiers with location and availability labels.
- Added the official European Space Agency Astronaut Pikachu 1-star raids (6 museums, October 4, 2026–April 30, 2027).
- Fixed suggested-counter images: image URLs are resolved by Pokémon name through the PokeAPI endpoint instead of an incomplete mapping that incorrectly defaulted to Pikachu. Missing images use a neutral symbol, never a wrong Pokémon.
- This remains a dated regional/raid snapshot, not a complete live raid API.
- Sources: https://pokemongo.com/news/european-space-agency-event ; https://pokemongo.com/news/ppk_launch ; https://pokemongo.com/en/news/pgo-pokemon-fossil-musuem-chicago-2026


## V19
- Four recommended counter Pokémon for every raid, including regional and Shadow raids.
- Mega Charizard Y now uses `charizard-mega-y` from PokéAPI, preferring official artwork; Mega forms are no longer stripped from counter sprite requests.
- Raid category ordering and original posters preserved.


V24: Removed Raid & Coin Estimate. Website Visitors now appears as its own navigation destination (left sidebar or mobile menu). Requires Upstash configuration as documented in README_ANALYTICS.md.


V26: Visitor counts (Online, 1 Day, 7 Days, 30 Days) display directly in the header beside the logo on desktop and on a compact second header row on mobile. No analytics page is needed. Counts remain unavailable (—) until a database is configured.


## November 8, 2026 — In-person poster display fix
- Weekly Event Tracker tiles now display an assigned poster image before attempting a Pokémon sprite fallback.
- Fixes blank-looking Sendai and Mexico City in-person 5-star raids, 3-star raids and Max Battles where the original poster files were already included.
- Added the same release note to the website's Updates & Changelog.
- The November–December event artwork and new poster files remain a separate pending synchronization; this commit does not claim to import them.


## November 8, 2026 — Historical events and posters release
- Added historical event entries covering January through October 2026, with relevant public calendar source links and individual AlfaMitsu archive artwork.
- Completed events are visible by default in Events List; toggle Show completed events to hide them.
- Corrected November 28 Mega Clefable Raid Day details and added unconfirmed December event placeholders distinctly labeled as datamines, with illustrative art.
- Poster priority remains AlfaMitsu originals, G47IX, FlareBlaze, verified internet posters, then event-specific custom graphics. Archive graphics are custom illustrations rather than official event posters.
- The in-person Wild Area guide posters and existing published event records were preserved.
- Historical archive is a best-effort backfill; further region-exclusive or earlier-year events may still need verification.
