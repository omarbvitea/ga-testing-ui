import { randInt } from '../random.js';

function differentGene(rng, gene, alphabet) {
  const value = randInt(rng, alphabet - 1);
  return value >= gene ? value + 1 : value;
}

export function mutate(rng, chromosome, pm, alphabet) {
  return chromosome.map((gene) => (rng() >= pm ? gene : differentGene(rng, gene, alphabet)));
}
