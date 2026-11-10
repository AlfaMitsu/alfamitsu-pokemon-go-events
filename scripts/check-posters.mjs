import fs from 'node:fs';
import path from 'node:path';
const posters=JSON.parse(fs.readFileSync('lib/posters.json','utf8'));
let errors=0,warnings=0;
let present=0;
const validFormats=new Set(['.png','.jpg','.jpeg','.gif','.webp','.avif','.svg']);
for(const [id,src] of Object.entries(posters)){
  if(typeof src!=='string'||!src.startsWith('/posters/')||src.includes('..')){
    console.error('Invalid poster path:',id,src);errors++;continue;
  }
  const file=path.join(process.cwd(),'public',src.slice(1));
  if(!fs.existsSync(file)){console.error('Missing poster:',id,src);errors++;continue;}
  const size=fs.statSync(file).size;
  if(!size){console.error('Empty poster:',id,src);errors++;continue;}
  if(!validFormats.has(path.extname(file).toLowerCase())){console.warn('Unsupported poster extension:',id,src);warnings++;}
  else {
    const fd=fs.openSync(file,'r');
    const header=Buffer.alloc(Math.min(16,size));fs.readSync(fd,header,0,header.length,0);fs.closeSync(fd);
    const good=header.subarray(0,3).toString('hex')==='ffd8ff' ||
      header.subarray(0,8).toString('hex')==='89504e470d0a1a0a' ||
      ['GIF87a','GIF89a'].includes(header.subarray(0,6).toString()) ||
      (header.toString('ascii',0,4)==='RIFF'&&header.toString('ascii',8,12)==='WEBP') ||
      header.toString('ascii',4,8)==='ftyp' ||
      path.extname(file).toLowerCase()==='.svg';
    if(!good){console.warn('Unrecognized image signature:',id,src);warnings++;}
  }
  present++;
}
console.log('Original poster check:',present,'/',Object.keys(posters).length,'files; errors:',errors,'warnings:',warnings);
if(errors)process.exit(1);
