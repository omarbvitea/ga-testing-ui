import { ACTIONS, minimize, toPlaywright } from '../runner/index.js';
import { escapeHtml, bugName } from './format.js';

function caseHtml(testCase, minimal) {
  const title = `${testCase.bug} ${bugName(testCase.bug)}`;
  const steps = minimal.map((g) => `<li>${escapeHtml(ACTIONS[g].name)}</li>`).join('');
  return `<div class="case">
    <h3>${testCase.bug}: ${escapeHtml(bugName(testCase.bug))}<span class="tag">${testCase.failure.type}</span></h3>
    <div class="note">Found in generation ${testCase.gen}, evaluation ${testCase.evaluation}. Oracle: <code>${escapeHtml(testCase.failure.message)}</code></div>
    <ol>${steps}</ol>
    <details><summary>Playwright test</summary><pre>${escapeHtml(toPlaywright(minimal, title))}</pre></details>
  </div>`;
}

export function renderCases(container, archive, sandbox) {
  if (archive.size === 0) {
    container.innerHTML = '<p class="note">No failures found.</p>';
    return;
  }
  const cases = [...archive.values()].sort((a, b) => a.bug.localeCompare(b.bug));
  container.innerHTML = cases.map((testCase) => {
    testCase.minimal = minimize(testCase.chrom, testCase.signature, sandbox);
    return caseHtml(testCase, testCase.minimal);
  }).join('');
}

export function summarizeRun(params, result) {
  return {
    params,
    history: result.history,
    cases: [...result.archive.values()].map((c) => ({
      bug: c.bug,
      gen: c.gen,
      evaluation: c.evaluation,
      minimal: c.minimal,
      steps: c.minimal.map((g) => ACTIONS[g].name),
    })),
  };
}
