// cyrb128-style string hash combined with day, feeding mulberry32.
export function hashSeed(seed: string, day: number): number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ day, 2654435761);
  h ^= h >>> 16;
  return h >>> 0;
}

export function makeRng(seed: string, day: number): () => number {
  let a = hashSeed(seed, day);
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randInt(rng: () => number, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

export function chance(rng: () => number, p: number): boolean {
  return rng() < p;
}
