export const WEIGHTS = { failure: 30, step: 0.1 };

function countBySignature(results) {
  const niche = new Map();
  for (const r of results) {
    if (r.failure) niche.set(r.failure.signature, (niche.get(r.failure.signature) || 0) + 1);
  }
  return niche;
}

export function sharedFitness(results) {
  const niche = countBySignature(results);
  return results.map((r) => {
    const bonus = r.failure ? WEIGHTS.failure / niche.get(r.failure.signature) : 0;
    return Math.max(0.1, 1 + r.coverage.size + bonus - WEIGHTS.step * r.steps);
  });
}
