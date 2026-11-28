import { evolve, mulberry32, DEFAULTS } from '../ga/index.js';
import { run } from '../runner/index.js';
import { sharedFitness } from './fitness.js';
import { recordFailure } from './archive.js';

export function runGA(seed, options, host, onGen) {
  const p = { ...DEFAULTS, ...options };
  const archive = new Map();
  const coverage = new Set();
  const perGeneration = [];
  let evaluation = 0;
  let currentGen = 0;

  const evaluate = (chrom) => {
    const result = run(chrom, host);
    evaluation++;
    result.coverage.forEach((point) => coverage.add(point));
    recordFailure(archive, result, chrom, evaluation, currentGen);
    return result;
  };

  const onGeneration = (g) => {
    perGeneration.push({ gen: g.gen, bugs: archive.size, coverage: coverage.size });
    currentGen = g.gen + 1;
    if (onGen) onGen(g, archive, coverage);
  };

  const { history, evaluations } = evolve({ ...p, rng: mulberry32(seed), evaluate, fitnessOf: sharedFitness, onGeneration });
  history.forEach((h, i) => Object.assign(h, perGeneration[i]));
  return { archive, coverage, history, evaluations };
}
