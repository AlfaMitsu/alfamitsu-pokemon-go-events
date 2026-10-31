import fs from 'node:fs';
const a=JSON.parse(fs.readFileSync('lib/posters.json','utf8'));
let n=0;for(const [k,v] of Object.entries(a)){if(!fs.existsSync('public'+v)){console.error('Missing',k,v);n++}}console.log(Object.keys(a).length-n,'/',Object.keys(a).length,'images present');if(n)process.exit(1);
