import test from 'node:test';import assert from 'node:assert/strict';
import {orderEventsByStatus} from '../lib/event-list-order.mjs';
const events=[{id:'old',name:'Old',start:'2016-07-06',end:'2016-07-07'},{id:'future',name:'Future',start:'2026-12-10',end:'2026-12-11'},{id:'now',name:'Ongoing',start:'2026-11-20',end:'2026-11-26'},{id:'recent',name:'Recent',start:'2026-11-18',end:'2026-11-19'},{id:'soon',name:'Soon',start:'2026-11-25',end:'2026-11-25'}];
test('ongoing then upcoming ascending then completed newest first',()=>{assert.deepEqual(orderEventsByStatus(events,'2026-11-23').map(x=>x.id),['now','soon','future','recent','old'])});
test('historic entries remain searchable when present',()=>{assert.equal(orderEventsByStatus(events,'2026-11-23').find(x=>x.start.startsWith('2016'))?.id,'old')});
