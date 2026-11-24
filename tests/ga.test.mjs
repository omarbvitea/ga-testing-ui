import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32, linearScale, roulette, onePointCrossover, mutate, evolve, randomChromosome } from '../ga/ga.js';

test('the RNG with the same seed repeats the sequence', () => {
  const a = mulberry32(42), b = mulberry32(42);
  for (let i = 0; i < 100; i++) assert.equal(a(), b());
});

test('roulette: selection frequency ≈ f_i / Σf (Goldberg ch. 1)', () => {
  const rng = mulberry32(1);
  const f = [1, 2, 3, 4];
  const count = [0, 0, 0, 0];
  const n = 200000;
  for (let i = 0; i < n; i++) count[roulette(rng, f)]++;
  f.forEach((fi, i) => assert.ok(Math.abs(count[i] / n - fi / 10) < 0.01, `index ${i}`));
});

test('linear scaling preserves the average and maps the maximum to C·average (Goldberg ch. 3)', () => {
  const f = [10, 12, 14, 30];
  const C = 2;
  const s = linearScale(f, C);
  const avg = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
  assert.ok(Math.abs(avg(s) - avg(f)) < 1e-9);
  assert.ok(Math.abs(Math.max(...s) - C * avg(f)) < 1e-9);
  assert.ok(Math.min(...s) >= 0);
});

test('linear scaling never produces negative fitness', () => {
  const f = [0.1, 0.1, 0.1, 50];
  const s = linearScale(f, 2);
  assert.ok(s.every((v) => v >= 0));
});

test('one-point crossover: children combine the prefix of one parent and the suffix of the other', () => {
  const rng = mulberry32(7);
  const a = [1, 1, 1, 1, 1, 1], b = [2, 2, 2, 2, 2, 2];
  for (let i = 0; i < 50; i++) {
    const [c1, c2, k] = onePointCrossover(rng, a, b);
    assert.ok(k >= 1 && k <= a.length - 1);
    assert.deepEqual(c1, [...a.slice(0, k), ...b.slice(k)]);
    assert.deepEqual(c2, [...b.slice(0, k), ...a.slice(k)]);
  }
});

test('mutation: pm=0 changes nothing; pm=1 changes every gene within the alphabet', () => {
  const rng = mulberry32(3);
  const c = randomChromosome(rng, 30, 15);
  assert.deepEqual(mutate(rng, c, 0, 15), c);
  const m = mutate(rng, c, 1, 15);
  m.forEach((g, i) => { assert.notEqual(g, c[i]); assert.ok(g >= 0 && g < 15); });
});

test('the GA beats the initial population on a known problem (count genes = 1)', () => {
  const r = evolve({
    rng: mulberry32(5), popSize: 30, length: 20, alphabet: 4, generations: 40, pm: 0.02,
    evaluate: (c) => ({ fitness: 1 + c.filter((g) => g === 1).length }),
  });
  assert.ok(r.history.at(-1).best > r.history[0].best);
  assert.ok(r.best.fitness >= 18, `best = ${r.best.fitness}`);
});

test('elitism: the best fitness never decreases across generations', () => {
  const r = evolve({
    rng: mulberry32(9), popSize: 20, length: 16, alphabet: 5, generations: 25,
    evaluate: (c) => ({ fitness: 1 + c.filter((g) => g === 2).length }),
  });
  for (let i = 1; i < r.history.length; i++) assert.ok(r.history[i].best >= r.history[i - 1].best);
});
