# AlfaMitsu Services — Phase 4: Advanced Raid & Max Battle Guides

This release **extends** the existing Pokémon GO website; it does not replace the Event Tracker, original Raid Planner, Max Battle Calculator, Eternatus budget/power-up tool, My Events, Phase 2 GO Weekly calendar or Phase 1 private quality dashboard.

## User-facing implementation

- A **Battle Guides** tab appears in Tools, beside the original Raid Planner, Max Battle Calculator and other tools.
- Raid guide: choose from the existing `/api/raids` feed (respecting its source status, region, available-until fields and uncertainty) or inspect a named Pokémon. View sourced Pokémon species/form typing, GO type matchups including 2.56× dual weaknesses, resistance tiers, selectable weather and STAB scenarios, and the existing illustrative counter list. All illustrative counters are labeled **not ranked simulation results**.
- Max guide: draw upcoming featured Pokémon and event sources from the **existing, unchanged** event database. Review ordinary Dynamax vs. Gigantamax Max Attack behavior, Max Guard, Max Spirit, three-turn Max phases, team roles, three-Pokémon lineups and in-game Max eligibility.
- Team planning: enter up to six raid Pokémon or three Max candidates. Their species/form typing is looked up before displaying **possible type coverage**, never an unsupported DPS, battle time, simulator estimator, GO moveset, or trainer-count claim. Max eligibility and role are explicit visitor-provided inputs. The guide does not falsely claim a Pokémon can learn a particular GO move.
- Standard Max Move resource preview: editable species Candy groups A–D with 400/600/800 MP for levels 1/2/3, plus Candy/Candy XL. Known exceptions such as Eternatus or Crowned forms are flagged; the existing separate Eternatus tool remains accessible.
- Dedicated quick links lead back to the exact **existing** Raid Planner and Max Battle Calculator rather than cloning or replacing them.
- Event Detail includes a context-aware guide link. Raid Planner cards link directly into the chosen boss guide. The existing Max calculator links back into the new Max guide.

## Source policy and mechanic limits

- Species and exact-form typing comes from PokéAPI `/api/v2/pokemon/{form}` through an allowlisted, validated, cached server endpoint `/api/battle-profile` (subject to availability). Missing exact forms do not silently fall back to a potentially incorrect form typing. Visitors may select the correct type manually; this is visibly marked as **unverified**.
- **GO mechanics differ from main-series games:** GO super effective = 1.6×, resisted = 0.625×, immunity tier = 0.390625×. STAB and boosted move weather = 1.2× where applicable. Weather does not imply the move or its availability is verified.
- Primary mechanics reference: https://pokemongo.com/en/max-pokemon-battle
- Type chart/reference: https://www.poketools.com/pokemon-go-type-chart
- Raid simulations and methodology: https://www.pokebattler.com/raids/guides and https://www.pokebattler.com/help/
- Max upgrade cost reference, including special exceptions: https://db.pokemongohub.net/items/max-particles
- The public raid roster is still supplied by the website's existing source with its own refresh/fallback policy. Its counters remain **examples**, not DPS/TDO ranks or independently simulated recommendations.
- GO moveset data and move-specific DPS are deliberately **not** inferred from main-series PokéAPI move lists. For real battle estimators and specific movesets, the guide links users to current external simulations. This distinction is required to avoid fabricated ratings.

## QA and release

- `node --test tests/go-battle-guides.test.mjs`: 18 types, 1.6/2.56×, GO immunity tier, weather/STAB, invalid types, Max upgrade totals and candidate sort without fake statistics.
- The existing `npm run build` tests all `tests/*.test.mjs` suites automatically and runs the Phase 1 event/photo integrity checks.
- Preview: check Tool navigation, raid boss selection, manual type override, both guide modes, personalized team roles, simulator links, event-detail handoffs, legacy calculators and /admin login separation.
- Production: confirm Vercel READY, current commit, / HTTP 200, /api/battle-profile response for a known name (if external source reachable), source links, /admin sign-in, and absence of production runtime errors.

**Important:** These guides do not guarantee any boss is currently active, a team will win, a specific move is available, or a Max-battle entry price is fixed. Event rules and combat mechanics can be revised. No existing event data or poster mappings are edited.
