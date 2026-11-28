import { ITEM_TEMPLATE } from './template.js';
import { visibleItems } from './state.js';

function createItemElement(item, focusId) {
  const li = document.createElement('li');
  li.dataset.id = String(item.id);
  if (item.done) li.classList.add('done');
  if (focusId === item.id) li.classList.add('focus');
  li.innerHTML = ITEM_TEMPLATE;
  li.querySelector('.title').textContent = item.title;
  return li;
}

export function render(state, { list, counter }) {
  list.innerHTML = '';
  for (const item of visibleItems(state)) {
    list.appendChild(createItemElement(item, state.focus));
  }
  counter.textContent = `${state.active} pending`;
}
