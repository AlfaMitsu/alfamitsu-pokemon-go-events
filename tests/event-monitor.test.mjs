import test from 'node:test';import assert from 'node:assert/strict';
import {monitorInventory,checkRemoteImages} from '../lib/event-monitor.mjs';
test('monitor identifies missing citations and future coverage',()=>{const r=monitorInventory([{id:'a',name:'A',start:'2026-11-14',end:'2026-11-15',poster:'https://pbs.twimg.com/media/example.jpg'}],new Date('2026-11-13T00:00:00Z'));assert.equal(r.upcoming,1);assert.ok(r.issues.some(x=>x.code==='ACTIVE_MISSING_SOURCE'));assert.equal(r.remoteImages.length,1)});
test('monitor handles archive without false future data',()=>{const r=monitorInventory([{id:'old',start:'2025-01-01',end:'2025-01-02'}],new Date('2026-11-13T00:00:00Z'));assert.ok(r.issues.some(x=>x.code==='NO_FUTURE_EVENTS'))});
test('remote monitor skips unapproved hosts',async()=>{const r=await checkRemoteImages([{url:'https://example.org/other.jpg',eventIds:['x']}]);assert.equal(r.length,0)});
