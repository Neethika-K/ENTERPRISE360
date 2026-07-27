import { describe, it, expect } from 'vitest';
import { makeRng, randInt, chance } from '@/lib/sim/rng';

describe('makeRng', () => {
  it('is deterministic for the same seed+day', () => {
    const a = makeRng('seed', 5);
    const b = makeRng('seed', 5);
    const seqA = [a(), a(), a()];
    const seqB = [b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });

  it('differs across days', () => {
    const a = makeRng('seed', 5)();
    const b = makeRng('seed', 6)();
    expect(a).not.toEqual(b);
  });

  it('produces values in [0,1)', () => {
    const r = makeRng('seed', 1);
    for (let i = 0; i < 100; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('randInt is inclusive and deterministic', () => {
    const r1 = makeRng('s', 1);
    const r2 = makeRng('s', 1);
    expect(randInt(r1, 2, 5)).toBe(randInt(r2, 2, 5));
    const r3 = makeRng('s', 1);
    for (let i = 0; i < 50; i++) {
      const v = randInt(r3, 3, 3);
      expect(v).toBe(3);
    }
  });

  it('chance(…,1) is always true and chance(…,0) always false', () => {
    const r = makeRng('s', 1);
    expect(chance(r, 1)).toBe(true);
    expect(chance(r, 0)).toBe(false);
  });
});
