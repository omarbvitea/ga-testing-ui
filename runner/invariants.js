import { byTestId } from './dom.js';

const INVARIANTS = [
  {
    signature: 'INV-counter',
    holds: (state, host) => byTestId(host, 'counter').textContent === `${state.items.filter((i) => !i.done).length} pending`,
  },
  {
    signature: 'INV-unique-ids',
    holds: (state) => new Set(state.items.map((i) => i.id)).size === state.items.length,
  },
  {
    signature: 'INV-empty-title',
    holds: (state) => state.items.every((i) => i.title !== ''),
  },
  {
    signature: 'INV-list',
    holds: (state, host) => host.querySelectorAll('li').length === state.visible.length,
  },
];

export function findBrokenInvariant(app, host) {
  const state = app.debugState();
  const broken = INVARIANTS.find((inv) => !inv.holds(state, host));
  return broken ? broken.signature : null;
}
