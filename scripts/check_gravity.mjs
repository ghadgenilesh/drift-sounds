import assert from 'node:assert/strict';
import { screenGravity } from '../src/effects/gravity.ts';
function settle(x, y, android=false) {
  let d = {x:0,y:1};
  for(let i=0;i<100;i++) d=screenGravity(x,y,d,android);
  return d;
}
for(const android of [false,true]) {
  const sign=android?-1:1;
  assert.ok(settle(0,-sign,android).y>.999,'upright flows toward screen bottom');
  assert.ok(settle(sign,0,android).x>.999,'sideways flows toward gravity');
  assert.ok(settle(0,sign,android).y<-.999,'inverted phone reverses screen direction');
}
const last={x:1,y:0};
assert.deepEqual(screenGravity(0,0,last),last,'flat phone retains stable direction');
assert.deepEqual(screenGravity(NaN,1,last),last,'invalid sample ignored');
console.log('Gravity direction checks passed on iOS and Android conventions');
