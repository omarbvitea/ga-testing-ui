import { randInt } from '../random.js';

export function onePointCrossover(rng, a, b) {
  const site = 1 + randInt(rng, a.length - 1);
  const childA = a.slice(0, site).concat(b.slice(site));
  const childB = b.slice(0, site).concat(a.slice(site));
  return [childA, childB, site];
}
