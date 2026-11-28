import { findItem, visibleItems, saveSnapshot } from './state.js';

export function addItem(ctx) {
  const { state, input, cov } = ctx;
  cov('add');
  const raw = input.value;
  if (raw === '') {
    cov('add-empty');
    return;
  }
  const text = raw.trim();
  const title = text[0].toUpperCase() + text.slice(1);
  saveSnapshot(state);
  state.items.push({ id: state.nextId++, title, done: false });
  state.active++;
  input.value = '';
  cov(state.items.length > 1 ? 'add-many' : 'add-first');
  ctx.render();
}

export function toggleItem(ctx, id) {
  const { state, cov } = ctx;
  cov('toggle');
  const item = findItem(state, id);
  saveSnapshot(state);
  item.done = !item.done;
  state.active += item.done ? -1 : 1;
  cov(item.done ? 'toggle-done' : 'toggle-undone');
  ctx.render();
}

export function removeItem(ctx, id) {
  const { state, cov } = ctx;
  cov('remove');
  saveSnapshot(state);
  const index = state.items.findIndex((item) => item.id === id);
  const [removed] = state.items.splice(index, 1);
  if (!removed.done) state.active--;
  state.nextId = state.items.length + 1;
  if (state.filter !== 'all') {
    cov('remove-filtered');
    const visible = visibleItems(state);
    const next = visible[Math.min(index, visible.length - 1)];
    state.focus = next.id;
  }
  ctx.render();
}

export function editItem(ctx, id) {
  const { state, input, cov } = ctx;
  cov('edit');
  const item = findItem(state, id);
  saveSnapshot(state);
  item.title = input.value.trim();
  if (item.title === '') cov('edit-empty');
  ctx.render();
}

export function setFilter(ctx, filter) {
  ctx.cov('filter-' + filter);
  ctx.state.filter = filter;
  ctx.render();
}

export function clearDone(ctx) {
  const { state, cov } = ctx;
  cov('clear');
  const done = state.items.filter((item) => item.done);
  if (done.length === 0) {
    cov('clear-none');
    return;
  }
  saveSnapshot(state);
  state.items = state.items.filter((item) => !item.done);
  if (done.length >= 2) {
    cov('clear-many');
    state.active -= 1;
  }
  ctx.render();
}

export function undo(ctx) {
  const { state, cov } = ctx;
  if (state.undo.length === 0) {
    cov('undo-empty');
    return;
  }
  cov('undo');
  state.items = state.undo.pop();
  state.active = state.items.filter((item) => !item.done).length;
  ctx.render();
}
