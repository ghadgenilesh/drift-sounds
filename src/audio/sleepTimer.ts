/** Zero means no timer, including when cancelling an already-running timer. */
export function sleepDeadline(minutes: number, active: boolean, now = Date.now()): number | null {
  return active && minutes > 0 ? now + minutes * 60_000 : null;
}
