import { createTodoApp } from '../app/todo.js';

export const ACTIONS = [
  { name: 'NOOP' },
  { name: 'type "buy bread"', pw: "await page.getByTestId('new').fill('buy bread');" },
  { name: 'type "   " (spaces)', pw: "await page.getByTestId('new').fill('   ');" },
  { name: 'clear input', pw: "await page.getByTestId('new').fill('');" },
  { name: 'click Add', pw: "await page.getByTestId('add').click();" },
  { name: 'toggle first visible', pw: "await page.locator('li').first().locator('[data-action=toggle]').click();" },
  { name: 'toggle last visible', pw: "await page.locator('li').last().locator('[data-action=toggle]').click();" },
  { name: 'delete first visible', pw: "await page.locator('li').first().locator('[data-action=delete]').click();" },
  { name: 'delete last visible', pw: "await page.locator('li').last().locator('[data-action=delete]').click();" },
  { name: 'filter All', pw: "await page.getByTestId('f-all').click();" },
  { name: 'filter Active', pw: "await page.getByTestId('f-active').click();" },
  { name: 'filter Done', pw: "await page.getByTestId('f-done').click();" },
  { name: 'click Clear done', pw: "await page.getByTestId('clear').click();" },
  { name: 'click Undo', pw: "await page.getByTestId('undo').click();" },
  { name: 'edit first visible', pw: "await page.locator('li').first().locator('[data-action=edit]').click();" },
];

const q = (host, id) => host.querySelector(`[data-testid="${id}"]`);

function typeText(host, text) {
  const input = q(host, 'new');
  input.value = text;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

function clickItem(host, which, action) {
  const items = host.querySelectorAll('li');
  if (items.length === 0) return;
  const li = which === 'first' ? items[0] : items[items.length - 1];
  li.querySelector(`[data-action="${action}"]`).click();
}

function apply(gene, host) {
  switch (gene) {
    case 1: return typeText(host, 'buy bread');
    case 2: return typeText(host, '   ');
    case 3: return typeText(host, '');
    case 4: return q(host, 'add').click();
    case 5: return clickItem(host, 'first', 'toggle');
    case 6: return clickItem(host, 'last', 'toggle');
    case 7: return clickItem(host, 'first', 'delete');
    case 8: return clickItem(host, 'last', 'delete');
    case 9: return q(host, 'f-all').click();
    case 10: return q(host, 'f-active').click();
    case 11: return q(host, 'f-done').click();
    case 12: return q(host, 'clear').click();
    case 13: return q(host, 'undo').click();
    case 14: return clickItem(host, 'first', 'edit');
    default: return undefined;
  }
}

function checkInvariants(app, host) {
  const s = app.debugState();
  const pending = s.items.filter((i) => !i.done).length;
  const text = q(host, 'counter').textContent;
  if (text !== `${pending} pending`) return 'INV-counter';
  const ids = s.items.map((i) => i.id);
  if (new Set(ids).size !== ids.length) return 'INV-unique-ids';
  if (s.items.some((i) => i.title === '')) return 'INV-empty-title';
  if (host.querySelectorAll('li').length !== s.visible.length) return 'INV-list';
  return null;
}

export function run(chromosome, host) {
  host.innerHTML = '';
  const coverage = new Set();
  const app = createTodoApp(host, (id) => coverage.add(id));
  let caughtError = null;
  const onError = (e) => { caughtError = e.error || new Error(e.message); e.preventDefault(); };
  window.addEventListener('error', onError);

  let failure = null;
  let steps = 0;
  try {
    for (let i = 0; i < chromosome.length; i++) {
      const g = chromosome[i];
      if (g === 0) continue;
      steps++;
      caughtError = null;
      try { apply(g, host); } catch (e) { caughtError = e; }
      if (caughtError) {
        failure = { type: 'crash', signature: 'CRASH:' + caughtError.message, message: caughtError.message, index: i };
        break;
      }
      const inv = checkInvariants(app, host);
      if (inv) { failure = { type: 'invariant', signature: inv, message: inv, index: i }; break; }
    }
  } finally {
    window.removeEventListener('error', onError);
  }
  return { coverage, failure, steps };
}

export function minimize(chromosome, signature, host) {
  let s = chromosome.filter((g) => g !== 0);
  const reproduces = (seq) => { const r = run(seq, host); return r.failure && r.failure.signature === signature; };
  if (!reproduces(s)) return s;
  let changed = true;
  while (changed) {
    changed = false;
    for (let i = 0; i < s.length; i++) {
      const t = s.slice(0, i).concat(s.slice(i + 1));
      if (reproduces(t)) { s = t; changed = true; break; }
    }
  }
  return s;
}

export function toPlaywright(seq, title) {
  const steps = seq.map((g) => '  ' + ACTIONS[g].pw).join('\n');
  return `test('${title}', async ({ page }) => {\n  await page.goto('/');\n${steps}\n});`;
}
