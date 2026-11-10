import test from 'node:test';
import assert from 'node:assert/strict';
import {runQualityAudit} from '../lib/quality-core.mjs';
const base = {id:'e1',name:'Raid Day',start:'2026-11-21',end:'2026-11-21',startTime:'11:00',endTime:'14:00',zone:'Asia/Manila',featuredPokemon:['Eternatus'],poster:'/posters/pokemon.png',source:'https://pokemongo.com'};
const scan = (events,posters={}) => runQualityAudit(events,posters,(p)=>p==='/posters/pokemon.png');
test('valid event with existing artwork passes',()=>{
 const result=scan([base]);
 assert.equal(result.summary.errors,0);
 assert.equal(result.summary.warnings,0);
 assert.equal(result.summary.localPosters,1);
});
test('duplicate IDs, missing images, missing parent and reversed dates are blocking',()=>{
 const result=scan([{...base,poster:'/posters/missing.png',linkedEventId:'absent',start:'2026-11-22',end:'2026-11-21'},base]);
 const codes=new Set(result.issues.filter(x=>x.severity==='error').map(x=>x.code));
 for(const code of ['DUPLICATE_EVENT_ID','MISSING_POSTER','MISSING_PARENT_EVENT','REVERSED_EVENT_DATES']) assert.ok(codes.has(code),code);
});
test('source and timezone inaccuracies create advisory findings',()=>{
 const result=scan([{...base,source:'not-a-url',zone:'Mars/Base',startTime:'25:17'}]);
 assert.equal(result.summary.errors,0);
 assert.ok(result.summary.warnings>=3);
});
test('generated event graphic must reference its event',()=>{
 const result=scan([{...base,poster:'/api/event-poster?id=wrong'}]);
 assert.ok(result.issues.some(x=>x.code==='BAD_GENERATED_POSTER'));
});
test('dated archive records without date details can remain visible',()=>{
 const result=scan([{id:'historical',name:'Historic raid',start:'',end:''}]);
 assert.equal(result.summary.errors,0);
});
test('detects broken original poster collection independently',()=>{
 const result=scan([base],{e1:'/posters/removed.jpg'});
 assert.ok(result.issues.some(x=>x.code==='MISSING_MAPPED_POSTER'));
});
test('issues have stable IDs for owner review state',()=>{
 const a=scan([{...base,zone:'Mars/Base'}]);
 const b=scan([{...base,zone:'Mars/Base'}]);
 assert.deepEqual(a.issues.map(x=>x.id),b.issues.map(x=>x.id));
});
