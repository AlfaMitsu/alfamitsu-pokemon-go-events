import test from 'node:test';import assert from 'node:assert/strict';
import {GO_TYPES,goTypeMultiplier,goTypeMatchups,matchupForMove,maxMoveCost,coverageCandidates} from '../lib/go-battle-guides.mjs';
test('all 18 GO attack types have defined neutral matchups',()=>{
 assert.equal(GO_TYPES.length,18);
 for(const type of GO_TYPES)for(const defender of GO_TYPES)assert.ok(typeof goTypeMultiplier(type,[defender])==='number');
});
test('GO single and double super-effective multipliers are 1.6 and 2.56',()=>{
 assert.equal(goTypeMultiplier('ground',['electric']),1.6);
 assert.equal(goTypeMultiplier('ice',['dragon','flying']),2.56);
 assert.equal(goTypeMultiplier('fairy',['dark','ghost']),1.6);
});
test('immunity tier is not zero in GO, dual resistances multiply',()=>{
 assert.equal(goTypeMultiplier('normal',['ghost']),0.390625);
 assert.equal(goTypeMultiplier('fighting',['ghost','poison']),0.244141);
 assert.equal(goTypeMultiplier('electric',['ground','flying']),0.625);
});
test('neutral, resisted, and invalid types are differentiated',()=>{
 assert.equal(goTypeMultiplier('water',['water']),0.625);
 assert.equal(goTypeMultiplier('fire',['rock','water']),0.390625);
 assert.equal(goTypeMultiplier('fire',['electric']),1);
 assert.equal(goTypeMultiplier('fake',['electric']),null);
 assert.equal(goTypeMultiplier('fire',['water','water']),null);
 assert.equal(goTypeMultiplier('fire',[]),null);
});
test('Pokémon GO STAB and weather boosts stack on same attack type',()=>{
 assert.equal(matchupForMove('ice',['dragon','flying'],{sameType:true,weather:'snow'}),3.6864);
 assert.equal(matchupForMove('ice',['dragon','flying'],{sameType:true,weather:'rainy'}),3.072);
});
test('sorted weaknesses show 4x-equivalent GO weaknesses before others',()=>{
 const matchups=goTypeMatchups(['dragon','flying']);
 assert.equal(matchups[0].type,'ice');assert.equal(matchups[0].multiplier,2.56);
 assert.equal(matchups.length,18);
});
test('Max Attack is already unlocked at level 1; Guard and Spirit unlock cost MP',()=>{
 assert.equal(maxMoveCost('attack',0,1),null);
 assert.deepEqual(maxMoveCost('guard',0,1),{mp:400,candy:50,candyXL:0,group:'A',move:'guard',from:0,to:1});
 assert.equal(maxMoveCost('attack',1,3).mp,1400);
 assert.equal(maxMoveCost('spirit',0,3).mp,1800);
});
test('normal Max costs use explicit Candy group rather than assuming one species group',()=>{
 assert.deepEqual(maxMoveCost('guard',0,3,{group:'D'}),{mp:1800,candy:210,candyXL:55,group:'D',move:'guard',from:0,to:3});
 assert.equal(maxMoveCost('attack',1,3,{group:'B'}).candy,110);
 assert.equal(maxMoveCost('attack',1,3,{group:'B'}).candyXL,45);
 assert.equal(maxMoveCost('guard',0,3,{group:'E'}),null);
 assert.equal(maxMoveCost('attack',3,2),null);
});
test('team coverage candidates rank type coverage without DPS or fake win probabilities',()=>{
 const team=[{name:'A',types:['ground']},{name:'B',types:['water']},{name:'C',types:[]}];
 const ranked=coverageCandidates(team,['electric']);
 assert.deepEqual(ranked.map(x=>x.name),['A','B','C']);
 assert.equal(ranked[0].possibleTypeCoverage,1.6);
 assert.equal(ranked[2].possibleTypeCoverage,null);
 assert.equal('dps' in ranked[0],false);
});
