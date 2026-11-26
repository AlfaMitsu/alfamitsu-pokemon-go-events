import test from 'node:test';import assert from 'node:assert/strict';import {eventRegion,eventInstant,eventClock} from '../lib/global-events.mjs';
test('explicit global scope overrides reference timezone',()=>{assert.equal(eventRegion({region:'Global',zone:'America/Los_Angeles'}),'Global');assert.equal(eventRegion({zone:'Asia/Tokyo'}),'Japan')});
test('timezone conversion uses venue offset',()=>{assert.equal(eventInstant('2026-12-01','10:00','Asia/Tokyo'),Date.parse('2026-12-01T01:00Z'))});
test('missing times and invalid zones are not guessed',()=>{assert.equal(eventInstant('2026-12-01',undefined,'Asia/Tokyo'),null);assert.equal(eventInstant('2026-12-01','10:00','invalid'),null)});
test('DST gap and repeated hour are rejected',()=>{assert.equal(eventInstant('2026-03-08','02:30','America/New_York'),null);assert.equal(eventInstant('2026-11-01','01:30','America/New_York'),null)});
test('countdown uses actual instant',()=>{const r=eventClock({start:'2026-12-01',end:'2026-12-01',startTime:'10:00',endTime:'12:00',zone:'Asia/Tokyo'},Date.parse('2026-12-01T00:00Z'),'Asia/Manila');assert.equal(r.minutes,60);assert.equal(r.state,'Starts in')});
