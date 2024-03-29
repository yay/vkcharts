import { Group } from '../../scene/group';
import { type LegendDatum } from '../legend';
import { Observable } from '../../util/observable';
import { ChartAxis, ChartAxisDirection } from '../chartAxis';
import { Chart } from '../chart';
import { createId } from '../../util/id';
import { Label } from '../label';
import { type PointLabelDatum } from '../../util/labelPlacement';
import { isNumber } from '../../util/value';

/**
 * Processed series datum used in node selections,
 * contains information used to render pie sectors, bars, markers, etc.
 */
export interface SeriesNodeDatum {
  // For example, in `sectorNode.datum.seriesDatum`:
  // `sectorNode` - represents a pie slice
  // `datum` - contains metadata derived from the immutable series datum and used
  //           to set the properties of the node, such as start/end angles
  // `datum` - raw series datum, an element from the `series.data` array
  readonly series: Series;
  readonly itemId?: any;
  readonly datum: any;
  readonly point?: {
    // in local (series) coordinates
    readonly x: number;
    readonly y: number;
  };
}

export interface TooltipRendererParams {
  readonly datum: any;
  readonly title?: string;
  readonly color?: string;
}

export interface CartesianTooltipRendererParams extends TooltipRendererParams {
  readonly xKey: string;
  readonly xValue: any;
  readonly xName?: string;

  readonly yKey: string;
  readonly yValue: any;
  readonly yName?: string;
}

export interface PolarTooltipRendererParams extends TooltipRendererParams {
  readonly angleKey: string;
  readonly angleValue: any;
  readonly angleName?: string;

  readonly radiusKey?: string;
  readonly radiusValue?: any;
  readonly radiusName?: string;
}

export class SeriesItemHighlightStyle {
  fill?: string = 'yellow';
  stroke?: string;
  strokeWidth?: number;
}

export class SeriesHighlightStyle {
  strokeWidth?: number;
  dimOpacity?: number;
}

export class HighlightStyle {
  readonly item = new SeriesItemHighlightStyle();
  readonly series = new SeriesHighlightStyle();
}

export class SeriesTooltip extends Observable {
  private _enabled: boolean = true;
  set enabled(value: boolean) {
    const oldValue = this._enabled;
    if (value !== oldValue) {
      this._enabled = value;
      this.notifyPropertyListeners('enabled', oldValue, value);
      this.notifyEventListeners(['change']);
    }
  }
  get enabled(): boolean {
    return this._enabled;
  }
}

export abstract class Series extends Observable {
  readonly id = createId(this);

  get type(): string {
    return (this.constructor as any).type || '';
  }

  // The group node that contains all the nodes used to render this series.
  readonly group: Group = new Group();

  // The group node that contains all the nodes that can be "picked" (react to hover, tap, click).
  readonly pickGroup: Group = this.group.appendChild(new Group());

  // Package-level visibility, not meant to be set by the user.
  chart?: Chart;
  xAxis?: ChartAxis;
  yAxis?: ChartAxis;

  directions: ChartAxisDirection[] = [ChartAxisDirection.X, ChartAxisDirection.Y];
  directionKeys: { [key in ChartAxisDirection]?: string[] } = {};

  protected static highlightedZIndex = 1000000000000;

  readonly label = new Label();

  abstract tooltip: SeriesTooltip;

  protected _data: any[] | undefined = undefined;
  set data(value: any[] | undefined) {
    const oldValue = this._data;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._data = value;
      this.notifyPropertyListeners('data', oldValue, value);
      this.notifyEventListeners(['dataChange']);
    }
  }
  get data(): any[] | undefined {
    return this._data;
  }

  private _visible: boolean = true;
  set visible(value: boolean) {
    const oldValue = this._visible;
    if (value !== oldValue) {
      this._visible = value;
      this.notifyPropertyListeners('visible', oldValue, value);
      this.notifyEventListeners(['dataChange']);
    }
  }
  get visible(): boolean {
    return this._visible;
  }

  private _showInLegend: boolean = true;
  set showInLegend(value: boolean) {
    const oldValue = this._showInLegend;
    if (value !== oldValue) {
      this._showInLegend = value;
      this.notifyPropertyListeners('showInLegend', oldValue, value);
      this.notifyEventListeners(['layoutChange']);
    }
  }
  get showInLegend(): boolean {
    return this._showInLegend;
  }

  cursor = 'default';

  setColors(_fills: string[], _strokes: string[]) {}

  // Returns the actual keys used (to fetch the values from `data` items) for the given direction.
  getKeys(direction: ChartAxisDirection): string[] {
    const { directionKeys } = this;
    const keys = directionKeys && directionKeys[direction];
    const values: string[] = [];

    if (keys) {
      keys.forEach((key) => {
        const value = (this as any)[key];

        if (value) {
          if (Array.isArray(value)) {
            values.push(...value);
          } else {
            values.push(value);
          }
        }
      });
    }

    return values;
  }

  abstract getDomain(direction: ChartAxisDirection): any[];

  // Fetch required values from the `chart.data` or `series.data` objects and process them.
  abstract processData(): boolean;

  // Using processed data, create data that backs visible nodes.
  createNodeData(): SeriesNodeDatum[] {
    return [];
  }

  // Returns persisted node data associated with the rendered portion of the series' data.
  getNodeData(): readonly SeriesNodeDatum[] {
    return [];
  }

  getLabelData(): readonly PointLabelDatum[] {
    return [];
  }

  private _nodeDataPending = true;
  set nodeDataPending(value: boolean) {
    if (this._nodeDataPending !== value) {
      this._nodeDataPending = value;
      this.updatePending = true;
      if (value && this.chart) {
        this.chart.updatePending = value;
      }
    }
  }
  get nodeDataPending(): boolean {
    return this._nodeDataPending;
  }

  scheduleNodeDate() {
    this.nodeDataPending = true;
  }

  private _updatePending = false;
  set updatePending(value: boolean) {
    if (this._updatePending !== value) {
      this._updatePending = value;
      if (value && this.chart) {
        this.chart.updatePending = value;
      }
    }
  }
  get updatePending(): boolean {
    return this._updatePending;
  }

  scheduleUpdate() {
    this.updatePending = true;
  }

  // Produce data joins and update selection's nodes using node data.
  abstract update(): void;

  protected getOpacity(datum?: { itemId?: any }): number {
    const {
      chart,
      highlightStyle: {
        series: { dimOpacity = 1 },
      },
    } = this;
    return !chart ||
      !chart.highlightedDatum ||
      (chart.highlightedDatum.series === this && (!datum || chart.highlightedDatum.itemId === datum.itemId))
      ? 1
      : dimOpacity;
  }

  protected getStrokeWidth(defaultStrokeWidth: number, datum?: { itemId?: any }): number {
    const {
      chart,
      highlightStyle: {
        series: { strokeWidth },
      },
    } = this;
    return chart &&
      chart.highlightedDatum &&
      chart.highlightedDatum.series === this &&
      (!datum || chart.highlightedDatum.itemId === datum.itemId) &&
      strokeWidth !== undefined
      ? strokeWidth
      : defaultStrokeWidth;
  }

  abstract getTooltipHtml(seriesDatum: any): string;

  fireNodeClickEvent(_event: MouseEvent, _datum: SeriesNodeDatum): void {}

  /**
   * @private
   * Populates the given {@param data} array with the items of this series
   * that should be shown in the legend. It's up to the series to determine
   * what is considered an item. An item could be the series itself or some
   * part of the series.
   * @param data
   */
  abstract listSeriesItems(data: LegendDatum[]): void;

  toggleSeriesItem(_itemId: any, enabled: boolean): void {
    this.visible = enabled;
  }

  readonly highlightStyle = new HighlightStyle();

  // Each series is expected to have its own logic to efficiently update its nodes
  // on hightlight changes.
  onHighlightChange() {}

  readonly scheduleLayout = () => {
    this.fireEvent({ type: 'layoutChange' });
  };

  readonly scheduleData = () => {
    this.fireEvent({ type: 'dataChange' });
  };

  protected fixNumericExtent(extent?: [number | Date, number | Date], _type?: string): [number, number] {
    if (!extent) {
      // if (type) {
      //     console.warn(`The ${type}-domain could not be found (no valid values), using the default of [0, 1].`);
      // }
      return [0, 1];
    }

    let [min, max] = extent;
    min = +min;
    max = +max;

    if (min === max) {
      const padding = Math.abs(min * 0.01);
      min -= padding;
      max += padding;
      // if (type) {
      //     console.warn(`The ${type}-domain has zero length and has been automatically expanded`
      //         + ` by 1 in each direction (from the single valid ${type}-value: ${min}).`);
      // }
    }

    if (!(isNumber(min) && isNumber(max))) {
      min = 0;
      max = 1;
      // if (type) {
      //     console.warn(`The ${type}-domain has infinite length, using the default of [0, 1].`);
      // }
    }

    return [min, max];
  }
}
