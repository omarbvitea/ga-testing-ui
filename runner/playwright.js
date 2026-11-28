import { ACTIONS } from './actions.js';

export function toPlaywright(seq, title) {
  const steps = seq.map((g) => '  ' + ACTIONS[g].pw).join('\n');
  return `test('${title}', async ({ page }) => {\n  await page.goto('/');\n${steps}\n});`;
}
