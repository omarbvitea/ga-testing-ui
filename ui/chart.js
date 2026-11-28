const MARGIN = 36;
const GRID_LINES = 4;
const BUG_SCALE = 10;

function createScales(history, width, height) {
  const maxY = Math.max(...history.map((h) => Math.max(h.best, h.bugs * BUG_SCALE))) * 1.1 || 1;
  const x = (gen) => MARGIN + (gen / Math.max(1, history.length - 1)) * (width - 2 * MARGIN);
  const y = (value) => height - MARGIN + 10 - (value / maxY) * (height - 2 * MARGIN);
  return { x, y, maxY };
}

function drawGrid(ctx, { y, maxY }, width, height) {
  ctx.strokeStyle = '#dfe3ea';
  ctx.fillStyle = '#5d6675';
  ctx.font = '12px system-ui';
  for (let i = 0; i <= GRID_LINES; i++) {
    const value = (maxY * i) / GRID_LINES;
    ctx.beginPath();
    ctx.moveTo(MARGIN, y(value));
    ctx.lineTo(width - MARGIN, y(value));
    ctx.stroke();
    ctx.fillText(value.toFixed(0), 4, y(value) + 4);
  }
  ctx.fillText('generation', width / 2 - 30, height - 4);
}

function drawSeries(ctx, history, scales, key, colorVar, transform = (v) => v) {
  const css = getComputedStyle(document.documentElement);
  ctx.strokeStyle = css.getPropertyValue(colorVar);
  ctx.lineWidth = 2;
  ctx.beginPath();
  history.forEach((h, i) => {
    const px = scales.x(h.gen);
    const py = scales.y(transform(h[key]));
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.stroke();
  ctx.lineWidth = 1;
}

export function drawChart(canvas, history) {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);
  const scales = createScales(history, width, height);
  drawGrid(ctx, scales, width, height);
  drawSeries(ctx, history, scales, 'avg', '--avg');
  drawSeries(ctx, history, scales, 'best', '--best');
  drawSeries(ctx, history, scales, 'bugs', '--bugs', (v) => v * BUG_SCALE);
}
