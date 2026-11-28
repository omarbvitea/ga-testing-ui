const sum = (values) => values.reduce((total, v) => total + v, 0);

function scalingCoefficients(avg, max, min, cmult) {
  if (min > (cmult * avg - max) / (cmult - 1)) {
    const delta = max - avg;
    return { a: ((cmult - 1) * avg) / delta, b: (avg * (max - cmult * avg)) / delta };
  }
  const delta = avg - min;
  return { a: avg / delta, b: (-min * avg) / delta };
}

export function linearScale(fitness, cmult = 2) {
  const avg = sum(fitness) / fitness.length;
  const max = Math.max(...fitness);
  const min = Math.min(...fitness);
  if (max - avg < 1e-12 || avg <= 0) return fitness.map(() => 1);
  const { a, b } = scalingCoefficients(avg, max, min, cmult);
  return fitness.map((f) => Math.max(0, a * f + b));
}
