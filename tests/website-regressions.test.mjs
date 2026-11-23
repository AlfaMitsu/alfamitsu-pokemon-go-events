import test from 'node:test';import assert from 'node:assert/strict';
import {regionalIntegrity} from '../lib/regional-integrity.mjs';
import {validateProposal} from '../lib/event-discovery.mjs';
const event={id:'official-event-test',name:'Official Event',start:'2026-11-23',end:'2026-11-29',source:'https://pokemongo.com/news/test'};
test('regional location labels are not mistaken for invalid IANA timezones',()=>{const r=regionalIntegrity([{...event,zone:'Location-specific'}],'2026-11-23','2026-11-29');assert.equal(r.findings.filter(x=>x.kind==='timezone').length,0)});
test('invalid IANA zones remain review findings',()=>{const r=regionalIntegrity([{...event,zone:'Mars/Olympus'}],'2026-11-23','2026-11-29');assert.equal(r.findings.filter(x=>x.kind==='timezone').length,1)});
test('approved events reject nonexistent IANA timezones',()=>{assert.throws(()=>validateProposal({...event,zone:'Mars/Olympus'},[]),/timezone/)});
test('approved events accept regional IANA timezones and local-time labels',()=>{assert.equal(validateProposal({...event,zone:'Asia/Tokyo'},[]).action,'add');assert.equal(validateProposal({...event,zone:'Location-specific'},[]).action,'add')});
