export function createState() {
  return { items: [], filter: 'all', nextId: 1, active: 0, focus: null, undo: [] };
}

export const cloneItems = (items) => items.map((item) => ({ ...item }));

export const findItem = (state, id) => state.items.find((item) => item.id === id);

export function visibleItems(state) {
  if (state.filter === 'active') return state.items.filter((item) => !item.done);
  if (state.filter === 'done') return state.items.filter((item) => item.done);
  return state.items.slice();
}

export function saveSnapshot(state) {
  state.undo.push(cloneItems(state.items));
}
