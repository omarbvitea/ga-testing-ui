const FIELDS = ['seed', 'popSize', 'generations', 'length', 'pc', 'pm'];

export function readParams(form) {
  const data = new FormData(form);
  return Object.fromEntries(FIELDS.map((key) => [key, Number(data.get(key))]));
}
