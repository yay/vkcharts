import './index.css';
import { initFullScreenButton } from '../../utils/fullScreen';

function interpolate(t: number, a: number, b: number): number {
  // https://www.mathsisfun.com/algebra/linear-equations.html
  const v = a * (1 - t) + b * t; // => a + t * (b - a) => t * (b - a) + a => y = ax + b
  return v;
}

function getCanvasContext(id: string, width: number, height: number): CanvasRenderingContext2D {
  const canvas = document.getElementById(id) as HTMLCanvasElement;

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

document.addEventListener('DOMContentLoaded', async () => {
  initFullScreenButton();

  const size = 700;
  const ctx = getCanvasContext('canvas', size, size);
  ctx.lineWidth = 5;
  ctx.font = '16px Verdana';

  const slider = document.getElementById('slider') as HTMLInputElement;
  slider.type = 'range';
  slider.min = '0';
  slider.max = '1';
  slider.step = '0.01';
  slider.value = '0';
  slider.style.width = `${size}px`;
  slider.addEventListener('input', (e) => {
    const t = Number((e.target as HTMLInputElement).value);

    ctx.clearRect(0, 0, size, size);
    ctx.fillText(`t: ${t.toFixed(2)}`, 0, 20);
    {
      const ax = 0;
      const bx = size;
      const y = size / 2;
      const x = interpolate(t, ax, bx);
      ctx.fillText(`x: ${x.toFixed(0)}`, 0, 40);
      ctx.strokeStyle = 'green';
      ctx.beginPath();
      ctx.moveTo(ax, y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    {
      const ax = size * 0.3;
      const bx = size * 0.8;
      const ay = size * 0.2;
      const by = size * 0.9;
      const x = interpolate(t, ax, bx);
      const y = interpolate(t, ay, by);
      ctx.fillText(`x: ${x.toFixed(0)}, y: ${y.toFixed(0)}`, 0, 60);
      ctx.strokeStyle = 'red';
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  });
});
