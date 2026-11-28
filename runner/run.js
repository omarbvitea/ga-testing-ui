import { createTodoApp } from '../app/todo/index.js';
import { ACTIONS } from './actions.js';
import { findBrokenInvariant } from './invariants.js';

function performStep(gene, host, errors) {
  errors.last = null;
  try {
    ACTIONS[gene].perform(host);
  } catch (e) {
    errors.last = e;
  }
  return errors.last;
}

function crashFailure(error, index) {
  return { type: 'crash', signature: 'CRASH:' + error.message, message: error.message, index };
}

function invariantFailure(signature, index) {
  return { type: 'invariant', signature, message: signature, index };
}

export function run(chromosome, host) {
  host.innerHTML = '';
  const coverage = new Set();
  const app = createTodoApp(host, (id) => coverage.add(id));
  const errors = { last: null };
  const onError = (e) => {
    errors.last = e.error || new Error(e.message);
    e.preventDefault();
  };
  window.addEventListener('error', onError);

  let failure = null;
  let steps = 0;
  try {
    for (let i = 0; i < chromosome.length; i++) {
      const gene = chromosome[i];
      if (gene === 0) continue;
      steps++;
      const error = performStep(gene, host, errors);
      if (error) {
        failure = crashFailure(error, i);
        break;
      }
      const broken = findBrokenInvariant(app, host);
      if (broken) {
        failure = invariantFailure(broken, i);
        break;
      }
    }
  } finally {
    window.removeEventListener('error', onError);
  }
  return { coverage, failure, steps };
}
