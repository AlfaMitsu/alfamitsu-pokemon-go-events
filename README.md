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


## November 8, 2026 — Raids, Max Battles and featured posters
- Removed 8 monthly GO Pass items from the Event Tracker because GO Passes are reward tracks, not independent events.
- Added 91 historical five-star, Mega and weekend Shadow raid rotations and 43 historical weekly Dynamax Max Battle rotations covering 2026.
- Raids and Max Battles have separate tracker rows with source-backed featured Pokémon and event details.
- All generated historical SVG poster artwork is refreshed with actual Pokémon sprite graphics or event-themed highlight graphics; AlfaMitsu original posters still take priority.
- Historical schedules are based on monthly published calendars; recurring rotation end dates may change at 10 a.m. local rather than midnight.


## November 8, 2026 — Featured-Pokémon poster rendering
- Added `/api/event-poster?id=EVENT_ID` for generated/custom event poster artwork. Each poster shows the listed featured Pokémon or a clearly labeled event-theme illustration.
- Generated raid posters display the featured raid bosses; generated Max Battle posters display the Dynamax Pokémon; community days use their featured species.
- Existing supplied posters retain priority and are never replaced by the generator.
- Poster PNG rendering uses the Next.js `ImageResponse` API, fetches Pokémon artwork with a cached fallback, and prevents broken calendar graphics when an image is unavailable.
- Event-list poster previews are lazy-loaded to reduce loading a large historical archive all at once.


## November 8, 2026 — Authentic Pokémon images and costume fallback
- Corrected missing Pokémon images across the tracker, with a larger ID mapping and resilient image lookup.
- Uses verified Pokémon GO mined costume sprites when a real named costume file can be matched. Includes exact GO sprites for Crowned Sword Zacian and Crowned Shield Zamazenta.
- If a costume cannot be verified, displays the real base Pokémon appearance rather than a fabricated costume, with a neutral fallback only if no source returns an image.
- Sources: https://github.com/PokeMiners/pogo_assets and https://github.com/PokeAPI/sprites.
- Website Updates & Changelog has been synchronized.


## November 8, 2026 — Missing artwork fixes
- Added a complete Pokémon species ID table sourced from the public PokéAPI Pokédex repository, including Hawlucha (#701).
- Fast-paths standard species to real Pokémon artwork rather than relying on repeated live lookups.
- The Singapore PokéXciting! Pikachu is the blue-costumed version, not Kuala Lumpur's turquoise version. If the exact sprite is not available, shows the real species rather than an incorrect costume.
- Updated Singapore and Mexico City event featured Pokémon; preserved all events and supplied posters.


## November 8, 2026 — Real costume and variant image fix
- Expanded the real Pokémon GO asset index to include both event costume codes and alternate form codes (not only c-prefixed costumes).
- Verified and mapped Pikachu in a kurta, alongside supported Gigantamax and crowned-form artwork.
- Updated Festival of Lights, Halloween, and Teddiursa Spotlight Hour featured Pokémon to correctly specify their costumes.
- Other costume names only resolve to exact costume sprites when the actual asset name supports that match. No random outfit or false costume substitutions.
- Unmatched costumes continue using authentic base species art to prevent blank tiles.
- Preserved existing events, README and website changelog synchronization.

- Supplemented exact-form artwork with real published imagery for witch-hat Teddiursa (Pokémon.com), saree Pikachu, and the 2026 hat-and-capelet Pikachu. Online images are checked before selection; source URLs live in `app/api/pokemon-image/route.ts`.


## November 8, 2026 — Generated poster image resolver fix
- Fixed the **separate** generated poster renderer: it previously used a small hardcoded dex and could show blank symbols for named costumes such as Singapore Blue PokéXciting! Pikachu.
- The renderer now uses the shared 1,025-species Pokédex index and authentic PokeAPI artwork fallbacks.
- For Singapore Blue PokéXciting! Pikachu, the renderer attempts to locate the actual blue costume image on its dedicated Dittobase Pokédex entry first, then shows Pikachu's real official artwork if the third-party image cannot be reached.
- Crowned Zacian/Zamazenta and available Gigantamax forms use actual Pokémon GO assets.
- Kept the website changelog synchronized with GitHub README.


## November 8, 2026 — Missing event-card artwork and details
- Added verified featured Pokémon to regional mall explorations, Pokémon Night Out London, Pokémon RUN 30 Taipei, Festival Walk Hong Kong, Into the Wild, GO Wild Area Global, and Minior Leonids.
- Poster routing now uses the event-specific generated Pokémon artwork only when featured species are known. Otherwise it uses the existing supplied/local poster, avoiding hollow icon placeholders on unrelated event cards.
- Event-card image failure first falls back to its existing poster and then the generated event graphic.
- Corrected Festival Walk Pokémon GO Mall Exploration gameplay dates to November 9, 2026–January 3, 2027, from the official notice.
- Updated event source links and website changelog in the same GitHub production release.


## November 8, 2026 — GO Weekly image-first cards
- Fixed text-only graphics in the GO Weekly Raids and Max Battles rows: when featured Pokémon are known, each calendar card now shows large real Pokémon images on the right over a contrasting gradient, with concise title/date information at left.
- Added featured-Pokémon mappings for Cresselia, Darkrai, Mega Banette, Shadow Tornadus, Cresselia/Darkrai Raid Hour, Eternatus, Dynamax Trails and Pawniard Community Day.
- Preserved existing full event posters for cards without known featured Pokémon, and retained the event detail views, data sources, and weekly calendar navigation.
- Synced Website Updates & Changelog to this GitHub release.


## November 8, 2026 — Weekly calendar imagery and changelog consolidation
- Replaced giant text-only GO Weekly cards for Dynamax Espurr, Max Monday Espurr, Dynamax Cryogonal, Max Monday Cryogonal, and Twilight Wishes with real Pokémon pictures.
- Regional custom poster cards with verified featured Pokémon (including party-hat Pikachu at SM Southmall) now show Pokémon rather than generic text-only poster art; supplied/web posters remain intact.
- Twilight Wishes features scarf Espeon, scarf Umbreon, and Rockruff (source: https://leekduck.com/events/twilight-wishes-2026/). Exact costumes use actual Pokémon GO assets when available, with species artwork fallback.
- Tropical Paradise remains unconfirmed with unknown encounters: its weekly card uses a neutral illustrated theme and does not assign fictional Pokémon.
- Consolidated repetitive November 8 website changelog cards into three themed entries without deleting older distinct releases.
- The latest website changelog and README describe the same deployed changes.

- Noibat Spotlight Hour (November 26) now displays real Noibat artwork in GO Weekly and the generated event poster instead of a text-only tile; this fix is included in the consolidated November visual-improvements changelog.
