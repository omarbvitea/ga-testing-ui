import { DEFAULTS } from './defaults.js';
import { randomChromosome } from './random.js';
import { linearScale } from './operators/scaling.js';
import { roulette } from './operators/selection.js';
import { onePointCrossover } from './operators/crossover.js';
import { mutate } from './operators/mutation.js';

const average = (values) => values.reduce((sum, v) => sum + v, 0) / values.length;

const rankByFitness = (fitness) => fitness.map((_, i) => i).sort((i, j) => fitness[j] - fitness[i]);

function initialPopulation(rng, p) {
  return Array.from({ length: p.popSize }, () => randomChromosome(rng, p.length, p.alphabet));
}

function breed(rng, population, scaled, p) {
  const a = population[roulette(rng, scaled)];
  const b = population[roulette(rng, scaled)];
  return rng() < p.pc ? onePointCrossover(rng, a, b) : [a.slice(), b.slice()];
}

function nextGeneration(rng, population, fitness, order, p) {
  const scaled = linearScale(fitness, p.cmult);
  const next = order.slice(0, p.elitism).map((i) => population[i].slice());
  while (next.length < p.popSize) {
    const [c1, c2] = breed(rng, population, scaled, p);
    next.push(mutate(rng, c1, p.pm, p.alphabet));
    if (next.length < p.popSize) next.push(mutate(rng, c2, p.pm, p.alphabet));
  }
  return next;
}

export function evolve({ evaluate, fitnessOf, rng, onGeneration, ...opts }) {
  const p = { ...DEFAULTS, ...opts };
  let population = initialPopulation(rng, p);
  const history = [];
  let evaluations = 0;
  let best = null;

  for (let gen = 0; gen <= p.generations; gen++) {
    const results = population.map((c) => {
      evaluations++;
      return evaluate(c);
    });
    const fitness = fitnessOf ? fitnessOf(results) : results.map((r) => r.fitness);
    const order = rankByFitness(fitness);
    const top = order[0];

    history.push({ gen, best: fitness[top], avg: average(fitness) });
    if (!best || fitness[top] > best.fitness) {
      best = { chrom: population[top], fitness: fitness[top], result: results[top] };
    }
    if (onGeneration) onGeneration({ gen, population, results, fitness });
    if (gen === p.generations) break;

    population = nextGeneration(rng, population, fitness, order, p);
  }
  return { best, history, evaluations };
}
