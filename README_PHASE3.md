# AlfaMitsu Services — Phase 3: My Events and Personal Reminders

Phase 3 adds a public, account-free personal event collection **inside the existing Next.js website**. All Phase 1 event/poster checks and owner review dashboard and all Phase 2 mobile/desktop GO Weekly features remain in place.

## Visitor workflow

1. Use the bookmark action on an event in GO Weekly (mobile and desktop), Events List, or Event Details.
2. Navigate to **My Events** using the normal website sidebar or the desktop header shortcut.
3. Filter bookmarked items by upcoming/ongoing, completed, all, or Global / Regional, search titles and Pokémon, and open the existing event details.
4. Choose a reminder time per saved event: none, 10 minutes, 30 minutes, one hour, or one day before the event's scheduled start.
5. Download all saved events, filtered events, or an individual event as an **.ics calendar** file. This embeds a standard `VALARM` entry; your imported calendar application controls whether notifications are delivered.
6. Download a JSON backup of saved items or restore a previously exported backup.

## Storage, privacy and limitations

- Storage key: `alfamitsu:my-events:v1`. Records use **stable event IDs**, an originally saved schedule/source snapshot for detecting changes, and the user's reminder choice. Data remains only in the current browser/device; no login, server storage, or sync between devices.
- Visitor timezone, compact weekly setting and Events List category/location filters are saved locally under `alfamitsu:event-preferences:v1`.
- Import replaces the saved collection after a browser confirmation. Backup restores reminder preferences and original snapshots. Corrupt payloads and oversized imports are rejected or safely normalized.
- Imported and saved events are linked to live entries from the website dataset. When a date/time/region/name/source field changes, My Events highlights it until the user reviews the updated record. Missing event IDs are retained with a warning rather than silently removed.
- No background browser push notifications are implemented. Users should import the .ics file into a calendar application and enable notifications there.
- If an event has no verified clock times, its .ics entry is all-day across its scheduled dates; an alarm is relative to the start of that calendar entry, not a promised in-game start time.
- When a venue timezone is verified, .ics times include that IANA TZID. Global events without an IANA venue timezone use *floating local time* rather than an invented UTC conversion. Check event details and linked sources for location-specific availability.
- Multi-day, timed events export as one calendar entry spanning the stated start and end clock times. They are **not** assumed to recur daily without a verified recurrence rule.
- Google Calendar links already available in the existing event detail page remain unchanged.

## Verification and release safeguards

- `npm run test:my-events` covers bookmark toggle/deduplication, persistence/versioning, change tracking, reminders, timezone-safe .ics output, all-day exclusive end dates, escaping, and invalid schedule handling.
- `npm run build` runs the new tests **alongside** the Phase 1 and Phase 2 regression suites and event/poster checks.
- All original event records and poster assets are preserved; no new server API or account is required for bookmarks.
- Test on a Vercel preview before merging to production. After release, verify My Events navigation, calendar export and owner dashboard access, including on a small-screen browser.
