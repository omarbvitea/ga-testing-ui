import { createTodoApp } from '../app/todo/index.js';
import { runGA } from '../experiment/index.js';
import { drawChart } from './chart.js';
import { readParams } from './params.js';
import { renderCases, summarizeRun } from './cases.js';
import { runComparison, comparisonTable } from './comparison.js';

const $ = (id) => document.getElementById(id);
const sandbox = $('sandbox');
const form = $('params');

const deferred = (fn) => setTimeout(fn, 20);

function onRunGA(e) {
  e.preventDefault();
  const params = readParams(form);
  $('status').textContent = 'Running…';
  deferred(() => {
    const start = performance.now();
    const result = runGA(params.seed, params, sandbox);
    const ms = (performance.now() - start).toFixed(0);
    drawChart($('chart'), result.history);
    renderCases($('cases'), result.archive, sandbox);
    $('status').textContent = `${result.evaluations} evaluations in ${ms} ms · coverage ${result.coverage.size} points · ${result.archive.size} distinct failures`;
    window.__lastRun = summarizeRun(params, result);
  });
}

function onRunExperiment() {
  const seedCount = Number($('seedCount').value);
  const container = $('experiment');
  container.innerHTML = '<p class="note">Running…</p>';
  deferred(() => {
    const data = runComparison(readParams(form), seedCount, sandbox);
    container.innerHTML = comparisonTable(data);
    $('json').textContent = JSON.stringify(data, null, 1);
    window.__experiment = data;
  });
}

createTodoApp($('app-demo'));
form.addEventListener('submit', onRunGA);
$('btnExp').addEventListener('click', onRunExperiment);
