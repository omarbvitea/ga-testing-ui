export function createTodoApp(root, cov = () => {}) {
  const state = { items: [], filter: 'all', nextId: 1, active: 0, focus: null, undo: [] };

  root.innerHTML = `
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

  const $ = (id) => root.querySelector(`[data-testid="${id}"]`);
  const input = $('new');
  const list = $('list');
  const counter = $('counter');

  const snapshot = () => state.undo.push(state.items.map((i) => ({ ...i })));
  const find = (id) => state.items.find((i) => i.id === id);
  const visibleItems = () =>
    state.items.filter((i) =>
      state.filter === 'all' ? true : state.filter === 'active' ? !i.done : i.done
    );

  function add() {
    cov('add');
    const raw = input.value;
    if (raw === '') { cov('add-empty'); return; }
    const text = raw.trim();
    const title = text[0].toUpperCase() + text.slice(1);
    snapshot();
    state.items.push({ id: state.nextId++, title, done: false });
    state.active++;
    input.value = '';
    cov(state.items.length > 1 ? 'add-many' : 'add-first');
    render();
  }

  function toggle(id) {
    cov('toggle');
    const it = find(id);
    snapshot();
    it.done = !it.done;
    state.active += it.done ? -1 : 1;
    cov(it.done ? 'toggle-done' : 'toggle-undone');
    render();
  }

  function remove(id) {
    cov('remove');
    snapshot();
    const idx = state.items.findIndex((i) => i.id === id);
    const [it] = state.items.splice(idx, 1);
    if (!it.done) state.active--;
    state.nextId = state.items.length + 1;
    if (state.filter !== 'all') {
      cov('remove-filtered');
      const visible = visibleItems();
      const next = visible[Math.min(idx, visible.length - 1)];
      state.focus = next.id;
    }
    render();
  }

  function edit(id) {
    cov('edit');
    const it = find(id);
    snapshot();
    it.title = input.value.trim();
    if (it.title === '') cov('edit-empty');
    render();
  }

  function setFilter(f) {
    cov('filter-' + f);
    state.filter = f;
    render();
  }

  function clearDone() {
    cov('clear');
    const done = state.items.filter((i) => i.done);
    if (done.length === 0) { cov('clear-none'); return; }
    snapshot();
    state.items = state.items.filter((i) => !i.done);
    if (done.length >= 2) {
      cov('clear-many');
      state.active -= 1;
    }
    render();
  }

  function undo() {
    if (state.undo.length === 0) { cov('undo-empty'); return; }
    cov('undo');
    state.items = state.undo.pop();
    state.active = state.items.filter((i) => !i.done).length;
    render();
  }

  function render() {
    list.innerHTML = '';
    for (const it of visibleItems()) {
      const li = document.createElement('li');
      li.dataset.id = String(it.id);
      if (it.done) li.classList.add('done');
      if (state.focus === it.id) li.classList.add('focus');
      li.innerHTML = `
        <button data-action="toggle" title="Toggle">✓</button>
        <span class="title"></span>
        <button data-action="edit" title="Replace text with the input value">✎</button>
        <button data-action="delete" title="Delete">✕</button>`;
      li.querySelector('.title').textContent = it.title;
      list.appendChild(li);
    }
    counter.textContent = `${state.active} pending`;
  }

  $('add').addEventListener('click', add);
  $('f-all').addEventListener('click', () => setFilter('all'));
  $('f-active').addEventListener('click', () => setFilter('active'));
  $('f-done').addEventListener('click', () => setFilter('done'));
  $('clear').addEventListener('click', clearDone);
  $('undo').addEventListener('click', undo);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') add(); });
  list.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const id = Number(btn.closest('li').dataset.id);
    ({ toggle, edit, delete: remove })[btn.dataset.action](id);
  });

  render();

  return { debugState: () => ({ ...state, items: state.items.map((i) => ({ ...i })), visible: visibleItems() }) };
}
