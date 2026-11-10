import test from 'node:test';
import assert from 'node:assert/strict';
import {emptySavedCollection,normalizeSavedCollection,toggleSavedEvent,setSavedReminder,acknowledgeSavedEvent,savedEventChanges,buildCalendarExport,serializeSavedCollection} from '../lib/my-events.mjs';
const event={id:'ev1',name:'Pikachu Raid Day',start:'2026-11-21',end:'2026-11-21',startTime:'11:00',endTime:'14:00',zone:'Asia/Manila',source:'https://pokemongo.com/news/test',detail:'Featured Pikachu'};
const global={id:'global',name:'Community Day',start:'2026-12-12',end:'2026-12-12',startTime:'14:00',endTime:'17:00'};
const archive={id:'archive',name:'Event season',start:'2026-12-12',end:'2026-12-13'};
const now='2026-11-10T03:00:00.000Z';
const saved=(e=event)=>toggleSavedEvent(emptySavedCollection(),e,now);
test('bookmark toggles by immutable ID, without duplicate records',()=>{
 const one=saved(),two=toggleSavedEvent(one,event,now),three=toggleSavedEvent(two,event,now);
 assert.equal(one.items.length,1);assert.equal(two.items.length,0);assert.equal(three.items.length,1);
 assert.equal(three.items[0].snapshot.name,event.name);
});
test('save state roundtrips, deduplicates, and invalid payloads fail closed',()=>{
 const state=saved();
 assert.deepEqual(normalizeSavedCollection(serializeSavedCollection(state)),state);
 assert.equal(normalizeSavedCollection('not JSON').items.length,0);
 assert.equal(normalizeSavedCollection({version:2,items:[state.items[0]]}).items.length,0);
 assert.equal(normalizeSavedCollection({version:1,items:[state.items[0],state.items[0]]}).items.length,1);
});
test('changes in published schedule are visible until acknowledged',()=>{
 const record=saved().items[0];
 const updated={...event,startTime:'10:00',zone:'Asia/Tokyo'};
 assert.ok(savedEventChanges(record,updated).includes('Start time updated'));
 assert.ok(savedEventChanges(record,updated).includes('Event region or timezone updated'));
 assert.deepEqual(savedEventChanges(acknowledgeSavedEvent(saved(),updated).items[0],updated),[]);
 assert.ok(savedEventChanges(record,undefined).length>0);
});
test('reminder settings are preserved with a saved event',()=>{
 const s=setSavedReminder(saved(),'ev1','PT30M');
 assert.equal(s.items[0].reminder,'PT30M');
 assert.equal(setSavedReminder(s,'ev1','invalid').items[0].reminder,'PT30M');
});
test('known IANA timezone is exported as wall clock with display alarm',()=>{
 const s=setSavedReminder(saved(),'ev1','PT30M');
 const result=buildCalendarExport(s.items,[event],new Date(now));
 assert.equal(result.eventCount,1);assert.equal(result.reminderCount,1);
 assert.match(result.content,/DTSTART;TZID=Asia\/Manila:20261121T110000/);
 assert.match(result.content,/DTEND;TZID=Asia\/Manila:20261121T140000/);
 assert.match(result.content,/TRIGGER:-PT30M/);
 assert.match(result.content,/BEGIN:VALARM/);
 assert.equal(result.content.includes('TZID=UTC'),false);
});
test('global-local time is floating, not an invented UTC timezone',()=>{
 const s=saved(global);
 const result=buildCalendarExport(s.items,[global],new Date(now));
 assert.match(result.content,/DTSTART:20261212T140000/);
 assert.doesNotMatch(result.content,/DTSTART;TZID=/);
 assert.match(result.content.replace(/\r\n /g,''),/participating location/);
});
test('all-day date ranges use exclusive following-day DTEND',()=>{
 const result=buildCalendarExport(saved(archive).items,[archive],new Date(now));
 assert.match(result.content,/DTSTART;VALUE=DATE:20261212/);
 assert.match(result.content,/DTEND;VALUE=DATE:20261214/);
});
test('calendar export escapes control characters and folds lines',()=>{
 const adversarial={...event,name:'Pokémon;GO, Event\\with newline\nBEGIN:VEVENT',detail:'Raid!'.repeat(60)};
 const result=buildCalendarExport(saved(adversarial).items,[adversarial],new Date(now));
 assert.match(result.content,/SUMMARY:Pokémon\\;GO\\, Event\\\\with newline\\nBEGIN:VEVENT/);
 assert.equal((result.content.match(/\r\nBEGIN:VEVENT\r\n/g)||[]).length,1);
 assert.ok(result.content.split('\r\n').every(line=>new TextEncoder().encode(line).length<=75));
});
test('missing, TBA or duplicate events are skipped without corrupting ICS',()=>{
 const missing=saved({id:'missing',name:'Old event',start:'',end:''});
 const merged={version:1,items:[...saved().items,...missing.items,...saved().items]};
 const result=buildCalendarExport(merged.items,[event],new Date(now));
 assert.equal(result.eventCount,1);assert.equal(result.skippedCount,2);
 assert.match(result.content,/END:VCALENDAR/);
});
