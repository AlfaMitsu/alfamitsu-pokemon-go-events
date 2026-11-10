// Shared, side-effect-free event and artwork validation for build checks and the private dashboard.
// Warning findings are advisory: a dated archive or an unavailable external source is not a build error.
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
const safePosterPath = /^\/posters\/[a-z\d][a-z\d/_ .()@+-]*\.(png|jpe?g|webp|gif|svg|avif)$/i;
const isValidDate = (s) => typeof s === 'string' && datePattern.test(s) &&
  !Number.isNaN(Date.parse(s + 'T12:00:00Z')) &&
  new Date(s + 'T12:00:00Z').toISOString().slice(0,10) === s;
const isUrl = (s) => {
  try { const u = new URL(s); return u.protocol === 'https:' && Boolean(u.hostname); }
  catch { return false; }
};
const isKnownZone = (value) => {
  try { new Intl.DateTimeFormat('en', {timeZone:value}); return true; }
  catch { return false; }
};
const readable = (value) => typeof value === 'string' && value.trim().length > 0;
const eventLabel = (e) => readable(e?.name) ? e.name.trim() : '(unnamed event)';

export function runQualityAudit(events, posterMap, fileExists = () => true) {
  const issues = [];
  const ids = new Set();
  const named = new Map();
  const counts = { events: events.length, posterMappings: Object.keys(posterMap).length, localPosters: 0, generatedPosters: 0 };
  const add = (severity, code, eventId, field, message, suggestion) => {
    const key = [code, eventId || 'global', field || ''].join(':');
    issues.push({id:key, severity, code, eventId:eventId || null, field:field || null, eventName:named.get(eventId) || null, message, suggestion});
  };
  const validateArtwork = (value, id, field) => {
    if (!readable(value)) return;
    if (value.startsWith('/posters/')) {
      if (!safePosterPath.test(value)) {
        add('error', 'UNSAFE_POSTER_PATH', id, field, 'Poster path has an unsupported format: ' + value, 'Use an image under /public/posters.');
      } else if (!fileExists(value)) {
        add('error', 'MISSING_POSTER', id, field, 'Referenced local image is missing: ' + value, 'Restore the original poster or update its reference.');
      } else {
        counts.localPosters++;
      }
    } else if (value.startsWith('/api/event-poster')) {
      let key = null;
      try { key = new URL(value, 'https://local.invalid').searchParams.get('id'); } catch {}
      if (key !== id) add('error','BAD_GENERATED_POSTER',id,field,'Generated poster ID does not match event ID.','Use /api/event-poster?id= followed by the matching event ID.');
      else counts.generatedPosters++;
    } else if (value.startsWith('/')) {
      add('warning','UNKNOWN_LOCAL_IMAGE',id,field,'Image references an unrecognized local route: ' + value,'Verify that the route resolves to the intended event graphic.');
    } else if (!isUrl(value)) {
      add('warning','INVALID_IMAGE_URL',id,field,'External poster image is not a valid HTTPS URL.','Use a valid HTTPS URL or a local poster.');
    }
  };
  for (const e of events) {
    const id = readable(e?.id) ? e.id : null;
    if (!id) add('error','MISSING_EVENT_ID',null,'id','An event is missing its ID.','Assign a unique stable event ID.');
    else if (ids.has(id)) add('error','DUPLICATE_EVENT_ID',id,'id','The event ID is duplicated: ' + id,'Give each separate event its own ID.');
    else ids.add(id);
    if (id) named.set(id,eventLabel(e));
  }
  for (const e of events) {
    const id = readable(e?.id) ? e.id : null;
    if (!readable(e?.name)) add('error','MISSING_EVENT_NAME',id,'name','Event name is empty.','Provide a clear event name.');
    if (Boolean(e.start) !== Boolean(e.end)) add('error','PARTIAL_EVENT_DATES',id,'start/end','Only one event date is supplied.','Supply both start and end dates, or leave both unknown.');
    if (e.start && !isValidDate(e.start)) add('warning','INVALID_START_DATE',id,'start','Start date is not a valid ISO calendar date.','Use YYYY-MM-DD with a real calendar date.');
    if (e.end && !isValidDate(e.end)) add('warning','INVALID_END_DATE',id,'end','End date is not a valid ISO calendar date.','Use YYYY-MM-DD with a real calendar date.');
    if (isValidDate(e.start) && isValidDate(e.end) && e.start > e.end) add('error','REVERSED_EVENT_DATES',id,'start/end','Event end date precedes its start.','Correct the date ordering.');
    if (e.startTime && !timePattern.test(e.startTime)) add('warning','INVALID_START_TIME',id,'startTime','Time must use 24-hour HH:MM.','Correct the start time.');
    if (e.endTime && !timePattern.test(e.endTime)) add('warning','INVALID_END_TIME',id,'endTime','Time must use 24-hour HH:MM.','Correct the end time.');
    if (e.startTime && !e.endTime || !e.startTime && e.endTime) add('warning','PARTIAL_EVENT_TIMES',id,'startTime/endTime','Only one event clock time is supplied.','Confirm both times from an event source.');
    if (e.start === e.end && timePattern.test(e.startTime || '') && timePattern.test(e.endTime || '') && e.startTime > e.endTime) add('warning','REVERSED_EVENT_TIMES',id,'startTime/endTime','Same-day end time is earlier than start time.','Verify the event window and venue timezone.');
    if (e.zone && !isKnownZone(e.zone) && !/location-specific|see source|varies|global|local time/i.test(e.zone)) add('warning','UNRECOGNIZED_TIMEZONE',id,'zone','Venue timezone cannot be converted safely: ' + e.zone,'Use an IANA timezone or label the event location-specific.');
    if (e.source && !isUrl(e.source)) add('warning','INVALID_SOURCE',id,'source','Event source is not an HTTPS URL.','Link the original public source when available.');
    if (e.category && !['raid','max-battle-rotation','event'].includes(e.category)) add('warning','UNKNOWN_CATEGORY',id,'category','Unrecognized event category.','Use an existing supported category.');
    if (e.featuredPokemon !== undefined && !Array.isArray(e.featuredPokemon)) add('warning','BAD_FEATURED_POKEMON',id,'featuredPokemon','Featured Pokémon must be a list.','Use an array of species/form names.');
    if (Array.isArray(e.featuredPokemon)) {
      const values = e.featuredPokemon.filter(readable).map(x=>x.trim().toLowerCase());
      if (new Set(values).size !== values.length) add('warning','DUPLICATE_FEATURED_POKEMON',id,'featuredPokemon','The same featured Pokémon appears more than once.','Deduplicate the list without discarding legitimate alternate forms.');
      if (e.featuredPokemon.some(x=>!readable(x))) add('warning','EMPTY_FEATURED_POKEMON',id,'featuredPokemon','One or more Pokémon names are empty.','Remove empty entries.');
    }
    if (e.linkedEventId && e.linkedEventId === id) add('error','SELF_LINKED_EVENT',id,'linkedEventId','Event links to itself.','Link to a distinct parent event.');
    else if (e.linkedEventId && !ids.has(e.linkedEventId)) add('error','MISSING_PARENT_EVENT',id,'linkedEventId','Linked event does not exist: ' + e.linkedEventId,'Fix the parent event ID.');
    const main = e.poster || posterMap[id];
    if (main) validateArtwork(main,id,'poster');
    if (e.posterType === 'web' && e.onlineImage) validateArtwork(e.onlineImage,id,'onlineImage');
    if (e.additionalPosters !== undefined && !Array.isArray(e.additionalPosters)) add('warning','BAD_ADDITIONAL_POSTERS',id,'additionalPosters','Additional posters must be an array.','Use an array of objects with image sources.');
    if (Array.isArray(e.additionalPosters)) e.additionalPosters.forEach((extra,index)=>{
      if (extra?.src) validateArtwork(extra.src,id,'additionalPosters['+index+'].src');
    });
  }
  for (const [id,src] of Object.entries(posterMap)) {
    // Validate the original poster collection independently from per-event references.
    if (!ids.has(id)) add('info','ORPHAN_POSTER_MAPPING',id,'posterMap','Poster is not assigned to any event.','Keep if reserved for a future event; otherwise archive.');
    if (!readable(src)) add('error','EMPTY_POSTER_MAPPING',id,'posterMap','Poster mapping has no image.','Restore the image reference.');
    else if (src.startsWith('/posters/') && (!safePosterPath.test(src) || !fileExists(src))) add('error','MISSING_MAPPED_POSTER',id,'posterMap','Original poster collection contains an unavailable file: ' + src,'Restore the original local image.');
  }
  const rank = {error:0,warning:1,info:2};
  issues.sort((a,b)=>rank[a.severity]-rank[b.severity] || (a.eventId||'').localeCompare(b.eventId||'') || a.code.localeCompare(b.code));
  const summary = {events:counts.events,posterMappings:counts.posterMappings,localPosters:counts.localPosters,generatedPosters:counts.generatedPosters,errors:issues.filter(x=>x.severity==='error').length,warnings:issues.filter(x=>x.severity==='warning').length,info:issues.filter(x=>x.severity==='info').length};
  return {summary,issues};
}
