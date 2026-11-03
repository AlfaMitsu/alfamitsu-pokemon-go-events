# Event artwork refresh — November 3, 2026

- Existing AlfaMitsu supplied posters remain untouched and take precedence when relevant.
- Event posters are now assigned by exact event ID instead of loosely matching event names.
- For events without supplied matching art, offline-safe *custom branded overview images* are generated from the event name, date, venue and existing AlfaMitsu logo. These are not represented as official posters.
- Event detail pages now link to available announcement sources.
- Added missing Sendai and Mexico City 2026 GO Wild Area events. Corrected Singapore PokéXciting! from a running race to the Changi/Jewel event, and identified the India-only Festival of Lights.
- Research sourced from Pokémon GO official event pages, Leek Duck and Pokémon GO Hub.
- `onlineImage` records optional third-party media found on the web, kept separate from the offline-safe `poster` path; site currently renders the local fallback to avoid remote-image outage.
- **Caveat:** many long-range future schedule entries remain from the original user data and have not been independently verified; do not describe them as official announcements.
