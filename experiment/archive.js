import { classify } from '../app/bugs.js';

export function recordFailure(archive, result, chrom, evaluation, gen) {
  if (!result.failure || archive.has(result.failure.signature)) return;
  archive.set(result.failure.signature, {
    signature: result.failure.signature,
    bug: classify(result.failure),
    failure: result.failure,
    chrom: chrom.slice(),
    evaluation,
    gen,
  });
}
