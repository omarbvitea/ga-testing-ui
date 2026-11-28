import { APP_TEMPLATE } from './template.js';
import { createState, cloneItems, visibleItems } from './state.js';
import { render } from './view.js';
import { addItem, toggleItem, removeItem, editItem, setFilter, clearDone, undo } from './actions.js';

const ITEM_ACTIONS = { toggle: toggleItem, edit: editItem, delete: removeItem };

function bindEvents(root, ctx, elements) {
  const byTestId = (id) => root.querySelector(`[data-testid="${id}"]`);
  byTestId('add').addEventListener('click', () => addItem(ctx));
  byTestId('f-all').addEventListener('click', () => setFilter(ctx, 'all'));
  byTestId('f-active').addEventListener('click', () => setFilter(ctx, 'active'));
  byTestId('f-done').addEventListener('click', () => setFilter(ctx, 'done'));
  byTestId('clear').addEventListener('click', () => clearDone(ctx));
  byTestId('undo').addEventListener('click', () => undo(ctx));
  elements.input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addItem(ctx);
  });
  elements.list.addEventListener('click', (e) => {
    const button = e.target.closest('button[data-action]');
    if (!button) return;
    const id = Number(button.closest('li').dataset.id);
    ITEM_ACTIONS[button.dataset.action](ctx, id);
  });
}

export function createTodoApp(root, cov = () => {}) {
  root.innerHTML = APP_TEMPLATE;
  const byTestId = (id) => root.querySelector(`[data-testid="${id}"]`);
  const elements = { input: byTestId('new'), list: byTestId('list'), counter: byTestId('counter') };
  const state = createState();
  const ctx = { state, input: elements.input, cov, render: () => render(state, elements) };

  bindEvents(root, ctx, elements);
  ctx.render();

  return {
    debugState: () => ({ ...state, items: cloneItems(state.items), visible: visibleItems(state) }),
  };
}
