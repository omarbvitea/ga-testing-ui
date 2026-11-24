export const BUGS = [
  { id: 'B1', name: 'Adding a task with only spaces', type: 'crash',
    matches: (f) => f.type === 'crash' && /toUpperCase/.test(f.message) },
  { id: 'B2', name: 'Deleting the last visible item with an active filter', type: 'crash',
    matches: (f) => f.type === 'crash' && /reading 'id'/.test(f.message) },
  { id: 'B3', name: 'Wrong counter after clearing 2+ done tasks', type: 'invariant',
    matches: (f) => f.signature === 'INV-counter' },
  { id: 'B4', name: 'Duplicate ids after deleting and adding again', type: 'invariant',
    matches: (f) => f.signature === 'INV-unique-ids' },
  { id: 'B5', name: 'Editing a task with an empty input leaves an empty title', type: 'invariant',
    matches: (f) => f.signature === 'INV-empty-title' },
];

export function classify(failure) {
  if (!failure) return null;
  const b = BUGS.find((x) => x.matches(failure));
  return b ? b.id : 'UNKNOWN';
}
