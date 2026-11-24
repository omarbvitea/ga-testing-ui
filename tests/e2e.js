import { run, minimize } from '../ga/executor.js';
import { classify } from '../app/bugs.js';
import { runGA } from '../ga/experiment.js';

const host = document.getElementById('sandbox');
const cases = [];
const testCase = (name, fn) => cases.push({ name, fn });
const equal = (a, b, msg) => { if (a !== b) throw new Error(`${msg}: expected ${b}, got ${a}`); };

const REPRODUCERS = {
  B1: [2, 4],
  B2: [1, 4, 10, 7],
  B3: [1, 4, 1, 4, 5, 6, 12],
  B4: [1, 4, 1, 4, 7, 1, 4],
  B5: [1, 4, 14],
};

testCase('a normal flow produces no failures', () => {
  const r = run([1, 4, 1, 4, 5, 9, 10, 11, 9, 13, 12], host);
  equal(r.failure, null, 'failure');
});

testCase('events without a target (empty list) have no effect', () => {
  const r = run([5, 6, 7, 8, 14, 12, 13], host);
  equal(r.failure, null, 'failure');
});

testCase('coverage grows when more features are used', () => {
  const low = run([1, 4], host).coverage.size;
  const high = run([1, 4, 1, 4, 5, 9, 10, 11, 9, 13], host).coverage.size;
  if (!(high > low)) throw new Error(`${high} <= ${low}`);
});

for (const [bug, seq] of Object.entries(REPRODUCERS)) {
  testCase(`${bug}: the manual reproducer triggers the bug`, () => {
    const r = run(seq, host);
    equal(classify(r.failure), bug, 'bug');
  });
}

testCase('minimization removes unnecessary steps and keeps the bug', () => {
  const noisy = [9, 0, 2, 9, 0, 13, 4, 10];
  const r = run(noisy, host);
  const min = minimize(noisy, r.failure.signature, host);
  equal(JSON.stringify(min), JSON.stringify([2, 4]), 'minimal');
});

testCase('the GA (seed 1, default parameters) finds at least 4 of the 5 bugs', () => {
  const r = runGA(1, {}, host);
  const bugs = new Set([...r.archive.values()].map((c) => c.bug));
  if (bugs.size < 4) throw new Error(`only found ${[...bugs].join(', ')}`);
});

let ok = 0;
const ul = document.getElementById('list');
for (const c of cases) {
  const li = document.createElement('li');
  try { c.fn(); ok++; li.className = 'ok'; li.textContent = '✔ ' + c.name; }
  catch (e) { li.className = 'ko'; li.textContent = '✘ ' + c.name + ' — ' + e.message; }
  ul.appendChild(li);
}
document.getElementById('summary').textContent = `${ok}/${cases.length} tests passed`;
window.__tests = { ok, total: cases.length };
