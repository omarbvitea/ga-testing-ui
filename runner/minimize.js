import { run } from './run.js';

const withoutIndex = (seq, i) => seq.slice(0, i).concat(seq.slice(i + 1));

function removeOneStep(seq, reproduces) {
  for (let i = 0; i < seq.length; i++) {
    const candidate = withoutIndex(seq, i);
    if (reproduces(candidate)) return candidate;
  }
  return null;
}

export function minimize(chromosome, signature, host) {
  const reproduces = (seq) => {
    const r = run(seq, host);
    return r.failure && r.failure.signature === signature;
  };
  let seq = chromosome.filter((g) => g !== 0);
  if (!reproduces(seq)) return seq;
  let shorter = removeOneStep(seq, reproduces);
  while (shorter) {
    seq = shorter;
    shorter = removeOneStep(seq, reproduces);
  }
  return seq;
}
