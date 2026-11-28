import { randInt } from '../random.js';

export function roulette(rng, weights) {
  const total = weights.reduce((sum, w) => sum + w, 0);
  if (total <= 0) return randInt(rng, weights.length);
  let r = rng() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r < 0) return i;
  }
  return weights.length - 1;
}
