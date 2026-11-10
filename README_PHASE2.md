# AlfaMitsu Services — Mobile-First GO Weekly Calendar

This release adds a responsive, day-focused GO Weekly experience while preserving the desktop seven-day timeline, all historical event data, source links, poster priorities, existing calculators, and the authenticated Phase 1 owner quality dashboard.

## Display modes

- Mobile and tablet (below Tailwind's `xl` breakpoint): vertical daily event cards with weekday picker, Previous/Next day buttons, Today, a native date input, category/location/confirmation filters, and expandable summaries.
- Desktop (`xl` and up): the existing full seven-day grid with Raids, Max Battles and Events lanes, and a separate Regional / Location-Exclusive section.
- Existing compact-calendar preference remains supported. On narrow screens it reduces daily-card image sizes.
- Global and regional events are separated in both layouts. Regional raids and regional Max Battles are no longer mistakenly placed in the global timeline.
- Event-card previews retain original poster precedence, generated artwork and sprite fallbacks. Opening full details uses the existing Event Detail page, timezone controls, source links, calendar handoff and battle-preparation links.

## Time and filtering accuracy

- Week navigation uses an ISO date-key Monday anchor, immune to daylight-saving jumps between successive dates.
- Native date input accepts an actual calendar date and jumps directly to its corresponding week/day.
- Global events remain in participants' local time when no venue-specific timezone is known; regional event times are converted only where an IANA venue timezone is available.
- The UI does not imply that a scheduled event is currently running without checking its event hours.
- Category, global/regional and confirmation filters apply consistently to day cards and desktop weekly lists.
- TBA/unknown date events remain accessible in the existing Events List and do not appear as if dated in GO Weekly.

## Regression tests and release checks

- `npm run test:calendar`: 8 deterministic tests for Monday/Sunday boundaries, date jumps, daylight-saving transitions, inclusive event spans, regional raid classification, category filtering and unconfirmed records.
- `npm run test:quality`: existing 7 Phase 1 event and poster tests unchanged.
- `npm run build` invokes both test suites, existing quality scripts, TypeScript checks and Next.js build.
- Verify the user flows in a Vercel preview before merging, then repeat production status checks. Preserve previous production deployment for rollback.

## Manual mobile QA matrix

- 320–390 px phone: day picker fits without sideways document scrolling; daily cards stack into one column.
- 640–1023 px tablet: event cards may display in two columns, while daily date navigation remains accessible.
- >=1280 px desktop: seven-day calendar and regional cards are visible.
- Select day; cross Sunday to Monday with Next; jump to a different week using date input; reset with Today; filter by Global and Regional; expand and open details; browse original posters and external source links.
- Open owner dashboard sign-in and confirm public visitor paths do not reveal private quality data.

No new account requirement, routing change, or destructive data migration.
