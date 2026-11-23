import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
test('homepage changelog renders at most 10 entries',()=>{const s=readFileSync(new URL('../app/page.tsx',import.meta.url),'utf8');assert.match(s,/changelog\.length\?changelog:RECENT_CHANGELOG\)\.slice\(0,10\)/)});
test('changelog API reads latest 10 main commits',()=>{const s=readFileSync(new URL('../app/api/changelog/route.ts',import.meta.url),'utf8');assert.match(s,/commits\?sha=main&per_page=10/);assert.match(s,/revalidate:3600/)});
