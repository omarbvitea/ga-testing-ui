import { BUGS } from '../app/bugs.js';
import { DEFAULTS } from '../ga/index.js';
import { runGA, runRandom } from '../experiment/index.js';
import { escapeHtml, bugName, mean } from './format.js';

const summarize = (result) => ({
  coverage: result.coverage.size,
  bugs: Object.fromEntries([...result.archive.values()].map((c) => [c.bug, c.evaluation])),
});

const distinctBugs = (runs) => mean(runs.map((r) => Object.keys(r.bugs).filter((k) => k !== 'UNKNOWN').length)).toFixed(2);

const averageCoverage = (runs) => mean(runs.map((r) => r.coverage)).toFixed(1);

export function runComparison(options, seedCount, sandbox) {
  const params = { ...DEFAULTS, ...options };
  const budget = params.popSize * (params.generations + 1);
  const data = { params, budget, seeds: seedCount, ga: [], random: [] };
  for (let seed = 1; seed <= seedCount; seed++) {
    data.ga.push(summarize(runGA(seed, params, sandbox)));
    data.random.push(summarize(runRandom(seed, budget, params, sandbox)));
  }
  data.summary = {
    gaBugs: distinctBugs(data.ga),
    randomBugs: distinctBugs(data.random),
    gaCov: averageCoverage(data.ga),
    randomCov: averageCoverage(data.random),
  };
  return data;
}

function bugCell(runs, id) {
  const found = runs.filter((r) => r.bugs[id] != null);
  const avgEvals = found.length ? ` · ${mean(found.map((r) => r.bugs[id])).toFixed(0)} ev.` : '';
  return `${found.length}/${runs.length}${avgEvals}`;
}

function bugRow(data, id) {
  return `<tr><td>${id}</td><td>${escapeHtml(bugName(id))}</td><td>${bugCell(data.ga, id)}</td><td>${bugCell(data.random, id)}</td></tr>`;
}

export function comparisonTable(data) {
  const { summary } = data;
  return `<table><thead><tr><th>Bug</th><th>Description</th><th>GA (runs · avg. evals.)</th><th>Random</th></tr></thead><tbody>
    ${BUGS.map((b) => bugRow(data, b.id)).join('')}
    <tr><td></td><td><b>Average distinct bugs</b></td><td><b>${summary.gaBugs}</b></td><td><b>${summary.randomBugs}</b></td></tr>
    <tr><td></td><td><b>Average coverage (points)</b></td><td>${summary.gaCov}</td><td>${summary.randomCov}</td></tr>
    </tbody></table>`;
}
