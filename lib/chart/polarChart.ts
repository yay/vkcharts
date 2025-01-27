import { BBox } from '../scene/bbox';
import type { Node } from '../scene/node';
import { reactive } from '../util/observable';
import { Padding } from '../util/padding';
import { Chart } from './chart';
import { PolarSeries } from './series/polar/polarSeries';

export class PolarChart extends Chart {
  static className = 'PolarChart';
  static type = 'polar';

  @reactive('layoutChange') padding = new Padding(40);

  constructor(document = window.document) {
    super(document);

    this.scene.root!.append(this.legend.group);
  }

  get seriesRoot(): Node {
    return this.scene.root!;
  }

  performLayout(): void {
    const shrinkRect = new BBox(0, 0, this.width, this.height);

    this.positionCaptions();
    this.positionLegend();

    const captionAutoPadding = this.captionAutoPadding;
    shrinkRect.y += captionAutoPadding;
    shrinkRect.height -= captionAutoPadding;

    if (this.legend.enabled && this.legend.data.length) {
      const legendAutoPadding = this.legendAutoPadding;
      shrinkRect.x += legendAutoPadding.left;
      shrinkRect.y += legendAutoPadding.top;
      shrinkRect.width -= legendAutoPadding.left + legendAutoPadding.right;
      shrinkRect.height -= legendAutoPadding.top + legendAutoPadding.bottom;

      const legendPadding = this.legend.spacing;
      switch (this.legend.position) {
        case 'right':
          shrinkRect.width -= legendPadding;
          break;
        case 'bottom':
          shrinkRect.height -= legendPadding;
          break;
        case 'left':
          shrinkRect.x += legendPadding;
          shrinkRect.width -= legendPadding;
          break;
        case 'top':
          shrinkRect.y += legendPadding;
          shrinkRect.height -= legendPadding;
          break;
      }
    }

    const padding = this.padding;
    shrinkRect.x += padding.left;
    shrinkRect.y += padding.top;
    shrinkRect.width -= padding.left + padding.right;
    shrinkRect.height -= padding.top + padding.bottom;
    this.seriesRect = shrinkRect;

    const centerX = shrinkRect.x + shrinkRect.width / 2;
    const centerY = shrinkRect.y + shrinkRect.height / 2;
    const radius = Math.min(shrinkRect.width, shrinkRect.height) / 2;

    for (const series of this.series) {
      if (series instanceof PolarSeries) {
        series.centerX = centerX;
        series.centerY = centerY;
        series.radius = radius;
        series.update();
      }
    }
  }
}
