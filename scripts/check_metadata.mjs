import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import ts from 'typescript';
const code=await readFile(new URL('../src/audio/mediaMetadata.ts',import.meta.url),'utf8');
const js=ts.transpileModule(code,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {soundMetadata}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
const source=await readFile(new URL('../src/moods.ts',import.meta.url),'utf8');
const sounds=[...source.matchAll(/id: '([^']+)', name: '([^']+)'/g)];
assert.equal(sounds.length,16);
const seen=new Set();
const worker=await readFile('dist/sw.js','utf8');
for(const [,id,name] of sounds){
 const metadata=soundMetadata({id,name},'https://drift.stacklets.app');
 assert.equal(metadata.title,name);assert.equal(metadata.artist,'Drift');assert.equal(metadata.artwork.length,2);
 for(const artwork of metadata.artwork){
  assert.equal(artwork.type,'image/png');
  const url=new URL(artwork.src);assert.equal(url.origin,'https://drift.stacklets.app');
  assert(!seen.has(url.href));seen.add(url.href);
  assert((await stat('dist'+url.pathname)).size>100);
  assert(worker.includes(url.pathname),'Artwork must be included in offline shell');
 }
}
console.log('PASS: 16 distinct sound metadata entries, 32 cover images, absolute URLs and offline artwork caching.');
