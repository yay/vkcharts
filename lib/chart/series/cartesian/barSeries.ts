import { Group } from '../../../scene/group';
import { Selection } from '../../../scene/selection';
import { Rect } from '../../../scene/shape/rect';
import { Text, type FontStyle, type FontWeight } from '../../../scene/shape/text';
import { BandScale } from '../../../scale/bandScale';
import { DropShadow } from '../../../scene/dropShadow';
import { type SeriesNodeDatum, type CartesianTooltipRendererParams, SeriesTooltip, Series } from '../series';
import { Label } from '../../label';
import { PointerEvents } from '../../../scene/node';
import { type LegendDatum } from '../../legend';
import { CartesianSeries } from './cartesianSeries';
import { ChartAxis, ChartAxisDirection, flipChartAxisDirection } from '../../chartAxis';
import { type TooltipRendererResult, toTooltipHtml } from '../../chart';
import { findMinMax } from '../../../util/array';
import { equal } from '../../../util/equal';
import { type TypedEvent } from '../../../util/observable';
import { type Scale } from '../../../scale/scale';
import { sanitizeHtml } from '../../../util/sanitize';
import { isNumber } from '../../../util/value';
import { clamper, ContinuousScale } from '../../../scale/continuousScale';

export interface BarSeriesNodeClickEvent extends TypedEvent {
  readonly type: 'nodeClick';
  readonly event: MouseEvent;
  readonly series: BarSeries;
  readonly datum: any;
  readonly xKey: string;
  readonly yKey: string;
}

export interface BarTooltipRendererParams extends CartesianTooltipRendererParams {
  readonly processedYValue: any;
}

interface BarNodeDatum extends SeriesNodeDatum {
  readonly index: number;
  readonly yKey: string;
  readonly yValue: number;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly fill?: string;
  readonly stroke?: string;
  readonly strokeWidth: number;
  readonly label?: {
    readonly x: number;
    readonly y: number;
    readonly text: string;
    readonly fontStyle?: FontStyle;
    readonly fontWeight?: FontWeight;
    readonly fontSize: number;
    readonly fontFamily: string;
    readonly textAlign: CanvasTextAlign;
    readonly textBaseline: CanvasTextBaseline;
    readonly fill: string;
  };
}

enum BarSeriesNodeTag {
  Bar,
  Label,
}

export enum BarLabelPlacement {
  Inside = 'inside',
  Outside = 'outside',
}

class BarSeriesLabel extends Label {
  private _formatter: ((params: { value: number }) => string) | undefined;
  set formatter(value: ((params: { value: number }) => string) | undefined) {
    const oldValue = this._formatter;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._formatter = value;
      this.notifyPropertyListeners('formatter', oldValue, value);
      this.notifyEventListeners(['change']);
    }
  }
  get formatter(): ((params: { value: number }) => string) | undefined {
    return this._formatter;
  }

  private _placement: BarLabelPlacement = BarLabelPlacement.Inside;
  set placement(value: BarLabelPlacement) {
    const oldValue = this._placement;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._placement = value;
      this.notifyPropertyListeners('placement', oldValue, value);
      this.notifyEventListeners(['change']);
    }
  }
  get placement(): BarLabelPlacement {
    return this._placement;
  }
}

export interface BarSeriesFormatterParams {
  readonly datum: any;
  readonly fill?: string;
  readonly stroke?: string;
  readonly strokeWidth: number;
  readonly highlighted: boolean;
  readonly xKey: string;
  readonly yKey: string;
}

export interface BarSeriesFormat {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

export class BarSeriesTooltip extends SeriesTooltip {
  private _renderer: ((params: BarTooltipRendererParams) => string | TooltipRendererResult) | undefined;
  set renderer(value: ((params: BarTooltipRendererParams) => string | TooltipRendererResult) | undefined) {
    const oldValue = this._renderer;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._renderer = value;
      this.notifyPropertyListeners('renderer', oldValue, value);
      this.notifyEventListeners(['change']);
    }
  }
  get renderer(): ((params: BarTooltipRendererParams) => string | TooltipRendererResult) | undefined {
    return this._renderer;
  }
}

function flat(arr: any[], target: any[] = []): any[] {
  arr.forEach((v) => {
    if (Array.isArray(v)) {
      flat(v, target);
    } else {
      target.push(v);
    }
  });
  return target;
}

export class BarSeries extends CartesianSeries {
  static className = 'BarSeries';
  static type = 'bar';

  // Need to put bar and label nodes into separate groups, because even though label nodes are
  // created after the bar nodes, this only guarantees that labels will always be on top of bars
  // on the first run. If on the next run more bars are added, they might clip the labels
  // rendered during the previous run.
  private rectGroup = this.pickGroup.appendChild(new Group());
  private labelGroup = this.group.appendChild(new Group());

  private rectSelection: Selection<Rect, Group, BarNodeDatum, any> = Selection.select(this.rectGroup).selectAll<Rect>();
  private labelSelection: Selection<Text, Group, BarNodeDatum, any> = Selection.select(
    this.labelGroup
  ).selectAll<Text>();

  private nodeData: BarNodeDatum[] = [];
  private xData: string[] = [];
  private yData: number[][][] = [];
  private yDomain: number[] = [];

  readonly label = new BarSeriesLabel();

  /**
   * The assumption is that the values will be reset (to `true`)
   * in the {@link yKeys} setter.
   */
  private readonly seriesItemEnabled = new Map<string, boolean>();

  tooltip: BarSeriesTooltip = new BarSeriesTooltip();

  private _flipXY: boolean = false;
  set flipXY(value: boolean) {
    const oldValue = this._flipXY;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._flipXY = value;
      this.notifyPropertyListeners('flipXY', oldValue, value);
      this.notifyEventListeners(['dataChange']);
    }
  }
  get flipXY(): boolean {
    return this._flipXY;
  }

  private _fills: string[] = ['#c16068', '#a2bf8a', '#ebcc87', '#80a0c3', '#b58dae', '#85c0d1'];
  set fills(value: string[]) {
    const oldValue = this._fills;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._fills = value;
      this.notifyPropertyListeners('fills', oldValue, value);
      this.notifyEventListeners(['dataChange']);
    }
  }
  get fills(): string[] {
    return this._fills;
  }

  private _strokes: string[] = ['#874349', '#718661', '#a48f5f', '#5a7088', '#7f637a', '#5d8692'];
  set strokes(value: string[]) {
    const oldValue = this._strokes;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._strokes = value;
      this.notifyPropertyListeners('strokes', oldValue, value);
      this.notifyEventListeners(['dataChange']);
    }
  }
  get strokes(): string[] {
    return this._strokes;
  }

  private _fillOpacity: number = 1;
  set fillOpacity(value: number) {
    const oldValue = this._fillOpacity;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._fillOpacity = value;
      this.notifyPropertyListeners('fillOpacity', oldValue, value);
      this.notifyEventListeners(['layoutChange']);
    }
  }
  get fillOpacity(): number {
    return this._fillOpacity;
  }

  private _strokeOpacity: number = 1;
  set strokeOpacity(value: number) {
    const oldValue = this._strokeOpacity;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._strokeOpacity = value;
      this.notifyPropertyListeners('strokeOpacity', oldValue, value);
      this.notifyEventListeners(['layoutChange']);
    }
  }
  get strokeOpacity(): number {
    return this._strokeOpacity;
  }

  private _lineDash: number[] | undefined = undefined;
  set lineDash(value: number[] | undefined) {
    const oldValue = this._lineDash;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._lineDash = value;
      this.notifyPropertyListeners('lineDash', oldValue, value);
      this.notifyEventListeners(['update']);
    }
  }
  get lineDash(): number[] | undefined {
    return this._lineDash;
  }

  private _lineDashOffset: number = 0;
  set lineDashOffset(value: number) {
    const oldValue = this._lineDashOffset;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._lineDashOffset = value;
      this.notifyPropertyListeners('lineDashOffset', oldValue, value);
      this.notifyEventListeners(['update']);
    }
  }
  get lineDashOffset(): number {
    return this._lineDashOffset;
  }

  private _formatter: ((params: BarSeriesFormatterParams) => BarSeriesFormat) | undefined;
  set formatter(value: ((params: BarSeriesFormatterParams) => BarSeriesFormat) | undefined) {
    const oldValue = this._formatter;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._formatter = value;
      this.notifyPropertyListeners('formatter', oldValue, value);
      this.notifyEventListeners(['update']);
    }
  }
  get formatter(): ((params: BarSeriesFormatterParams) => BarSeriesFormat) | undefined {
    return this._formatter;
  }

  constructor() {
    super();

    this.addEventListener('update', this.scheduleUpdate);

    this.label.enabled = false;
    this.label.addEventListener('change', this.scheduleUpdate, this);
  }

  /**
   * Used to get the position of bars within each group.
   */
  private groupScale = new BandScale<string>();

  directionKeys = {
    [ChartAxisDirection.X]: ['xKey'],
    [ChartAxisDirection.Y]: ['yKeys'],
  };

  getKeys(direction: ChartAxisDirection): string[] {
    const { directionKeys } = this;
    const keys = directionKeys && directionKeys[this.flipXY ? flipChartAxisDirection(direction) : direction];
    let values: string[] = [];

    if (keys) {
      keys.forEach((key) => {
        const value = (this as any)[key];

        if (value) {
          if (Array.isArray(value)) {
            values = values.concat(flat(value));
          } else {
            values.push(value);
          }
        }
      });
    }

    return values;
  }

  protected _xKey: string = '';
  set xKey(value: string) {
    if (this._xKey !== value) {
      this._xKey = value;
      this.xData = [];
      this.scheduleData();
    }
  }
  get xKey(): string {
    return this._xKey;
  }

  protected _xName: string = '';
  set xName(value: string) {
    if (this._xName !== value) {
      this._xName = value;
      this.scheduleUpdate();
    }
  }
  get xName(): string {
    return this._xName;
  }

  private cumYKeyCount: number[] = [];
  private flatYKeys: string[] | undefined = undefined; // only set when a user used a flat array for yKeys

  private _hideInLegend: string[] = [];
  set hideInLegend(value: string[]) {
    const oldValue = this._hideInLegend;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._hideInLegend = value;
      this.notifyPropertyListeners('hideInLegend', oldValue, value);
      this.notifyEventListeners(['layoutChange']);
    }
  }
  get hideInLegend(): string[] {
    return this._hideInLegend;
  }

  /**
   * yKeys: [['coffee']] - regular bars, each category has a single bar that shows a value for coffee
   * yKeys: [['coffee'], ['tea'], ['milk']] - each category has three bars that show values for coffee, tea and milk
   * yKeys: [['coffee', 'tea', 'milk']] - each category has a single bar with three stacks that show values for coffee, tea and milk
   * yKeys: [['coffee', 'tea', 'milk'], ['paper', 'ink']] - each category has 2 stacked bars,
   *     first showing values for coffee, tea and milk and second values for paper and ink
   */
  protected _yKeys: string[][] = [];
  set yKeys(yKeys: string[][]) {
    let flatYKeys: string[] | undefined = undefined;
    // Convert from flat y-keys to grouped y-keys.
    if (yKeys.length && !Array.isArray(yKeys[0])) {
      flatYKeys = yKeys as any as string[];
      if (this.grouped) {
        yKeys = flatYKeys.map((k) => [k]);
      } else {
        yKeys = [flatYKeys];
      }
    }

    if (!equal(this._yKeys, yKeys)) {
      if (flatYKeys) {
        this.flatYKeys = flatYKeys;
      } else {
        this.flatYKeys = undefined;
      }

      this._yKeys = yKeys;

      let prevYKeyCount = 0;
      this.cumYKeyCount = [];
      const visibleStacks: string[] = [];
      yKeys.forEach((stack, index) => {
        if (stack.length > 0) {
          visibleStacks.push(String(index));
        }
        this.cumYKeyCount.push(prevYKeyCount);
        prevYKeyCount += stack.length;
      });
      this.yData = [];

      const { seriesItemEnabled } = this;
      seriesItemEnabled.clear();
      yKeys.forEach((stack) => {
        stack.forEach((yKey) => seriesItemEnabled.set(yKey, true));
      });

      const { groupScale } = this;
      groupScale.domain = visibleStacks;
      groupScale.padding = 0.1;
      groupScale.round = true;

      this.scheduleData();
    }
  }
  get yKeys(): string[][] {
    return this._yKeys;
  }

  protected _grouped: boolean = false;
  set grouped(value: boolean) {
    if (this._grouped !== value) {
      this._grouped = value;
      if (this.flatYKeys) {
        this.yKeys = this.flatYKeys as any;
      }
    }
  }
  get grouped(): boolean {
    return this._grouped;
  }

  /**
   * A map of `yKeys` to their names (used in legends and tooltips).
   * For example, if a key is `product_name` it's name can be a more presentable `Product Name`.
   */
  protected _yNames: { [key: string]: string } = {};
  set yNames(values: { [key: string]: string }) {
    if (Array.isArray(values) && this.flatYKeys) {
      const map: { [key: string]: string } = {};
      this.flatYKeys.forEach((k, i) => {
        map[k] = values[i];
      });
      values = map;
    }
    this._yNames = values;
    this.scheduleData();
  }
  get yNames(): { [key: string]: string } {
    return this._yNames;
  }

  setColors(fills: string[], strokes: string[]) {
    this.fills = fills;
    this.strokes = strokes;
  }

  /**
   * The value to normalize the bars to.
   * Should be a finite positive value or `undefined`.
   * Defaults to `undefined` - bars are not normalized.
   */
  private _normalizedTo?: number;
  set normalizedTo(value: number | undefined) {
    const absValue = value ? Math.abs(value) : undefined;

    if (this._normalizedTo !== absValue) {
      this._normalizedTo = absValue;
      this.scheduleData();
    }
  }
  get normalizedTo(): number | undefined {
    return this._normalizedTo;
  }

  private _strokeWidth: number = 1;
  set strokeWidth(value: number) {
    if (this._strokeWidth !== value) {
      this._strokeWidth = value;
      this.scheduleUpdate();
    }
  }
  get strokeWidth(): number {
    return this._strokeWidth;
  }

  private _shadow?: DropShadow;
  set shadow(value: DropShadow | undefined) {
    if (this._shadow !== value) {
      this._shadow = value;
      this.scheduleUpdate();
    }
  }
  get shadow(): DropShadow | undefined {
    return this._shadow;
  }

  onHighlightChange() {
    this.updateRectNodes();
  }

  processData(): boolean {
    const { xKey, yKeys, seriesItemEnabled } = this;
    const data = xKey && yKeys.length && this.data ? this.data : [];

    let keysFound = true; // only warn once
    this.xData = data.map((datum) => {
      if (keysFound && !(xKey in datum)) {
        keysFound = false;
        console.warn(`The key '${xKey}' was not found in the data: `, datum);
      }
      return datum[xKey];
    });

    this.yData = data.map((datum) =>
      yKeys.map((stack) => {
        return stack.map((yKey) => {
          if (keysFound && !(yKey in datum)) {
            keysFound = false;
            console.warn(`The key '${yKey}' was not found in the data: `, datum);
          }
          const value = datum[yKey];

          return isFinite(value) && seriesItemEnabled.get(yKey) ? value : 0;
        });
      })
    );

    // Used for normalization of stacked bars. Contains min/max values for each stack in each group,
    // where min is zero and max is a positive total of all values in the stack
    // or min is a negative total of all values in the stack and max is zero.
    const yMinMax = this.yData.map((group) => group.map((stack) => findMinMax(stack)));
    const { yData, normalizedTo } = this;

    const yLargestMinMax = this.findLargestMinMax(yMinMax);

    let yMin: number;
    let yMax: number;
    if (normalizedTo && isFinite(normalizedTo)) {
      yMin = yLargestMinMax.min < 0 ? -normalizedTo : 0;
      yMax = normalizedTo;
      yData.forEach((group, i) => {
        group.forEach((stack, j) => {
          stack.forEach((y, k) => {
            if (y < 0) {
              stack[k] = (-y / yMinMax[i][j].min) * normalizedTo;
            } else {
              stack[k] = (y / yMinMax[i][j].max) * normalizedTo;
            }
          });
        });
      });
    } else {
      yMin = yLargestMinMax.min;
      yMax = yLargestMinMax.max;
    }

    this.yDomain = this.fixNumericExtent([yMin, yMax], 'y');

    this.fireEvent({ type: 'dataProcessed' });

    return true;
  }

  findLargestMinMax(groups: { min: number; max: number }[][]): { min: number; max: number } {
    let tallestStackMin = 0;
    let tallestStackMax = 0;

    for (const group of groups) {
      for (const stack of group) {
        if (stack.min < tallestStackMin) {
          tallestStackMin = stack.min;
        }
        if (stack.max > tallestStackMax) {
          tallestStackMax = stack.max;
        }
      }
    }

    return { min: tallestStackMin, max: tallestStackMax };
  }

  getDomain(direction: ChartAxisDirection): any[] {
    if (this.flipXY) {
      direction = flipChartAxisDirection(direction);
    }
    if (direction === ChartAxisDirection.X) {
      return this.xData;
    } else {
      return this.yDomain;
    }
  }

  fireNodeClickEvent(event: MouseEvent, datum: BarNodeDatum): void {
    this.fireEvent<BarSeriesNodeClickEvent>({
      type: 'nodeClick',
      event,
      series: this,
      datum: datum.datum,
      xKey: this.xKey,
      yKey: datum.yKey,
    });
  }

  private getCategoryAxis(): ChartAxis<Scale<any, number>> | undefined {
    return this.flipXY ? this.yAxis : this.xAxis;
  }

  private getValueAxis(): ChartAxis<Scale<any, number>> | undefined {
    return this.flipXY ? this.xAxis : this.yAxis;
  }

  createNodeData(): BarNodeDatum[] {
    const { chart, data, visible } = this;
    const xAxis = this.getCategoryAxis();
    const yAxis = this.getValueAxis();

    if (!(chart && data && visible && xAxis && yAxis) || chart.layoutPending || chart.dataPending) {
      return [];
    }

    const { flipXY } = this;
    const xScale = xAxis.scale;
    const yScale = yAxis.scale;

    const { groupScale, yKeys, cumYKeyCount, fills, strokes, strokeWidth, seriesItemEnabled, xData, yData, label } =
      this;

    const {
      fontStyle: labelFontStyle,
      fontWeight: labelFontWeight,
      fontSize: labelFontSize,
      fontFamily: labelFontFamily,
      color: labelColor,
      formatter: labelFormatter,
      placement: labelPlacement,
    } = label;

    groupScale.range = [0, xScale.bandwidth!];

    const grouped = true;
    const barWidth = grouped ? groupScale.bandwidth : xScale.bandwidth!;
    const nodeData: BarNodeDatum[] = [];

    xData.forEach((group, groupIndex) => {
      const seriesDatum = data[groupIndex];
      const x = xScale.convert(group);

      const groupYs = yData[groupIndex]; // y-data for groups of stacks
      for (let stackIndex = 0; stackIndex < groupYs.length; stackIndex++) {
        const stackYs = groupYs[stackIndex]; // y-data for a stack withing a group

        // const zero = Math.max(0, (yAxis as NumberAxis).min, yScale.domain[0]);
        let prevMinY = 0;
        let prevMaxY = 0;

        for (let levelIndex = 0; levelIndex < stackYs.length; levelIndex++) {
          const currY = stackYs[levelIndex];
          const yKey = yKeys[stackIndex][levelIndex];
          const barX = grouped ? x + groupScale.convert(String(stackIndex)) : x;

          // Bars outside of visible range are not rendered, so we create node data
          // only for the visible subset of user data.
          if (!xAxis.inRange(barX, barWidth)) {
            continue;
          }

          const prevY = currY < 0 ? prevMinY : prevMaxY;
          const continuousY = yScale instanceof ContinuousScale;
          // @ts-ignore
          const y = yScale.convert(prevY + currY, continuousY ? clamper : undefined);
          // @ts-ignore
          const bottomY = yScale.convert(prevY, continuousY ? clamper : undefined);
          const yValue = seriesDatum[yKey]; // unprocessed y-value

          let labelText: string;
          if (labelFormatter) {
            labelText = labelFormatter({ value: isNumber(yValue) ? yValue : undefined });
          } else {
            labelText = isNumber(yValue) ? yValue.toFixed(2) : '';
          }

          let labelX: number;
          let labelY: number;

          if (flipXY) {
            labelY = barX + barWidth / 2;
            if (labelPlacement === BarLabelPlacement.Inside) {
              labelX = y + ((yValue >= 0 ? -1 : 1) * Math.abs(bottomY - y)) / 2;
            } else {
              labelX = y + (yValue >= 0 ? 1 : -1) * 4;
            }
          } else {
            labelX = barX + barWidth / 2;
            if (labelPlacement === BarLabelPlacement.Inside) {
              labelY = y + ((yValue >= 0 ? 1 : -1) * Math.abs(bottomY - y)) / 2;
            } else {
              labelY = y + (yValue >= 0 ? -3 : 4);
            }
          }

          let labelTextAlign: CanvasTextAlign;
          let labelTextBaseline: CanvasTextBaseline;

          if (labelPlacement === BarLabelPlacement.Inside) {
            labelTextAlign = 'center';
            labelTextBaseline = 'middle';
          } else {
            labelTextAlign = flipXY ? (yValue >= 0 ? 'start' : 'end') : 'center';
            labelTextBaseline = flipXY ? 'middle' : yValue >= 0 ? 'bottom' : 'top';
          }

          const colorIndex = cumYKeyCount[stackIndex] + levelIndex;
          nodeData.push({
            index: groupIndex,
            series: this,
            itemId: yKey,
            datum: seriesDatum,
            yValue,
            yKey,
            x: flipXY ? Math.min(y, bottomY) : barX,
            y: flipXY ? barX : Math.min(y, bottomY),
            width: flipXY ? Math.abs(bottomY - y) : barWidth,
            height: flipXY ? barWidth : Math.abs(bottomY - y),
            fill: fills[colorIndex % fills.length],
            stroke: strokes[colorIndex % strokes.length],
            strokeWidth,
            label:
              seriesItemEnabled.get(yKey) && labelText
                ? {
                    text: labelText,
                    fontStyle: labelFontStyle,
                    fontWeight: labelFontWeight,
                    fontSize: labelFontSize,
                    fontFamily: labelFontFamily,
                    textAlign: labelTextAlign,
                    textBaseline: labelTextBaseline,
                    fill: labelColor,
                    x: labelX,
                    y: labelY,
                  }
                : undefined,
          });

          if (currY < 0) {
            prevMinY += currY;
          } else {
            prevMaxY += currY;
          }
        }
      }
    });

    return (this.nodeData = nodeData);
  }

  update(): void {
    this.updatePending = false;

    this.updateSelections();
    this.updateNodes();
  }

  private updateSelections() {
    if (!this.nodeDataPending) {
      return;
    }
    this.nodeDataPending = false;

    this.createNodeData();
    this.updateRectSelection();
    this.updateLabelSelection();
  }

  private updateNodes() {
    this.group.visible = this.visible;
    this.updateRectNodes();
    this.updateLabelNodes();
  }

  private updateRectSelection(): void {
    const updateRects = this.rectSelection.setData(this.nodeData);
    updateRects.exit.remove();
    const enterRects = updateRects.enter.append(Rect).each((rect) => {
      rect.tag = BarSeriesNodeTag.Bar;
      rect.crisp = true;
    });
    this.rectSelection = updateRects.merge(enterRects);
  }

  private updateRectNodes(): void {
    if (!this.chart) {
      return;
    }

    const {
      fillOpacity,
      strokeOpacity,
      shadow,
      formatter,
      xKey,
      flipXY,
      chart: { highlightedDatum },
      highlightStyle: {
        item: { fill: highlightedFill, stroke: highlightedStroke, strokeWidth: highlightedDatumStrokeWidth },
      },
    } = this;

    this.rectSelection.each((rect, datum, index) => {
      const isDatumHighlighted = datum === highlightedDatum;
      const fill = isDatumHighlighted && highlightedFill !== undefined ? highlightedFill : datum.fill;
      const stroke = isDatumHighlighted && highlightedStroke !== undefined ? highlightedStroke : datum.stroke;
      const strokeWidth =
        isDatumHighlighted && highlightedDatumStrokeWidth !== undefined
          ? highlightedDatumStrokeWidth
          : this.getStrokeWidth(datum.strokeWidth, datum);

      let format: BarSeriesFormat | undefined = undefined;
      if (formatter) {
        format = formatter({
          datum: datum.datum,
          fill,
          stroke,
          strokeWidth,
          highlighted: isDatumHighlighted,
          xKey,
          yKey: datum.yKey,
        });
      }
      rect.x = datum.x;
      rect.y = datum.y;
      rect.width = datum.width;
      rect.height = datum.height;
      rect.fill = (format && format.fill) || fill;
      rect.stroke = (format && format.stroke) || stroke;
      rect.strokeWidth = format && format.strokeWidth !== undefined ? format.strokeWidth : strokeWidth;
      rect.fillOpacity = fillOpacity;
      rect.strokeOpacity = strokeOpacity;
      rect.lineDash = this.lineDash;
      rect.lineDashOffset = this.lineDashOffset;
      rect.fillShadow = shadow;
      // Prevent stroke from rendering for zero height columns and zero width bars.
      rect.visible = flipXY ? datum.width > 0 : datum.height > 0;
      rect.zIndex =
        datum === highlightedDatum || (highlightedDatum && datum.itemId === highlightedDatum.itemId)
          ? Series.highlightedZIndex
          : index;
      rect.opacity = this.getOpacity(datum);
    });
  }

  private updateLabelSelection(): void {
    const updateLabels = this.labelSelection.setData(this.nodeData);

    updateLabels.exit.remove();

    const enterLabels = updateLabels.enter.append(Text).each((text) => {
      text.tag = BarSeriesNodeTag.Label;
      text.pointerEvents = PointerEvents.None;
    });

    this.labelSelection = updateLabels.merge(enterLabels);
  }

  private updateLabelNodes(): void {
    if (!this.chart) {
      return;
    }

    const {
      label: { enabled: labelEnabled },
    } = this;

    this.labelSelection.each((text, datum) => {
      const label = datum.label;

      if (label && labelEnabled) {
        text.fontStyle = label.fontStyle;
        text.fontWeight = label.fontWeight;
        text.fontSize = label.fontSize;
        text.fontFamily = label.fontFamily;
        text.textAlign = label.textAlign;
        text.textBaseline = label.textBaseline;
        text.text = label.text;
        text.x = label.x;
        text.y = label.y;
        text.fill = label.fill;
        text.visible = true;
        text.opacity = this.getOpacity(datum);
      } else {
        text.visible = false;
      }
    });
  }

  getTooltipHtml(nodeDatum: BarNodeDatum): string {
    const { xKey, yKeys, yData } = this;
    const xAxis = this.getCategoryAxis();
    const yAxis = this.getValueAxis();
    const { yKey } = nodeDatum;

    if (!yData.length || !xKey || !yKey || !xAxis || !yAxis) {
      return '';
    }

    const yGroup = yData[nodeDatum.index];
    let fillIndex = 0;
    let i = 0;
    let j = 0;
    for (; j < yKeys.length; j++) {
      const stack = yKeys[j];
      i = stack.indexOf(yKey);
      if (i >= 0) {
        fillIndex += i;
        break;
      }
      fillIndex += stack.length;
    }

    const { xName, yNames, fills, tooltip } = this;
    const { renderer: tooltipRenderer } = tooltip;
    const datum = nodeDatum.datum;
    const yName = yNames[yKey];
    const color = fills[fillIndex % fills.length];
    const xValue = datum[xKey];
    const yValue = datum[yKey];
    const processedYValue = yGroup[j][i];
    const xString = sanitizeHtml(xAxis.formatDatum(xValue));
    const yString = sanitizeHtml(yAxis.formatDatum(yValue));
    const title = sanitizeHtml(yName);
    const content = xString + ': ' + yString;
    const defaults: TooltipRendererResult = {
      title,
      backgroundColor: color,
      content,
    };

    if (tooltipRenderer) {
      return toTooltipHtml(
        tooltipRenderer({
          datum,
          xKey,
          xValue,
          xName,
          yKey,
          yValue,
          processedYValue,
          yName,
          color,
        }),
        defaults
      );
    }

    return toTooltipHtml(defaults);
  }

  listSeriesItems(legendData: LegendDatum[]): void {
    const {
      id,
      data,
      xKey,
      yKeys,
      yNames,
      cumYKeyCount,
      seriesItemEnabled,
      hideInLegend,
      fills,
      strokes,
      fillOpacity,
      strokeOpacity,
    } = this;

    if (data && data.length && xKey && yKeys.length) {
      this.yKeys.forEach((stack, stackIndex) => {
        stack.forEach((yKey, levelIndex) => {
          if (hideInLegend.indexOf(yKey) < 0) {
            const colorIndex = cumYKeyCount[stackIndex] + levelIndex;
            legendData.push({
              id,
              itemId: yKey,
              enabled: seriesItemEnabled.get(yKey) || false,
              label: {
                text: yNames[yKey] || yKey,
              },
              marker: {
                fill: fills[colorIndex % fills.length],
                stroke: strokes[colorIndex % strokes.length],
                fillOpacity: fillOpacity,
                strokeOpacity: strokeOpacity,
              },
            });
          }
        });
      });
    }
  }

  toggleSeriesItem(itemId: string, enabled: boolean): void {
    const { seriesItemEnabled } = this;
    seriesItemEnabled.set(itemId, enabled);

    const yKeys = this.yKeys.map((stack) => stack.slice()); // deep clone

    seriesItemEnabled.forEach((enabled, yKey) => {
      if (!enabled) {
        yKeys.forEach((stack) => {
          const index = stack.indexOf(yKey);
          if (index >= 0) {
            stack.splice(index, 1);
          }
        });
      }
    });

    const visibleStacks: string[] = [];
    yKeys.forEach((stack, index) => {
      if (stack.length > 0) {
        visibleStacks.push(String(index));
      }
    });
    this.groupScale.domain = visibleStacks;

    this.scheduleData();
  }
}
