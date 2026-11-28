import { typeText, clickTestId, clickItem } from './dom.js';

const fill = (text) => `await page.getByTestId('new').fill('${text}');`;
const click = (id) => `await page.getByTestId('${id}').click();`;
const clickOnItem = (which, action) => `await page.locator('li').${which}().locator('[data-action=${action}]').click();`;

export const ACTIONS = [
  { name: 'NOOP', perform: () => {} },
  { name: 'type "buy bread"', pw: fill('buy bread'), perform: (host) => typeText(host, 'buy bread') },
  { name: 'type "   " (spaces)', pw: fill('   '), perform: (host) => typeText(host, '   ') },
  { name: 'clear input', pw: fill(''), perform: (host) => typeText(host, '') },
  { name: 'click Add', pw: click('add'), perform: (host) => clickTestId(host, 'add') },
  { name: 'toggle first visible', pw: clickOnItem('first', 'toggle'), perform: (host) => clickItem(host, 'first', 'toggle') },
  { name: 'toggle last visible', pw: clickOnItem('last', 'toggle'), perform: (host) => clickItem(host, 'last', 'toggle') },
  { name: 'delete first visible', pw: clickOnItem('first', 'delete'), perform: (host) => clickItem(host, 'first', 'delete') },
  { name: 'delete last visible', pw: clickOnItem('last', 'delete'), perform: (host) => clickItem(host, 'last', 'delete') },
  { name: 'filter All', pw: click('f-all'), perform: (host) => clickTestId(host, 'f-all') },
  { name: 'filter Active', pw: click('f-active'), perform: (host) => clickTestId(host, 'f-active') },
  { name: 'filter Done', pw: click('f-done'), perform: (host) => clickTestId(host, 'f-done') },
  { name: 'click Clear done', pw: click('clear'), perform: (host) => clickTestId(host, 'clear') },
  { name: 'click Undo', pw: click('undo'), perform: (host) => clickTestId(host, 'undo') },
  { name: 'edit first visible', pw: clickOnItem('first', 'edit'), perform: (host) => clickItem(host, 'first', 'edit') },
];
