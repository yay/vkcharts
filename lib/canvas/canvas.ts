// This is the property we set on an HTMLCanvasElement to let us know we've applied
// the resolution independent overrides to it, and what its current DPR is.
const DevicePixelRatioKey = Symbol('DevicePixelRatioOverride');

/**
 * Creates an object with HDPI overrides for the CanvasRenderingContext2D
 * for the given device pixel ratio.
 * @param dpr
 */
function makeHdpiOverrides(dpr: number): any {
  let depth = 0;
  return {
    save() {
      this.$save();
      depth++;
    },
    restore() {
      if (depth > 0) {
        this.$restore();
        depth--;
      }
    },
    resetTransform() {
      this.$resetTransform();
      this.scale(dpr, dpr);
      this.save();
      depth = 0; // Make sure the `dpr` scale above is impossible to `ctx.restore()`
    },
  };
}

/**
 * Creates an HTMLCanvasElement element with HDPI overrides applied.
 * The `width` and `height` parameters are optional and default to
 * the values defined in the W3C Recommendation:
 * https://www.w3.org/TR/html52/semantics-scripting.html#the-canvas-element
 * @param width
 * @param height
 */
export function createHdpiCanvas(width = 300, height = 150): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  if (!applyHdpiOverrides(canvas)) {
    console.warn('HDPI overrides were already applied or used screen is not an HDPI one.');
  }
  return canvas;
}

export function applyHdpiOverrides(canvas: HTMLCanvasElement): number {
  const canvasDpr = (canvas as any)[DevicePixelRatioKey];
  const dpr = window.devicePixelRatio;

  // if overrides haven't been applied and actually needed
  if (!canvasDpr && dpr !== 1) {
    const overrides = makeHdpiOverrides(dpr);
    const ctx = canvas.getContext('2d')!;
    for (const name in overrides) {
      // Save native methods under prefixed names.
      (ctx as any)['$' + name] = (ctx as any)[name];
      // Pretend our overrides are native methods.
      (ctx as any)[name] = overrides[name];
    }
    (canvas as any)[DevicePixelRatioKey] = dpr;

    const logicalWidth = canvas.width;
    const logicalHeight = canvas.height;
    canvas.width = Math.round(logicalWidth * dpr);
    canvas.height = Math.round(logicalHeight * dpr);
    canvas.style.width = Math.round(logicalWidth) + 'px';
    canvas.style.height = Math.round(logicalHeight) + 'px';

    ctx.resetTransform(); // should be called every time the size changes

    return dpr;
  }
  return 0;
}

/**
 * Resizes the given Canvas element, taking HDPI overrides (if any) into account.
 * @param canvas
 * @param width
 * @param height
 */
export function resizeCanvas(canvas: HTMLCanvasElement, width: number, height: number) {
  const canvasDpr = (canvas as any)[DevicePixelRatioKey] || 1;

  canvas.width = Math.round(width * canvasDpr);
  canvas.height = Math.round(height * canvasDpr);
  canvas.style.width = Math.round(width) + 'px';
  canvas.style.height = Math.round(height) + 'px';

  canvas.getContext('2d')?.resetTransform();
}
