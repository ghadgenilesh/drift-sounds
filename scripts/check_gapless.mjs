import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const input = fs.readFileSync(new URL('../src/audio/GaplessLoop.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(input, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } });
const { GaplessLoop } = await import('data:text/javascript;base64,' + Buffer.from(outputText).toString('base64'));
let latest, downloads = 0, resolveFetch;
class Context {
  currentTime = 0; state = 'running'; sources = []; events = []; destination = {};
  constructor() { latest = this; }
  resume() { return Promise.resolve(); }
  close() { this.state = 'closed'; return Promise.resolve(); }
  decodeAudioData() { return Promise.resolve({ duration: 51.516 }); }
  createGain() { return { connect() {}, gain: {
    cancelScheduledValues: t => this.events.push(['cancel', t]),
    setValueAtTime: (value,t) => this.events.push(['set', value,t]),
    linearRampToValueAtTime: (value,t) => this.events.push(['ramp', value,t]),
  } }; }
  createBufferSource() {
    const source = { connect() {}, disconnect() {}, stop() { this.stopped = true; }, start(time, offset) { this.time = time; this.offset = offset; } };
    this.sources.push(source); return source;
  }
}
globalThis.window = { AudioContext: Context };
Object.defineProperty(globalThis,'navigator',{value:{audioSession:{type:''}},configurable:true});
globalThis.fetch = async () => { downloads++; return { ok:true, arrayBuffer: async () => new ArrayBuffer(1) }; };
const changes = [];
const player = new GaplessLoop('/rain.wav', value => changes.push(value));
assert.equal(await player.play(true),true);
assert.equal(latest.sources.length,1); assert.equal(latest.sources[0].loop,true);
latest.currentTime = 2;
player.setDeadline(Date.now()+1800000);
assert.equal(latest.sources.length,1,'Timer change must not restart sound');
assert.equal(latest.events.at(-1)[0],'ramp'); assert.ok(Math.abs(latest.events.at(-1)[2]-1802)<.1);
player.setDeadline(null);
assert.deepEqual(latest.events.slice(-2),[['cancel',2],['set',.65,2]],'No Timer must remove scheduled fade');
player.pause(); assert.equal(latest.sources[0].stopped,true);
assert.equal(await player.play(),true); assert.equal(latest.sources[1].offset,2);
assert.equal(downloads,1,'Pause/resume must reuse decoded audio');
player.stop(); assert.equal(await player.play(true),true); assert.equal(latest.sources[2].offset,0);
player.dispose(); assert.equal(latest.state,'closed');
globalThis.fetch = () => new Promise(resolve => {resolveFetch=resolve});
const pending = new GaplessLoop('/slow.wav',()=>{});
const start = pending.play(true); pending.stop();
resolveFetch({ok:true,arrayBuffer:async()=>new ArrayBuffer(1)});
assert.equal(await start,false); assert.equal(latest.sources.length,0,'Cancelled download must not start audio');
pending.dispose();
console.log('PASS: continuous source, live timer updates and cancellation, pause/resume, decode reuse, stale-load cancellation.');
