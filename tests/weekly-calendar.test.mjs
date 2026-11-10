import test from 'node:test';
import assert from 'node:assert/strict';
import {isCalendarDateKey,weekDatesFromOffset,weekOffsetForDate,weekdayIndex,eventOnWeeklyDate,weeklyEventLane,weeklyEventCategory,isRegionalWeeklyEvent,filterWeeklyEvents,isUnconfirmedWeeklyEvent} from '../lib/weekly-calendar.mjs';
const now=new Date(2026,10,10,10);
const days=weekDatesFromOffset(0,now);
const raid={id:'raid',name:'Mega Raid',category:'raid',start:'2026-11-09',end:'2026-11-15'};
const regionalRaid={...raid,id:'regional',zone:'Asia/Tokyo'};
const rotation={id:'max',name:'Dynamax Espurr',category:'max-battle-rotation',start:'2026-11-10',end:'2026-11-14'};
const spotlight={id:'spotlight',name:'Pikachu Spotlight Hour',start:'2026-11-10',end:'2026-11-10'};
const unconfirmed={id:'unconfirmed',name:'Unconfirmed special event',start:'2026-11-11',end:'2026-11-12',detail:'Datamine only'};
const sample=[raid,regionalRaid,rotation,spotlight,unconfirmed];
test('seven Monday-to-Sunday dates anchor to device-local day',()=>{
 assert.deepEqual(days,['2026-11-09','2026-11-10','2026-11-11','2026-11-12','2026-11-13','2026-11-14','2026-11-15']);
 assert.equal(weekdayIndex('2026-11-10'),1);
 assert.equal(weekDatesFromOffset(1,now)[0],'2026-11-16');
});
test('jump-to-date computes the correct week offset',()=>{
 assert.equal(weekOffsetForDate('2026-11-15',now),0);
 assert.equal(weekOffsetForDate('2026-11-16',now),1);
 assert.equal(weekOffsetForDate('2026-11-02',now),-1);
 assert.equal(weekOffsetForDate('invalid',now),null);
});
test('DST transitions cannot create duplicated or skipped calendar dates',()=>{
 const duringSwitch=new Date(2026,2,8,13);
 const dates=weekDatesFromOffset(0,duringSwitch);
 assert.equal(new Set(dates).size,7);
 assert.deepEqual(dates,['2026-03-02','2026-03-03','2026-03-04','2026-03-05','2026-03-06','2026-03-07','2026-03-08']);
 assert.equal(weekDatesFromOffset(1,duringSwitch)[0],'2026-03-09');
});
test('invalid dates and incomplete schedules never become live events',()=>{
 assert.equal(isCalendarDateKey('2026-02-30'),false);
 assert.equal(isCalendarDateKey(''),false);
 assert.equal(eventOnWeeklyDate({start:'',end:'2026-11-10'},'2026-11-10'),false);
 assert.equal(eventOnWeeklyDate(spotlight,'2026-11-11'),false);
});
test('mobile daily cards span multi-day events without duplicating the source event',()=>{
 assert.equal(eventOnWeeklyDate(raid,'2026-11-09'),true);
 assert.equal(eventOnWeeklyDate(raid,'2026-11-15'),true);
 assert.equal(eventOnWeeklyDate(raid,'2026-11-16'),false);
 assert.equal(filterWeeklyEvents(sample,days).length,5);
});
test('regional raids remain regional, never displayed under global-only',()=>{
 assert.equal(isRegionalWeeklyEvent(regionalRaid),true);
 assert.deepEqual(filterWeeklyEvents(sample,days,{area:'regional'}).map(x=>x.id),['regional']);
 assert.ok(!filterWeeklyEvents(sample,days,{area:'global'}).some(x=>x.id==='regional'));
});
test('category filtering respects raids, max rotations, spotlight, and named events',()=>{
 assert.equal(weeklyEventLane(rotation),'max');
 assert.equal(weeklyEventCategory(spotlight),'Spotlight Hour');
 assert.deepEqual(filterWeeklyEvents(sample,days,{category:'Raid'}).map(x=>x.id),['raid','regional']);
 assert.deepEqual(filterWeeklyEvents(sample,days,{category:'Max Battle'}).map(x=>x.id),['max']);
});
test('unconfirmed entries remain labeled and filtering is explicit',()=>{
 assert.equal(isUnconfirmedWeeklyEvent(unconfirmed),true);
 assert.equal(filterWeeklyEvents(sample,days,{confirmation:'unconfirmed'}).length,1);
 assert.equal(filterWeeklyEvents(sample,days,{confirmation:'confirmed'}).length,4);
});
