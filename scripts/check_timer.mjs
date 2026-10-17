import assert from 'node:assert/strict';
import { sleepDeadline } from '../src/audio/sleepTimer.ts';
const now = 100000;
assert.equal(sleepDeadline(0, true, now), null, 'No Timer must not schedule an end');
assert.equal(sleepDeadline(30, false, now), null, 'Selecting a timer before playback must not start it');
for (const minutes of [30, 60, 90]) {
  assert.equal(sleepDeadline(minutes, true, now), now + minutes * 60000);
}
let deadline = sleepDeadline(30, true, now);
assert.notEqual(deadline, null);
deadline = sleepDeadline(0, true, now + 5000);
assert.equal(deadline, null, 'No Timer must cancel an active countdown');
console.log('Sleep timer checks passed');
