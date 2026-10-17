import assert from 'node:assert/strict';
import { particleRandom, particleFlow } from '../src/effects/particles.ts';
const points=Array.from({length:22},(_,i)=>[particleRandom(i+1),particleRandom(i+9)]);
const mean=axis=>points.reduce((s,p)=>s+p[axis],0)/points.length;
const mx=mean(0), my=mean(1);
const covariance=points.reduce((s,[x,y])=>s+(x-mx)*(y-my),0);
const variance=axis=>points.reduce((s,p)=>s+(p[axis]-mean(axis))**2,0);
assert.ok(Math.abs(covariance/Math.sqrt(variance(0)*variance(1)))<.45,'stars must not line up diagonally');
assert.equal(new Set(points.map(p=>`${p[0]>.5},${p[1]>.5}`)).size,4,'stars cover all quadrants');
for (const g of [{x:0,y:1},{x:1,y:0},{x:0,y:-1},{x:.6,y:.8}]) {
 const e=particleFlow(g,true),r=particleFlow(g,false);
 assert.ok(Math.abs(e.x*g.x+e.y*g.y+1)<1e-9,'embers move opposite gravity');
 assert.deepEqual(r,g,'rain follows gravity');
}
console.log('Particle distribution and flow checks passed');
