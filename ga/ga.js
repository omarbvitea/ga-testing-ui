export function mulberry32(seed) {
  let a = seed >>> 0;
  return function rng() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const randInt = (rng, n) => Math.floor(rng() * n);

export function randomChromosome(rng, L, k) {
  return Array.from({ length: L }, () => randInt(rng, k));
}

export function linearScale(fit, cmult = 2) {
  const n = fit.length;
  const avg = fit.reduce((s, f) => s + f, 0) / n;
  const max = Math.max(...fit);
  const min = Math.min(...fit);
  if (max - avg < 1e-12 || avg <= 0) return fit.map(() => 1);
  let a, b;
  if (min > (cmult * avg - max) / (cmult - 1)) {
    const d = max - avg;
    a = ((cmult - 1) * avg) / d;
    b = (avg * (max - cmult * avg)) / d;
  } else {
    const d = avg - min;
    a = avg / d;
    b = (-min * avg) / d;
  }
  return fit.map((f) => Math.max(0, a * f + b));
}

export function roulette(rng, weights) {
  const total = weights.reduce((s, w) => s + w, 0);
  if (total <= 0) return randInt(rng, weights.length);
  let r = rng() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r < 0) return i;
  }
  return weights.length - 1;
}

export function onePointCrossover(rng, a, b) {
  const L = a.length;
  const site = 1 + randInt(rng, L - 1);
  return [a.slice(0, site).concat(b.slice(site)), b.slice(0, site).concat(a.slice(site)), site];
}

export function mutate(rng, c, pm, k) {
  return c.map((g) => {
    if (rng() >= pm) return g;
    const value = randInt(rng, k - 1);
    return value >= g ? value + 1 : value;
  });
}

export const DEFAULTS = {
  popSize: 30,
  length: 20,
  alphabet: 15,
  pc: 0.8,
  pm: 0.05,
  generations: 30,
  elitism: 2,
  cmult: 1.8,
};

export function evolve({ evaluate, fitnessOf, rng, onGeneration, ...opts }) {
  const p = { ...DEFAULTS, ...opts };
  let population = Array.from({ length: p.popSize }, () => randomChromosome(rng, p.length, p.alphabet));
  const history = [];
  let evaluations = 0;
  let best = null;

  for (let gen = 0; gen <= p.generations; gen++) {
    const results = population.map((c) => { evaluations++; return evaluate(c); });
    const fitness = fitnessOf ? fitnessOf(results) : results.map((r) => r.fitness);

    const order = fitness.map((f, i) => i).sort((i, j) => fitness[j] - fitness[i]);
    const avg = fitness.reduce((s, f) => s + f, 0) / fitness.length;
    history.push({ gen, best: fitness[order[0]], avg });
    if (!best || fitness[order[0]] > best.fitness) {
      best = { chrom: population[order[0]], fitness: fitness[order[0]], result: results[order[0]] };
    }
    if (onGeneration) onGeneration({ gen, population, results, fitness });
    if (gen === p.generations) break;

    const scaled = linearScale(fitness, p.cmult);
    const next = order.slice(0, p.elitism).map((i) => population[i].slice());
    while (next.length < p.popSize) {
      const a = population[roulette(rng, scaled)];
      const b = population[roulette(rng, scaled)];
      let [c1, c2] = rng() < p.pc ? onePointCrossover(rng, a, b) : [a.slice(), b.slice()];
      next.push(mutate(rng, c1, p.pm, p.alphabet));
      if (next.length < p.popSize) next.push(mutate(rng, c2, p.pm, p.alphabet));
    }
    population = next;
  }
  return { best, history, evaluations };
}

export function randomSearch({ evaluate, rng, budget, length, alphabet, onEvaluate }) {
  for (let i = 0; i < budget; i++) {
    const r = evaluate(randomChromosome(rng, length, alphabet));
    if (onEvaluate) onEvaluate(r, i + 1);
  }
}
