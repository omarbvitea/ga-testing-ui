import { evolve, randomSearch, mulberry32, DEFAULTS } from './ga.js';
import { run } from './executor.js';
import { classify } from '../app/bugs.js';

export const WEIGHTS = { failure: 30, step: 0.1 };

export function sharedFitness(results) {
  const niche = new Map();
  for (const r of results) if (r.failure) niche.set(r.failure.signature, (niche.get(r.failure.signature) || 0) + 1);
  return results.map((r) => {
    const bonus = r.failure ? WEIGHTS.failure / niche.get(r.failure.signature) : 0;
    return Math.max(0.1, 1 + r.coverage.size + bonus - WEIGHTS.step * r.steps);
  });
}

function record(archive, r, chrom, evalN, gen) {
  if (!r.failure || archive.has(r.failure.signature)) return;
  archive.set(r.failure.signature, { signature: r.failure.signature, bug: classify(r.failure), failure: r.failure, chrom: chrom.slice(), evaluation: evalN, gen });
}

export function runGA(seed, options, host, onGen) {
  const p = { ...DEFAULTS, ...options };
  const rng = mulberry32(seed);
  const archive = new Map();
  const coverage = new Set();
  const perGeneration = [];
  let evalN = 0;
  let currentGen = 0;
  const { history, evaluations } = evolve({
    ...p,
    rng,
    evaluate: (c) => {
      const r = run(c, host);
      evalN++;
      r.coverage.forEach((x) => coverage.add(x));
      record(archive, r, c, evalN, currentGen);
      return r;
    },
    fitnessOf: sharedFitness,
    onGeneration: (g) => {
      perGeneration.push({ gen: g.gen, bugs: archive.size, coverage: coverage.size });
      currentGen = g.gen + 1;
      if (onGen) onGen(g, archive, coverage);
    },
  });
  history.forEach((h, i) => Object.assign(h, perGeneration[i]));
  return { archive, coverage, history, evaluations };
}

export function runRandom(seed, budget, options, host) {
  const p = { ...DEFAULTS, ...options };
  const rng = mulberry32(seed);
  const archive = new Map();
  const coverage = new Set();
  let last = null;
  randomSearch({
    rng, budget, length: p.length, alphabet: p.alphabet,
    evaluate: (c) => { last = c; return run(c, host); },
    onEvaluate: (r, n) => { r.coverage.forEach((x) => coverage.add(x)); record(archive, r, last, n, null); },
  });
  return { archive, coverage, evaluations: budget };
}
