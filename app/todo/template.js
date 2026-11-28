export const APP_TEMPLATE = `
  <div class="todo">
    <div class="row">
      <input data-testid="new" placeholder="New task" autocomplete="off">
      <button data-testid="add">Add</button>
    </div>
    <div class="row filters">
      <button data-testid="f-all">All</button>
      <button data-testid="f-active">Active</button>
      <button data-testid="f-done">Done</button>
    </div>
    <ul data-testid="list"></ul>
    <div class="row footer">
      <span data-testid="counter"></span>
      <button data-testid="clear">Clear done</button>
      <button data-testid="undo">Undo</button>
    </div>
  </div>`;

export const ITEM_TEMPLATE = `
  <button data-action="toggle" title="Toggle">✓</button>
  <span class="title"></span>
  <button data-action="edit" title="Replace text with the input value">✎</button>
  <button data-action="delete" title="Delete">✕</button>`;
