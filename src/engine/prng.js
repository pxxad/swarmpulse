/**
 * Deterministic PRNG using Mulberry32 algorithm.
 * Enables reproducible simulations across runs and matching lecture seeds.
 */
export function createPRNG(initialSeed = 42) {
  let s = (Math.floor(initialSeed) >>> 0) || 1;

  function next() {
    let t = (s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function uniform(min, max) {
    return min + next() * (max - min);
  }

  function getState() {
    return s;
  }

  function setState(state) {
    s = state >>> 0;
  }

  return {
    next,
    uniform,
    getState,
    setState
  };
}
