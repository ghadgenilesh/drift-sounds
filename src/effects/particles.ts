/** Deterministic integer hash: nearby inputs do not create aligned coordinates. */
export function particleRandom(index: number): number {
  let value = (index + 1) | 0;
  value = Math.imul(value ^ (value >>> 16), 0x21f0aaad);
  value = Math.imul(value ^ (value >>> 15), 0x735a2d97);
  return ((value ^ (value >>> 15)) >>> 0) / 4294967296;
}
export function particleFlow(gravity: {x:number; y:number}, ember: boolean) {
  const sign = ember ? -1 : 1;
  return { x: gravity.x * sign, y: gravity.y * sign };
}
