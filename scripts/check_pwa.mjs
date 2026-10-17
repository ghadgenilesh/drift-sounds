import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const manifest = JSON.parse(await readFile('dist/offline-manifest.json','utf8'));
const handlers = {};
const stores = new Map();
const caches = {
  async open(name) {
    if (!stores.has(name)) stores.set(name,new Map());
    const map = stores.get(name);
    return { match:async key => {
      const original = map.get(key);
      const result = original?.clone();
      if (result && original.redirected) Object.defineProperty(result,'redirected',{value:true});
      return result;
    }, put:async (key,response)=>map.set(key,response) };
  }, keys:async()=>[...stores.keys()],delete:async key=>stores.delete(key),
};
let offline = false;
const context = vm.createContext({self:{location:{origin:'https://night.test'},addEventListener:(name,fn)=>handlers[name]=fn,clients:{claim:async()=>{}}},caches,fetch:async()=>{
  if(offline) throw new Error('Network is offline');
  const response = new Response('shell');
  Object.defineProperty(response,'redirected',{value:true});
  return response;
},URL,Response,Headers});
vm.runInContext(await readFile('dist/sw.js','utf8'),context);
let work;
handlers.install({waitUntil:p=>work=p}); await work;
handlers.activate({waitUntil:p=>work=p}); await work;
offline = true;
const shellKey = (await caches.keys()).find(key => key.startsWith('night-shell-'));
assert.equal(stores.get(shellKey).get('/index.html').redirected,false,'Install must remove redirect state');
const legacy = new Response('shell');
Object.defineProperty(legacy,'redirected',{value:true});
stores.get(shellKey).set('/index.html',legacy);
await caches.open(manifest.cache);
stores.get(manifest.cache).set(manifest.audio[0],new Response(new Uint8Array([0,1,2,3,4,5,6,7,8,9]),{headers:{'Content-Type':'audio/wav'}}));
async function request(path,range,mode='cors') {
  let result;
  handlers.fetch({request:{url:'https://night.test'+path,method:'GET',mode,headers:new Headers(range?{range}:{})},respondWith:p=>result=p});
  return result;
}
for (const [range,start,end] of [['bytes=0-1',0,1],['bytes=3-',3,9],['bytes=-3',7,9],['bytes=7-999',7,9]]) {
 const res=await request(manifest.audio[0],range); assert.equal(res.status,206);
 assert.equal(res.headers.get('content-range'),`bytes ${start}-${end}/10`);
 assert.deepEqual([...new Uint8Array(await res.arrayBuffer())],Array.from({length:end-start+1},(_,i)=>i+start));
}
for(const range of ['bytes=10-','bytes=4-2','bytes=-0','bytes=0-1,4-5','bytes=-']) assert.equal((await request(manifest.audio[0],range)).status,416);
assert.equal((await request(manifest.audio[0])).status,200);
assert.equal(await (await request('/',null,'navigate')).text(),'shell');
assert.equal((await request('/',null,'navigate')).redirected,false,'Safari navigation must not receive cached redirect state');
assert.equal(await (await request('/offline-manifest.json')).text(),'shell');
assert.equal(await request('/unrelated'),undefined);
assert.equal(manifest.audio.length,16);
const html=await readFile('dist/index.html','utf8'); assert.match(html,/rel="manifest"/);assert.match(html,/apple-touch-icon/);
const webmanifest=JSON.parse(await readFile('dist/manifest.webmanifest','utf8'));assert.equal(webmanifest.display,'standalone');
console.log('PWA checks passed: offline navigation, full audio, Safari byte ranges, invalid ranges, manifest, and sixteen sounds.');
