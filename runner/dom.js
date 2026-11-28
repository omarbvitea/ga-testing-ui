export const byTestId = (host, id) => host.querySelector(`[data-testid="${id}"]`);

export function typeText(host, text) {
  const input = byTestId(host, 'new');
  input.value = text;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

export function clickTestId(host, id) {
  byTestId(host, id).click();
}

export function clickItem(host, which, action) {
  const items = host.querySelectorAll('li');
  if (items.length === 0) return;
  const li = which === 'first' ? items[0] : items[items.length - 1];
  li.querySelector(`[data-action="${action}"]`).click();
}
