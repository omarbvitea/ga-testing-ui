import { randomSearch, mulberry32, DEFAULTS } from '../ga/index.js';
import { run } from '../runner/index.js';
import { recordFailure } from './archive.js';

export function runRandom(seed, budget, options, host) {
  const p = { ...DEFAULTS, ...options };
  const archive = new Map();
  const coverage = new Set();
  let lastChrom = null;

  const evaluate = (chrom) => {
    lastChrom = chrom;
    return run(chrom, host);
  };

  const onEvaluate = (result, n) => {
    result.coverage.forEach((point) => coverage.add(point));
    recordFailure(archive, result, lastChrom, n, null);
  };

  randomSearch({ rng: mulberry32(seed), budget, length: p.length, alphabet: p.alphabet, evaluate, onEvaluate });
  return { archive, coverage, evaluations: budget };
}
