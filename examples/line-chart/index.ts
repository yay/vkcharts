document.addEventListener('DOMContentLoaded', () => {
  renderChart();
});

const data = [
  {
    month: 'Jan',
    desktops: 80,
    laptops: 30,
    tablets: 10,
  },
  {
    month: 'Feb',
    desktops: 45,
    laptops: 25,
    tablets: 15,
  },
  {
    month: 'Mar',
    desktops: 25,
    laptops: 35,
    tablets: 20,
  },
  {
    month: 'Apr',
    desktops: 20,
    laptops: 50,
    tablets: 35,
  },
  {
    month: 'May',
    desktops: 10,
    laptops: 45,
    tablets: 60,
  },
  {
    month: 'Jun',
    desktops: 5,
    laptops: 55,
    tablets: 95,
  },
];

const colorTheme = ['#92CC76', '#FAC858', '#EE6666', '#5570C6', '#73C0DE'];

function interpolate(t: number, a: number, b: number): number {
  const v = a * (1 - t) + b * t; // => a + t * (b - a) => t * (b - a) + a => y = ax + b
  return v;
}

function deinterpolate(v: number, a: number, b: number): number {
  // const value = a - a * t + b * t;
  // const value = a + t * (b - a);
  const t = (v - a) / (b - a);
  return t;
}

interface Tick {
  readonly domain: number;
  readonly range: number;
}

function makeScale(domain: [number, number], range: [number, number], tickCount: number) {
  const delta = Math.pow(10, Math.ceil(Math.log10(Math.abs(domain[1] - domain[0]))));
  const step = delta / tickCount;
  const [domain0, domain1] = [Math.ceil(domain[0] / step) * step, Math.ceil(domain[1] / step) * step];
  const [range0, range1] = range;
  return {
    domain0,
    domain1,
    range0,
    range1,

    convert(d: number): number {
      const t = deinterpolate(d, domain0, domain1);
      const r = interpolate(t, range0, range1);
      return r;
    },

    getTicks(): readonly Tick[] {
      const ticks: Tick[] = [];
      for (let d = domain0; d <= domain1; d += step) {
        const t = deinterpolate(d, domain0, domain1);
        const r = interpolate(t, range0, range1);
        ticks.push({
          domain: d,
          range: r,
        });
      }
      return ticks;
    },
  };
}

function createCanvasContext(width: number, height: number): CanvasRenderingContext2D {
  const canvas = document.createElement('canvas');

  const pixelRatio = window.devicePixelRatio;
  width = Math.max(width, 1);
  height = Math.max(height, 1);
  const actualWidth = Math.round(width * pixelRatio);
  const actualHeight = Math.round(height * pixelRatio);
  canvas.width = actualWidth;
  canvas.height = actualHeight;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext('2d')!;
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  return ctx;
}

function renderChart() {
  const yKeys = ['desktops', 'laptops', 'tablets'];
  const colors = colorTheme;

  const legendPadding = 40;
  const padding = {
    top: 20,
    right: 100 + legendPadding,
    bottom: 40,
    left: 60,
  };

  const n = data.length;
  // Map key names to their values.
  const xData = data.map((datum) => datum.month);
  // `yData` - arrays of size `n` of the domain values for each of the `yKeys`.
  const yData = yKeys.map((key) => data.map((datum) => (datum as any)[key] as number));

  const canvasWidth = document.body.getBoundingClientRect().width;
  const canvasHeight = 480;
  const seriesWidth = canvasWidth - padding.left - padding.right;
  const seriesHeight = canvasHeight - padding.top - padding.bottom;

  const ctx = createCanvasContext(canvasWidth, canvasHeight);
  ctx.font = '14px Avenir';
  document.body.appendChild(ctx.canvas);

  const markerRadius = 4;
  const tickLength = 5;
  const labelTickGap = 5;

  // y-axis
  const yScale = makeScale([0, Math.max(...yData.map((values) => Math.max(...values)))], [seriesHeight, 0], 10);
  const yTicks = yScale.getTicks();

  ctx.save();
  ctx.translate(padding.left, padding.top);
  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'right';
  yTicks.forEach((tick) => {
    ctx.moveTo(0, tick.range);
    ctx.lineTo(-tickLength, tick.range);
    ctx.fillText(String(tick.domain), -(tickLength + labelTickGap), tick.range);
  });
  ctx.moveTo(0, yScale.convert(yScale.domain0));
  ctx.lineTo(0, yScale.convert(yScale.domain1));
  ctx.stroke();
  ctx.restore();

  // x-axis
  const xScale = makeScale([0, xData.length - 1], [0, seriesWidth], 10);
  const xTicks = xScale.getTicks();

  ctx.save();
  ctx.translate(padding.left, padding.top + seriesHeight);
  ctx.rotate(-Math.PI / 2);
  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'right';
  xTicks.forEach((tick) => {
    ctx.moveTo(0, tick.range);
    ctx.lineTo(-tickLength, tick.range);
    ctx.fillText(String(xData[tick.domain]), -(tickLength + labelTickGap), tick.range);
  });
  ctx.moveTo(0, xScale.convert(xScale.domain0));
  ctx.lineTo(0, xScale.convert(xScale.domain1));
  ctx.stroke();
  ctx.restore();

  // line
  ctx.save();
  ctx.translate(padding.left, padding.top);
  yData.forEach((keyData, j) => {
    ctx.save();
    ctx.lineWidth = 2;
    ctx.strokeStyle = colors[j % colors.length];
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const value = keyData[i];
      const x = xScale.convert(i);
      const y = yScale.convert(value);

      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.setLineDash([8, 3]);
    ctx.stroke();
    ctx.restore();

    // marker
    ctx.save();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'black';
    ctx.fillStyle = colors[j % colors.length];
    for (let i = 0; i < n; i++) {
      const value = keyData[i];
      const x = xScale.convert(i);
      const y = yScale.convert(value);
      ctx.beginPath();
      ctx.arc(x, y, markerRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  });
  ctx.restore();

  // legend
  const legendLeft = canvasWidth - padding.right + legendPadding;
  const legendItemHeight = 30;
  const legendMarkerPadding = 20;
  const legendTop = padding.top + (seriesHeight - legendItemHeight * yKeys.length) / 2;
  ctx.strokeStyle = 'black';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 1;
  yKeys.forEach((key, i) => {
    const itemY = i * legendItemHeight + legendTop;
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    ctx.arc(legendLeft, itemY, markerRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'black';
    ctx.fillText(key, legendLeft + legendMarkerPadding, itemY);
  });
}

function renderAxis(ctx: CanvasRenderingContext2D, tickLength: number = 10) {
  const { convert, getTicks } = makeScale([0, 100], [0, 200], 10);
  const ticks = getTicks();

  ctx.beginPath();
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 1;
  ticks.forEach((tick) => {
    ctx.moveTo(tick.range, 50);
    ctx.lineTo(tick.range, 50 + tickLength);
  });
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(convert(50), 60, 3, 0, Math.PI * 2);
  ctx.stroke();
}
