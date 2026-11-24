import { createTodoApp } from './app/todo.js';
import { BUGS } from './app/bugs.js';
import { ACTIONS, minimize, toPlaywright } from './ga/executor.js';
import { runGA, runRandom } from './ga/experiment.js';
import { DEFAULTS } from './ga/ga.js';

createTodoApp(document.getElementById('app-demo'));
const sandbox = document.getElementById('sandbox');
const bugName = (id) => (BUGS.find((b) => b.id === id) || { name: 'Uncatalogued failure' }).name;
const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

function draw(history) {
  const cv = document.getElementById('chart');
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height, m = 36;
  ctx.clearRect(0, 0, W, H);
  const maxY = Math.max(...history.map((h) => Math.max(h.best, h.bugs * 10))) * 1.1 || 1;
  const x = (g) => m + (g / Math.max(1, history.length - 1)) * (W - 2 * m);
  const y = (v) => H - m + 10 - (v / maxY) * (H - 2 * m);
  ctx.strokeStyle = '#dfe3ea'; ctx.fillStyle = '#5d6675'; ctx.font = '12px system-ui';
  for (let i = 0; i <= 4; i++) {
    const v = (maxY * i) / 4;
    ctx.beginPath(); ctx.moveTo(m, y(v)); ctx.lineTo(W - m, y(v)); ctx.stroke();
    ctx.fillText(v.toFixed(0), 4, y(v) + 4);
  }
  ctx.fillText('generation', W / 2 - 30, H - 4);
  const css = getComputedStyle(document.documentElement);
  const series = (key, color, f = (v) => v) => {
    ctx.strokeStyle = css.getPropertyValue(color); ctx.lineWidth = 2; ctx.beginPath();
    history.forEach((h, i) => (i ? ctx.lineTo : ctx.moveTo).call(ctx, x(h.gen), y(f(h[key]))));
    ctx.stroke(); ctx.lineWidth = 1;
  };
  series('avg', '--avg'); series('best', '--best'); series('bugs', '--bugs', (v) => v * 10);
}

function readParams() {
  const f = new FormData(document.getElementById('params'));
  const n = (k) => Number(f.get(k));
  return { seed: n('seed'), popSize: n('popSize'), generations: n('generations'), length: n('length'), pc: n('pc'), pm: n('pm') };
}

function showCases(archive) {
  const container = document.getElementById('cases');
  if (archive.size === 0) { container.innerHTML = '<p class="note">No failures found.</p>'; return; }
  const rows = [...archive.values()].sort((a, b) => a.bug.localeCompare(b.bug));
  container.innerHTML = rows.map((c) => {
    const min = minimize(c.chrom, c.signature, sandbox);
    c.minimal = min;
    return `<div class="case">
      <h3>${c.bug}: ${esc(bugName(c.bug))}<span class="tag">${c.failure.type}</span></h3>
      <div class="note">Found in generation ${c.gen}, evaluation ${c.evaluation}. Oracle: <code>${esc(c.failure.message)}</code></div>
      <ol>${min.map((g) => `<li>${esc(ACTIONS[g].name)}</li>`).join('')}</ol>
      <details><summary>Playwright test</summary><pre>${esc(toPlaywright(min, `${c.bug} ${bugName(c.bug)}`))}</pre></details>
    </div>`;
  }).join('');
}

document.getElementById('params').addEventListener('submit', (e) => {
  e.preventDefault();
  const p = readParams();
  const status = document.getElementById('status');
  status.textContent = 'Running…';
  setTimeout(() => {
    const t0 = performance.now();
    const r = runGA(p.seed, p, sandbox);
    const ms = (performance.now() - t0).toFixed(0);
    draw(r.history);
    showCases(r.archive);
    status.textContent = `${r.evaluations} evaluations in ${ms} ms · coverage ${r.coverage.size} points · ${r.archive.size} distinct failures`;
    window.__lastRun = { params: p, history: r.history, cases: [...r.archive.values()].map((c) => ({ bug: c.bug, gen: c.gen, evaluation: c.evaluation, minimal: c.minimal, steps: c.minimal.map((g) => ACTIONS[g].name) })) };
  }, 20);
});

document.getElementById('btnExp').addEventListener('click', () => {
  const seedCount = Number(document.getElementById('seedCount').value);
  const container = document.getElementById('experiment');
  container.innerHTML = '<p class="note">Running…</p>';
  setTimeout(() => {
    const p = { ...DEFAULTS, ...readParams() };
    const budget = p.popSize * (p.generations + 1);
    const data = { params: p, budget, seeds: seedCount, ga: [], random: [] };
    for (let s = 1; s <= seedCount; s++) {
      const g = runGA(s, p, sandbox);
      const a = runRandom(s, budget, p, sandbox);
      const summary = (r) => ({ coverage: r.coverage.size, bugs: Object.fromEntries([...r.archive.values()].map((c) => [c.bug, c.evaluation])) });
      data.ga.push(summary(g));
      data.random.push(summary(a));
    }
    const mean = (xs) => xs.reduce((s, v) => s + v, 0) / (xs.length || 1);
    const row = (id) => {
      const cell = (runs) => {
        const found = runs.filter((r) => r.bugs[id] != null);
        return `${found.length}/${runs.length}` + (found.length ? ` · ${mean(found.map((r) => r.bugs[id])).toFixed(0)} ev.` : '');
      };
      return `<tr><td>${id}</td><td>${esc(bugName(id))}</td><td>${cell(data.ga)}</td><td>${cell(data.random)}</td></tr>`;
    };
    const nb = (runs) => mean(runs.map((r) => Object.keys(r.bugs).filter((k) => k !== 'UNKNOWN').length)).toFixed(2);
    const cov = (runs) => mean(runs.map((r) => r.coverage)).toFixed(1);
    data.summary = { gaBugs: nb(data.ga), randomBugs: nb(data.random), gaCov: cov(data.ga), randomCov: cov(data.random) };
    container.innerHTML = `<table><thead><tr><th>Bug</th><th>Description</th><th>GA (runs · avg. evals.)</th><th>Random</th></tr></thead><tbody>
      ${BUGS.map((b) => row(b.id)).join('')}
      <tr><td></td><td><b>Average distinct bugs</b></td><td><b>${data.summary.gaBugs}</b></td><td><b>${data.summary.randomBugs}</b></td></tr>
      <tr><td></td><td><b>Average coverage (points)</b></td><td>${data.summary.gaCov}</td><td>${data.summary.randomCov}</td></tr>
      </tbody></table>`;
    document.getElementById('json').textContent = JSON.stringify(data, null, 1);
    window.__experiment = data;
  }, 20);
});
