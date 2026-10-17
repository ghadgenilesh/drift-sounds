export type Direction = { x: number; y: number };
/** CoreMotion reports gravity; Android accelerometers report opposite proper acceleration. */
export function screenGravity(x: number, y: number, previous: Direction, android = false): Direction {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return previous;
  // A flat phone has no meaningful downhill direction on its screen.
  if (Math.hypot(x, y) < 0.12) return previous;
  const target = Math.atan2(android ? y : -y, android ? -x : x);
  const old = Math.atan2(previous.y, previous.x);
  const delta = Math.atan2(Math.sin(target - old), Math.cos(target - old));
  const angle = old + delta * .15;
  return { x: Math.cos(angle), y: Math.sin(angle) };
}
