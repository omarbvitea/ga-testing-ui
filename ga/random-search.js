import { randomChromosome } from './random.js';

export function randomSearch({ evaluate, rng, budget, length, alphabet, onEvaluate }) {
  for (let i = 0; i < budget; i++) {
    const result = evaluate(randomChromosome(rng, length, alphabet));
    if (onEvaluate) onEvaluate(result, i + 1);
  }
}
