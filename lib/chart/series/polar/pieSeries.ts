import { Group } from '../../../scene/group';
import { Line } from '../../../scene/shape/line';
import { Text } from '../../../scene/shape/text';
import { Selection } from '../../../scene/selection';
import { DropShadow } from '../../../scene/dropShadow';
import { LinearScale } from '../../../scale/linearScale';
import { Sector } from '../../../scene/shape/sector';
import { type PolarTooltipRendererParams, type SeriesNodeDatum, HighlightStyle, SeriesTooltip } from '../series';
import { Label } from '../../label';
import { PointerEvents } from '../../../scene/node';
import { normalizeAngle180, toRadians } from '../../../util/angle';
import { toFixed } from '../../../util/number';
import { type LegendDatum } from '../../legend';
import { Caption } from '../../../caption';
import { Observable, type TypedEvent } from '../../../util/observable';
import { PolarSeries } from './polarSeries';
import { ChartAxisDirection } from '../../chartAxis';
import { type TooltipRendererResult, toTooltipHtml } from '../../chart';

export interface PieSeriesNodeClickEvent extends TypedEvent {
  readonly type: 'nodeClick';
  readonly event: MouseEvent;
  readonly series: PieSeries;
  readonly datum: any;
  readonly angleKey: string;
  readonly labelKey?: string;
  readonly radiusKey?: string;
}

interface PieNodeDatum extends SeriesNodeDatum {
  readonly index: number;
  readonly radius: number; // in the [0, 1] range
  readonly startAngle: number;
  readonly endAngle: number;
  readonly midAngle: number;
  readonly midCos: number;
  readonly midSin: number;

  readonly label?: {
    readonly text: string;
    readonly textAlign: CanvasTextAlign;
    readonly textBaseline: CanvasTextBaseline;
  };
}

export interface PieTooltipRendererParams extends PolarTooltipRendererParams {
  readonly labelKey?: string;
  readonly labelName?: string;
}

class PieHighlightStyle extends HighlightStyle {
  centerOffset?: number;
}

enum PieNodeTag {
  Sector,
  Callout,
  Label,
}

export interface PieSeriesFormatterParams {
  readonly datum: any;
  readonly fill?: string;
  readonly stroke?: string;
  readonly strokeWidth: number;
  readonly highlighted: boolean;
  readonly angleKey: string;
  readonly radiusKey?: string;
}

export interface PieSeriesFormat {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

class PieSeriesLabel extends Label {
  private _offset: number = 3;
  set offset(value: number) {
    const oldValue = this._offset;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._offset = value;
      this.notifyPropertyListeners('offset', oldValue, value);
      this.notifyEventListeners(['change']);
    }
  }
  get offset(): number {
    return this._offset;
  }

  private _minAngle: number = 20;
  set minAngle(value: number) {
    const oldValue = this._minAngle;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._minAngle = value;
      this.notifyPropertyListeners('minAngle', oldValue, value);
      this.notifyEventListeners(['dataChange']);
    }
  }
  get minAngle(): number {
    return this._minAngle;
  }

  private _formatter: ((params: { value: any }) => string) | undefined;
  set formatter(value: ((params: { value: any }) => string) | undefined) {
    const oldValue = this._formatter;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._formatter = value;
      this.notifyPropertyListeners('formatter', oldValue, value);
      this.notifyEventListeners(['dataChange']);
    }
  }
  get formatter(): ((params: { value: any }) => string) | undefined {
    return this._formatter;
  }
}

class PieSeriesCallout extends Observable {
  private _colors: string[] = ['#874349', '#718661', '#a48f5f', '#5a7088', '#7f637a', '#5d8692'];
  set colors(value: string[]) {
    const oldValue = this._colors;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._colors = value;
      this.notifyPropertyListeners('colors', oldValue, value);
      this.notifyEventListeners(['change']);
    }
  }
  get colors(): string[] {
    return this._colors;
  }

  private _length: number = 10;
  set length(value: number) {
    const oldValue = this._length;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._length = value;
      this.notifyPropertyListeners('length', oldValue, value);
      this.notifyEventListeners(['change']);
    }
  }
  get length(): number {
    return this._length;
  }

  private _strokeWidth: number = 1;
  set strokeWidth(value: number) {
    const oldValue = this._strokeWidth;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._strokeWidth = value;
      this.notifyPropertyListeners('strokeWidth', oldValue, value);
      this.notifyEventListeners(['change']);
    }
  }
  get strokeWidth(): number {
    return this._strokeWidth;
  }
}

export class PieSeriesTooltip extends SeriesTooltip {
  private _renderer: ((params: PieTooltipRendererParams) => string | TooltipRendererResult) | undefined;
  set renderer(value: ((params: PieTooltipRendererParams) => string | TooltipRendererResult) | undefined) {
    const oldValue = this._renderer;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._renderer = value;
      this.notifyPropertyListeners('renderer', oldValue, value);
      this.notifyEventListeners(['change']);
    }
  }
  get renderer(): ((params: PieTooltipRendererParams) => string | TooltipRendererResult) | undefined {
    return this._renderer;
  }
}

export class PieTitle extends Caption {
  private _showInLegend: any = false;
  set showInLegend(value: any) {
    const oldValue = this._showInLegend;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._showInLegend = value;
      this.notifyPropertyListeners('showInLegend', oldValue, value);
    }
  }
  get showInLegend(): any {
    return this._showInLegend;
  }
}

export class PieSeries extends PolarSeries {
  static className = 'PieSeries';
  static type = 'pie';

  private radiusScale: LinearScale = new LinearScale();
  private groupSelection: Selection<Group, Group, PieNodeDatum, any> = Selection.select(
    this.pickGroup
  ).selectAll<Group>();

  /**
   * The processed data that gets visualized.
   */
  private groupSelectionData: PieNodeDatum[] = [];

  private angleScale: LinearScale = (() => {
    const scale = new LinearScale();
    // Each slice is a ratio of the whole, where all ratios add up to 1.
    scale.domain = [0, 1];
    // Add 90 deg to start the first pie at 12 o'clock.
    scale.range = [-Math.PI, Math.PI].map((angle) => angle + Math.PI / 2);
    return scale;
  })();

  // When a user toggles a series item (e.g. from the legend), its boolean state is recorded here.
  public seriesItemEnabled: boolean[] = [];

  private _title?: PieTitle;
  set title(value: PieTitle | undefined) {
    const oldTitle = this._title;

    function updateLegend(this: PieSeries) {
      this.fireEvent({ type: 'legendChange' });
    }

    if (oldTitle !== value) {
      if (oldTitle) {
        oldTitle.removeEventListener('change', this.scheduleUpdate, this);
        oldTitle.addPropertyListener('showInLegend', updateLegend, this);
        this.group.removeChild(oldTitle.node);
      }

      if (value) {
        value.node.textBaseline = 'bottom';
        value.addEventListener('change', this.scheduleUpdate, this);
        value.addPropertyListener('showInLegend', updateLegend, this);
        this.group.appendChild(value.node);
      }

      this._title = value;
      this.scheduleUpdate();
    }
  }
  get title(): PieTitle | undefined {
    return this._title;
  }

  readonly label = new PieSeriesLabel();
  readonly callout = new PieSeriesCallout();

  tooltip: PieSeriesTooltip = new PieSeriesTooltip();

  constructor() {
    super();

    this.addEventListener('update', this.scheduleUpdate, this);
    this.label.addEventListener('change', this.scheduleLayout, this);
    this.label.addEventListener('dataChange', this.scheduleData, this);
    this.callout.addEventListener('change', this.scheduleLayout, this);

    this.addPropertyListener('data', (event) => {
      if (event.value) {
        event.source.seriesItemEnabled = event.value.map(() => true);
      }
    });
  }

  /**
   * The key of the numeric field to use to determine the angle (for example,
   * a pie slice angle).
   */
  private _angleKey: string = '';
  set angleKey(value: string) {
    const oldValue = this._angleKey;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._angleKey = value;
      this.notifyPropertyListeners('angleKey', oldValue, value);
      this.notifyEventListeners(['dataChange']);
    }
  }
  get angleKey(): string {
    return this._angleKey;
  }

  private _angleName: string = '';
  set angleName(value: string) {
    const oldValue = this._angleName;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._angleName = value;
      this.notifyPropertyListeners('angleName', oldValue, value);
      this.notifyEventListeners(['update']);
    }
  }
  get angleName(): string {
    return this._angleName;
  }

  /**
   * The key of the numeric field to use to determine the radii of pie slices.
   * The largest value will correspond to the full radius and smaller values to
   * proportionally smaller radii.
   */
  private _radiusKey: string | undefined;
  set radiusKey(value: string | undefined) {
    const oldValue = this._radiusKey;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._radiusKey = value;
      this.notifyPropertyListeners('radiusKey', oldValue, value);
      this.notifyEventListeners(['dataChange']);
    }
  }
  get radiusKey(): string | undefined {
    return this._radiusKey;
  }

  private _radiusName: string | undefined;
  set radiusName(value: string | undefined) {
    const oldValue = this._radiusName;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._radiusName = value;
      this.notifyPropertyListeners('radiusName', oldValue, value);
      this.notifyEventListeners(['update']);
    }
  }
  get radiusName(): string | undefined {
    return this._radiusName;
  }

  private _radiusMin: number | undefined;
  set radiusMin(value: number | undefined) {
    const oldValue = this._radiusMin;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._radiusMin = value;
      this.notifyPropertyListeners('radiusMin', oldValue, value);
      this.notifyEventListeners(['dataChange']);
    }
  }
  get radiusMin(): number | undefined {
    return this._radiusMin;
  }

  private _radiusMax: number | undefined;
  set radiusMax(value: number | undefined) {
    const oldValue = this._radiusMax;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._radiusMax = value;
      this.notifyPropertyListeners('radiusMax', oldValue, value);
      this.notifyEventListeners(['dataChange']);
    }
  }
  get radiusMax(): number | undefined {
    return this._radiusMax;
  }

  private _labelKey: string | undefined;
  set labelKey(value: string | undefined) {
    const oldValue = this._labelKey;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._labelKey = value;
      this.notifyPropertyListeners('labelKey', oldValue, value);
      this.notifyEventListeners(['dataChange']);
    }
  }
  get labelKey(): string | undefined {
    return this._labelKey;
  }

  private _labelName: string | undefined;
  set labelName(value: string | undefined) {
    const oldValue = this._labelName;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._labelName = value;
      this.notifyPropertyListeners('labelName', oldValue, value);
      this.notifyEventListeners(['update']);
    }
  }
  get labelName(): string | undefined {
    return this._labelName;
  }

  private _fills: string[] = ['#c16068', '#a2bf8a', '#ebcc87', '#80a0c3', '#b58dae', '#85c0d1'];
  set fills(values: string[]) {
    this._fills = values;
    this.scheduleData();
  }
  get fills(): string[] {
    return this._fills;
  }

  private _strokes: string[] = ['#874349', '#718661', '#a48f5f', '#5a7088', '#7f637a', '#5d8692'];
  set strokes(values: string[]) {
    this._strokes = values;
    this.scheduleData();
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

  private _formatter: ((params: PieSeriesFormatterParams) => PieSeriesFormat) | undefined;
  set formatter(value: ((params: PieSeriesFormatterParams) => PieSeriesFormat) | undefined) {
    const oldValue = this._formatter;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._formatter = value;
      this.notifyPropertyListeners('formatter', oldValue, value);
      this.notifyEventListeners(['update']);
    }
  }
  get formatter(): ((params: PieSeriesFormatterParams) => PieSeriesFormat) | undefined {
    return this._formatter;
  }

  /**
   * The series rotation in degrees.
   */
  private _rotation: number = 0;
  set rotation(value: number) {
    const oldValue = this._rotation;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._rotation = value;
      this.notifyPropertyListeners('rotation', oldValue, value);
      this.notifyEventListeners(['dataChange']);
    }
  }
  get rotation(): number {
    return this._rotation;
  }

  private _outerRadiusOffset: number = 0;
  set outerRadiusOffset(value: number) {
    const oldValue = this._outerRadiusOffset;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._outerRadiusOffset = value;
      this.notifyPropertyListeners('outerRadiusOffset', oldValue, value);
      this.notifyEventListeners(['layoutChange']);
    }
  }
  get outerRadiusOffset(): number {
    return this._outerRadiusOffset;
  }

  private _innerRadiusOffset: number = 0;
  set innerRadiusOffset(value: number) {
    const oldValue = this._innerRadiusOffset;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._innerRadiusOffset = value;
      this.notifyPropertyListeners('innerRadiusOffset', oldValue, value);
      this.notifyEventListeners(['dataChange']);
    }
  }
  get innerRadiusOffset(): number {
    return this._innerRadiusOffset;
  }

  private _strokeWidth: number = 1;
  set strokeWidth(value: number) {
    const oldValue = this._strokeWidth;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._strokeWidth = value;
      this.notifyPropertyListeners('strokeWidth', oldValue, value);
      this.notifyEventListeners(['layoutChange']);
    }
  }
  get strokeWidth(): number {
    return this._strokeWidth;
  }

  private _shadow: DropShadow | undefined;
  set shadow(value: DropShadow | undefined) {
    const oldValue = this._shadow;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._shadow = value;
      this.notifyPropertyListeners('shadow', oldValue, value);
      this.notifyEventListeners(['layoutChange']);
    }
  }
  get shadow(): DropShadow | undefined {
    return this._shadow;
  }

  readonly highlightStyle = new PieHighlightStyle();

  onHighlightChange() {
    this.updateNodes();
  }

  setColors(fills: string[], strokes: string[]) {
    this.fills = fills;
    this.strokes = strokes;
    this.callout.colors = strokes;
  }

  getDomain(direction: ChartAxisDirection): any[] {
    if (direction === ChartAxisDirection.X) {
      return this.angleScale.domain;
    } else {
      return this.radiusScale.domain;
    }
  }

  processData(): boolean {
    const { angleKey, radiusKey, seriesItemEnabled, angleScale, groupSelectionData, label } = this;
    const data = angleKey && this.data ? this.data : [];

    const angleData: number[] = data.map(
      (datum, index) => (seriesItemEnabled[index] && Math.abs(+datum[angleKey])) || 0
    );
    const angleDataTotal = angleData.reduce((a, b) => a + b, 0);

    // The ratios (in [0, 1] interval) used to calculate the end angle value for every pie slice.
    // Each slice starts where the previous one ends, so we only keep the ratios for end angles.
    const angleDataRatios = (() => {
      let sum = 0;
      return angleData.map((datum) => (sum += datum / angleDataTotal));
    })();

    const labelFormatter = label.formatter;
    const labelKey = label.enabled && this.labelKey;
    let labelData: string[] = [];
    let radiusData: number[] = [];

    if (labelKey) {
      if (labelFormatter) {
        labelData = data.map((datum) => labelFormatter({ value: datum[labelKey] }));
      } else {
        labelData = data.map((datum) => String(datum[labelKey]));
      }
    }

    if (radiusKey) {
      const { radiusMin, radiusMax } = this;
      const radii = data.map((datum) => Math.abs(datum[radiusKey]));
      const min = radiusMin !== undefined ? radiusMin : Math.min(...radii);
      const max = radiusMax !== undefined ? radiusMax : Math.max(...radii);
      const delta = max - min;

      radiusData = radii.map((value) => (delta ? (value - min) / delta : 1));
    }

    groupSelectionData.length = 0;

    const rotation = toRadians(this.rotation);
    const halfPi = Math.PI / 2;

    let datumIndex = 0;

    // Simply use reduce here to pair up adjacent ratios.
    angleDataRatios.reduce((start, end) => {
      const radius = radiusKey ? radiusData[datumIndex] : 1;
      const startAngle = angleScale.convert(start) + rotation;
      const endAngle = angleScale.convert(end) + rotation;

      const midAngle = (startAngle + endAngle) / 2;
      const span = Math.abs(endAngle - startAngle);
      const midCos = Math.cos(midAngle);
      const midSin = Math.sin(midAngle);

      const labelMinAngle = toRadians(label.minAngle);
      const labelVisible = labelKey && span > labelMinAngle;
      const midAngle180 = normalizeAngle180(midAngle);

      // Split the circle into quadrants like so: ⊗
      let quadrantStart = (-3 * Math.PI) / 4; // same as `normalizeAngle180(toRadians(-135))`
      let textAlign: CanvasTextAlign;
      let textBaseline: CanvasTextBaseline;

      if (midAngle180 >= quadrantStart && midAngle180 < (quadrantStart += halfPi)) {
        textAlign = 'center';
        textBaseline = 'bottom';
      } else if (midAngle180 >= quadrantStart && midAngle180 < (quadrantStart += halfPi)) {
        textAlign = 'left';
        textBaseline = 'middle';
      } else if (midAngle180 >= quadrantStart && midAngle180 < (quadrantStart += halfPi)) {
        textAlign = 'center';
        textBaseline = 'hanging';
      } else {
        textAlign = 'right';
        textBaseline = 'middle';
      }

      groupSelectionData.push({
        series: this,
        datum: data[datumIndex],
        itemId: datumIndex,
        index: datumIndex,
        radius,
        startAngle,
        endAngle,
        midAngle,
        midCos,
        midSin,
        label: labelVisible
          ? {
              text: labelData[datumIndex],
              textAlign,
              textBaseline,
            }
          : undefined,
      });

      datumIndex++;

      return end;
    }, 0);

    return true;
  }

  update(): void {
    this.updatePending = false;

    const { radius, innerRadiusOffset, outerRadiusOffset, title } = this;

    this.radiusScale.range = [innerRadiusOffset ? radius + innerRadiusOffset : 0, radius + (outerRadiusOffset || 0)];

    this.group.translationX = this.centerX;
    this.group.translationY = this.centerY;

    if (title) {
      title.node.translationY = -radius - outerRadiusOffset - 2;
      title.node.visible = title.enabled;
    }

    this.updateSelections();
    this.updateNodes();
  }

  private updateSelections() {
    if (!this.nodeDataPending) {
      return;
    }
    this.nodeDataPending = false;

    this.updateGroupSelection();
  }

  private updateGroupSelection() {
    const updateGroups = this.groupSelection.setData(this.groupSelectionData);
    updateGroups.exit.remove();

    const enterGroups = updateGroups.enter.append(Group);
    enterGroups.append(Sector).each((node) => (node.tag = PieNodeTag.Sector));
    enterGroups.append(Line).each((node) => {
      node.tag = PieNodeTag.Callout;
      node.pointerEvents = PointerEvents.None;
    });
    enterGroups.append(Text).each((node) => {
      node.tag = PieNodeTag.Label;
      node.pointerEvents = PointerEvents.None;
    });

    this.groupSelection = updateGroups.merge(enterGroups);
  }

  private updateNodes() {
    if (!this.chart) {
      return;
    }

    this.group.visible = this.visible && this.seriesItemEnabled.indexOf(true) >= 0;

    const {
      fills,
      strokes,
      fillOpacity,
      strokeOpacity,
      radiusScale,
      callout,
      shadow,
      chart: { highlightedDatum },
      highlightStyle: {
        item: { fill: highlightedFill, stroke: highlightedStroke, strokeWidth: highlightedDatumStrokeWidth },
      },
      angleKey,
      radiusKey,
      formatter,
    } = this;

    const centerOffsets: number[] = [];
    const innerRadius = radiusScale.convert(0);

    this.groupSelection.selectByTag<Sector>(PieNodeTag.Sector).each((sector, datum, index) => {
      const radius = radiusScale.convert(datum.radius);
      const isDatumHighlighted =
        !!highlightedDatum && highlightedDatum.series === this && datum.itemId === highlightedDatum.itemId;
      const fill = isDatumHighlighted && highlightedFill !== undefined ? highlightedFill : fills[index % fills.length];
      const stroke =
        isDatumHighlighted && highlightedStroke !== undefined ? highlightedStroke : strokes[index % strokes.length];
      const strokeWidth =
        isDatumHighlighted && highlightedDatumStrokeWidth !== undefined
          ? highlightedDatumStrokeWidth
          : this.getStrokeWidth(this.strokeWidth);

      let format: PieSeriesFormat | undefined = undefined;
      if (formatter) {
        format = formatter({
          datum: datum.datum,
          angleKey,
          radiusKey,
          fill,
          stroke,
          strokeWidth,
          highlighted: isDatumHighlighted,
        });
      }

      // Bring highlighted slice's parent group to front.
      const parent = sector.parent && sector.parent.parent;
      if (isDatumHighlighted && parent) {
        parent.removeChild(sector.parent!);
        parent.appendChild(sector.parent!);
      }

      sector.innerRadius = innerRadius;
      sector.outerRadius = radius;

      sector.startAngle = datum.startAngle;
      sector.endAngle = datum.endAngle;

      sector.fill = (format && format.fill) || fill;
      sector.stroke = (format && format.stroke) || stroke;
      sector.strokeWidth = format && format.strokeWidth !== undefined ? format.strokeWidth : strokeWidth;
      sector.fillOpacity = fillOpacity;
      sector.strokeOpacity = strokeOpacity;
      sector.lineDash = this.lineDash;
      sector.lineDashOffset = this.lineDashOffset;
      sector.fillShadow = shadow;
      sector.lineJoin = 'round';
      sector.opacity = this.getOpacity();

      centerOffsets.push(sector.centerOffset);
    });

    const { colors: calloutColors, length: calloutLength, strokeWidth: calloutStrokeWidth } = callout;

    this.groupSelection.selectByTag<Line>(PieNodeTag.Callout).each((line, datum, index) => {
      if (datum.label) {
        const radius = radiusScale.convert(datum.radius);

        line.strokeWidth = calloutStrokeWidth;
        line.stroke = calloutColors[index % calloutColors.length];
        line.x1 = datum.midCos * radius;
        line.y1 = datum.midSin * radius;
        line.x2 = datum.midCos * (radius + calloutLength);
        line.y2 = datum.midSin * (radius + calloutLength);
      } else {
        line.stroke = undefined;
      }
    });

    {
      const { offset, fontStyle, fontWeight, fontSize, fontFamily, color } = this.label;

      this.groupSelection.selectByTag<Text>(PieNodeTag.Label).each((text, datum, index) => {
        const label = datum.label;

        if (label) {
          const radius = radiusScale.convert(datum.radius);
          const labelRadius = centerOffsets[index] + radius + calloutLength + offset;

          text.fontStyle = fontStyle;
          text.fontWeight = fontWeight;
          text.fontSize = fontSize;
          text.fontFamily = fontFamily;
          text.text = label.text;
          text.x = datum.midCos * labelRadius;
          text.y = datum.midSin * labelRadius;
          text.fill = color;
          text.textAlign = label.textAlign;
          text.textBaseline = label.textBaseline;
        } else {
          text.fill = undefined;
        }
      });
    }
  }

  fireNodeClickEvent(event: MouseEvent, datum: PieNodeDatum): void {
    this.fireEvent<PieSeriesNodeClickEvent>({
      type: 'nodeClick',
      event,
      series: this,
      datum: datum.datum,
      angleKey: this.angleKey,
      labelKey: this.labelKey,
      radiusKey: this.radiusKey,
    });
  }

  getTooltipHtml(nodeDatum: PieNodeDatum): string {
    const { angleKey } = this;

    if (!angleKey) {
      return '';
    }

    const { fills, tooltip, angleName, radiusKey, radiusName, labelKey, labelName } = this;

    const { renderer: tooltipRenderer } = tooltip;
    const color = fills[nodeDatum.index % fills.length];
    const datum = nodeDatum.datum;
    const label = labelKey ? `${datum[labelKey]}: ` : '';
    const angleValue = datum[angleKey];
    const formattedAngleValue = typeof angleValue === 'number' ? toFixed(angleValue) : angleValue.toString();
    const title = this.title ? this.title.text : undefined;
    const content = label + formattedAngleValue;
    const defaults: TooltipRendererResult = {
      title,
      backgroundColor: color,
      content,
    };

    if (tooltipRenderer) {
      return toTooltipHtml(
        tooltipRenderer({
          datum,
          angleKey,
          angleValue,
          angleName,
          radiusKey,
          radiusValue: radiusKey ? datum[radiusKey] : undefined,
          radiusName,
          labelKey,
          labelName,
          title,
          color,
        }),
        defaults
      );
    }

    return toTooltipHtml(defaults);
  }

  listSeriesItems(legendData: LegendDatum[]): void {
    const { labelKey, data } = this;

    if (data && data.length && labelKey) {
      const { fills, strokes, id } = this;

      const titleText = this.title && this.title.showInLegend && this.title.text;
      data.forEach((datum, index) => {
        let labelParts = [];
        titleText && labelParts.push(titleText);
        labelParts.push(String(datum[labelKey]));

        legendData.push({
          id,
          itemId: index,
          enabled: this.seriesItemEnabled[index],
          label: {
            text: labelParts.join(' - '),
          },
          marker: {
            fill: fills[index % fills.length],
            stroke: strokes[index % strokes.length],
            fillOpacity: this.fillOpacity,
            strokeOpacity: this.strokeOpacity,
          },
        });
      });
    }
  }

  toggleSeriesItem(itemId: number, enabled: boolean): void {
    this.seriesItemEnabled[itemId] = enabled;
    this.scheduleData();
  }
}
