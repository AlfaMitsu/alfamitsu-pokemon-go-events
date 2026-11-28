import test from 'node:test';import assert from 'node:assert/strict';import {catchCP,trainerEstimate} from '../lib/battle-estimates.mjs';
test('Mewtwo standard and boosted hundo CP',()=>{assert.equal(catchCP(300,182,214),2387);assert.equal(catchCP(300,182,214,15,true),2984)});
test('invalid stats rejected',()=>{assert.equal(catchCP(0,182,214),null);assert.equal(catchCP(300,182,214,16),null)});
test('trainer estimate rounds up and accounts for uptime',()=>{assert.deepEqual(trainerEstimate(15000,20,300,80),{trainers:4,damagePerTrainer:4800});assert.equal(trainerEstimate(15000,0,300,80),null)});
