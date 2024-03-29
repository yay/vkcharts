import { Selection } from '../../../scene/selection';
import { Group } from '../../../scene/group';
import { type SeriesNodeDatum, type CartesianTooltipRendererParams, SeriesTooltip, Series } from '../series';
import { extent } from '../../../util/array';
import { type LegendDatum } from '../../legend';
import { LinearScale } from '../../../scale/linearScale';
import { type TypedEvent } from '../../../util/observable';
import { CartesianSeries, CartesianSeriesMarker, type CartesianSeriesMarkerFormat } from './cartesianSeries';
import { ChartAxisDirection } from '../../chartAxis';
import { getMarker } from '../../marker/util';
import { type TooltipRendererResult, toTooltipHtml } from '../../chart';
import { ContinuousScale } from '../../../scale/continuousScale';
import { sanitizeHtml } from '../../../util/sanitize';
import { Label } from '../../label';
import { Text } from '../../../scene/shape/text';
import { HdpiCanvas } from '../../../canvas/hdpiCanvas';
import { Marker } from '../../marker/marker';
import { type MeasuredLabel, type PlacedLabel, type PointLabelDatum } from '../../../util/labelPlacement';
import { isContinuous } from '../../../util/value';

interface ScatterNodeDatum extends SeriesNodeDatum {
  readonly point: {
    readonly x: number;
    readonly y: number;
  };
  readonly size: number;
  readonly label: MeasuredLabel;
}

export interface ScatterSeriesNodeClickEvent extends TypedEvent {
  readonly type: 'nodeClick';
  readonly event: MouseEvent;
  readonly series: ScatterSeries;
  readonly datum: any;
  readonly xKey: string;
  readonly yKey: string;
  readonly sizeKey?: string;
}

export interface ScatterTooltipRendererParams extends CartesianTooltipRendererParams {
  readonly sizeKey?: string;
  readonly sizeName?: string;

  readonly labelKey?: string;
  readonly labelName?: string;
}

export class ScatterSeriesTooltip extends SeriesTooltip {
  private _renderer: ((params: ScatterTooltipRendererParams) => string | TooltipRendererResult) | undefined;
  set renderer(value: ((params: ScatterTooltipRendererParams) => string | TooltipRendererResult) | undefined) {
    const oldValue = this._renderer;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._renderer = value;
      this.notifyPropertyListeners('renderer', oldValue, value);
      this.notifyEventListeners(['change']);
    }
  }
  get renderer(): ((params: ScatterTooltipRendererParams) => string | TooltipRendererResult) | undefined {
    return this._renderer;
  }
}

export class ScatterSeries extends CartesianSeries {
  static className = 'ScatterSeries';
  static type = 'scatter';

  private xDomain: number[] = [];
  private yDomain: number[] = [];
  private xData: any[] = [];
  private yData: any[] = [];
  private sizeData: number[] = [];
  private sizeScale = new LinearScale();

  private nodeData: ScatterNodeDatum[] = [];
  private markerSelection: Selection<Marker, Group, ScatterNodeDatum, any> = Selection.select(
    this.pickGroup
  ).selectAll<Marker>();

  private labelData: MeasuredLabel[] = [];
  private labelSelection: Selection<Text, Group, PlacedLabel, any> = Selection.select(this.group).selectAll<Text>();

  readonly marker = new CartesianSeriesMarker();

  readonly label = new Label();

  onHighlightChange() {
    this.updateMarkerNodes();
  }

  private _title: string | undefined;
  set title(value: string | undefined) {
    const oldValue = this._title;
    if (value !== oldValue) {
      this._title = value;
      this.notifyPropertyListeners('title', oldValue, value);
      this.notifyEventListeners(['layoutChange']);
    }
  }
  get title(): string | undefined {
    return this._title;
  }

  private _xKey: string = '';
  set xKey(value: string) {
    const oldValue = this._xKey;
    if (value !== oldValue) {
      this._xKey = value;
      this.notifyPropertyListeners('xKey', oldValue, value);
      this.notifyEventListeners(['dataChange']);
    }
  }
  get xKey(): string {
    return this._xKey;
  }

  private _yKey: string = '';
  set yKey(value: string) {
    const oldValue = this._yKey;
    if (value !== oldValue) {
      this._yKey = value;
      this.notifyPropertyListeners('yKey', oldValue, value);
      this.notifyEventListeners(['dataChange']);
    }
  }
  get yKey(): string {
    return this._yKey;
  }

  private _sizeKey: string | undefined;
  set sizeKey(value: string | undefined) {
    const oldValue = this._sizeKey;
    if (value !== oldValue) {
      this._sizeKey = value;
      this.notifyPropertyListeners('sizeKey', oldValue, value);
      this.notifyEventListeners(['dataChange']);
    }
  }
  get sizeKey(): string | undefined {
    return this._sizeKey;
  }

  private _labelKey: string | undefined;
  set labelKey(value: string | undefined) {
    const oldValue = this._labelKey;
    if (value !== oldValue) {
      this._labelKey = value;
      this.notifyPropertyListeners('labelKey', oldValue, value);
      this.notifyEventListeners(['dataChange']);
    }
  }
  get labelKey(): string | undefined {
    return this._labelKey;
  }

  xName: string = '';
  yName: string = '';
  sizeName?: string = 'Size';
  labelName?: string = 'Label';

  readonly tooltip: ScatterSeriesTooltip = new ScatterSeriesTooltip();

  constructor() {
    super();

    const { marker, label } = this;

    marker.addPropertyListener('shape', this.onMarkerShapeChange, this);
    marker.addEventListener('change', this.scheduleUpdate, this);
    marker.addPropertyListener('maxSize', this.scheduleData, this);

    this.addPropertyListener('xKey', () => (this.xData = []));
    this.addPropertyListener('yKey', () => (this.yData = []));
    this.addPropertyListener('sizeKey', () => (this.sizeData = []));

    label.enabled = false;
    label.addEventListener('change', this.scheduleUpdate, this);
    label.addEventListener('dataChange', this.scheduleData, this);
    label.addPropertyListener('fontSize', this.scheduleData, this);
  }

  onMarkerShapeChange() {
    this.markerSelection = this.markerSelection.setData([]);
    this.markerSelection.exit.remove();
    this.update();

    this.fireEvent({ type: 'legendChange' });
  }

  setColors(fills: string[], strokes: string[]) {
    this.marker.fill = fills[0];
    this.marker.stroke = strokes[0];
  }

  processData(): boolean {
    const { xKey, yKey, sizeKey, labelKey, xAxis, yAxis, marker, label } = this;

    if (!xAxis || !yAxis) {
      return false;
    }

    const data = xKey && yKey && this.data ? this.data : [];

    this.xData = data.map((d) => d[xKey]);
    this.yData = data.map((d) => d[yKey]);

    this.sizeData = sizeKey ? data.map((d) => d[sizeKey]) : [];

    const font = label.getFont();
    this.labelData = labelKey
      ? data.map((d) => {
          const text = String(d[labelKey]);
          const size = HdpiCanvas.getTextSize(text, font);
          return {
            text,
            ...size,
          };
        })
      : [];

    this.sizeScale.domain = marker.domain ? marker.domain : extent(this.sizeData, isContinuous) || [1, 1];
    if (xAxis.scale instanceof ContinuousScale) {
      this.xDomain = this.fixNumericExtent(extent(this.xData, isContinuous), 'x');
    } else {
      this.xDomain = this.xData;
    }
    if (yAxis.scale instanceof ContinuousScale) {
      this.yDomain = this.fixNumericExtent(extent(this.yData, isContinuous), 'y');
    } else {
      this.yDomain = this.yData;
    }

    return true;
  }

  getDomain(direction: ChartAxisDirection): any[] {
    if (direction === ChartAxisDirection.X) {
      return this.xDomain;
    } else {
      return this.yDomain;
    }
  }

  getNodeData(): readonly ScatterNodeDatum[] {
    return this.nodeData;
  }

  getLabelData(): readonly PointLabelDatum[] {
    return this.nodeData;
  }

  fireNodeClickEvent(event: MouseEvent, datum: ScatterNodeDatum): void {
    this.fireEvent<ScatterSeriesNodeClickEvent>({
      type: 'nodeClick',
      event,
      series: this,
      datum: datum.datum,
      xKey: this.xKey,
      yKey: this.yKey,
      sizeKey: this.sizeKey,
    });
  }

  createNodeData(): ScatterNodeDatum[] {
    const { chart, data, visible, xAxis, yAxis } = this;

    if (!(chart && data && visible && xAxis && yAxis) || chart.layoutPending || chart.dataPending) {
      return [];
    }

    const xScale = xAxis.scale;
    const yScale = yAxis.scale;
    const isContinuousX = xScale instanceof ContinuousScale;
    const isContinuousY = yScale instanceof ContinuousScale;
    const xOffset = (xScale.bandwidth || 0) / 2;
    const yOffset = (yScale.bandwidth || 0) / 2;
    const { xData, yData, sizeData, sizeScale, marker } = this;
    const nodeData: ScatterNodeDatum[] = [];

    sizeScale.range = [marker.size, marker.maxSize];

    for (let i = 0; i < xData.length; i++) {
      const xy = this.checkDomainXY(xData[i], yData[i], isContinuousX, isContinuousY);

      if (!xy) {
        continue;
      }

      const x = xScale.convert(xy[0]) + xOffset;
      const y = yScale.convert(xy[1]) + yOffset;

      if (!this.checkRangeXY(x, y, xAxis, yAxis)) {
        continue;
      }

      nodeData.push({
        series: this,
        datum: data[i],
        point: { x, y },
        size: sizeData.length ? sizeScale.convert(sizeData[i]) : marker.size,
        label: this.labelData[i],
      });
    }

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
    this.updateMarkerSelection();
    this.updateLabelSelection();
  }

  private updateNodes() {
    this.group.visible = this.visible;
    this.updateMarkerNodes();
    this.updateLabelNodes();
  }

  private updateLabelSelection(): void {
    const placedLabels: PlacedLabel[] = (this.chart && this.chart.placeLabels().get(this)) || [];
    const updateLabels = this.labelSelection.setData(placedLabels);
    updateLabels.exit.remove();
    const enterLabels = updateLabels.enter.append(Text);
    this.labelSelection = updateLabels.merge(enterLabels);
  }

  private updateMarkerSelection(): void {
    const MarkerShape = getMarker(this.marker.shape);
    const updateMarkers = this.markerSelection.setData(this.nodeData);
    updateMarkers.exit.remove();
    const enterMarkers = updateMarkers.enter.append(MarkerShape);
    this.markerSelection = updateMarkers.merge(enterMarkers);
  }

  private updateLabelNodes() {
    const { label } = this;
    this.labelSelection.each((text, datum) => {
      text.text = datum.text;
      text.fill = label.color;
      text.x = datum.x;
      text.y = datum.y;
      text.fontStyle = label.fontStyle;
      text.fontWeight = label.fontWeight;
      text.fontSize = label.fontSize;
      text.fontFamily = label.fontFamily;
      text.textAlign = 'left';
      text.textBaseline = 'top';
    });
  }

  private updateMarkerNodes(): void {
    if (!this.chart) {
      return;
    }

    const {
      marker,
      xKey,
      yKey,
      chart: { highlightedDatum },
      highlightStyle: {
        item: { fill: highlightedFill, stroke: highlightedStroke, strokeWidth: highlightedDatumStrokeWidth },
      },
    } = this;
    const { formatter } = marker;

    this.markerSelection.each((node, datum, index) => {
      const isDatumHighlighted = datum === highlightedDatum;
      const fill = isDatumHighlighted && highlightedFill !== undefined ? highlightedFill : marker.fill;
      const stroke = isDatumHighlighted && highlightedStroke !== undefined ? highlightedStroke : marker.stroke;
      const strokeWidth =
        isDatumHighlighted && highlightedDatumStrokeWidth !== undefined
          ? highlightedDatumStrokeWidth
          : this.getStrokeWidth(marker.strokeWidth !== undefined ? marker.strokeWidth : 1, datum);

      let format: CartesianSeriesMarkerFormat | undefined = undefined;
      if (formatter) {
        format = formatter({
          datum: datum.datum,
          xKey,
          yKey,
          fill,
          stroke,
          strokeWidth,
          size: datum.size,
          highlighted: isDatumHighlighted,
        });
      }

      node.fill = (format && format.fill) || fill;
      node.stroke = (format && format.stroke) || stroke;
      node.strokeWidth = format && format.strokeWidth !== undefined ? format.strokeWidth : strokeWidth;
      node.size = format && format.size !== undefined ? format.size : datum.size;
      node.fillOpacity = marker.fillOpacity !== undefined ? marker.fillOpacity : 1;
      node.strokeOpacity = marker.strokeOpacity !== undefined ? marker.strokeOpacity : 1;
      node.translationX = datum.point.x;
      node.translationY = datum.point.y;
      node.opacity = this.getOpacity(datum);
      node.zIndex = isDatumHighlighted ? Series.highlightedZIndex : index;
      node.visible = marker.enabled && node.size > 0;
    });
  }

  getTooltipHtml(nodeDatum: ScatterNodeDatum): string {
    const { xKey, yKey, xAxis, yAxis } = this;

    if (!xKey || !yKey || !xAxis || !yAxis) {
      return '';
    }

    const { tooltip, xName, yName, sizeKey, sizeName, labelKey, labelName } = this;

    const { renderer: tooltipRenderer } = tooltip;
    const color = this.marker.fill || 'gray';
    const title = this.title || yName;
    const datum = nodeDatum.datum;
    const xValue = datum[xKey];
    const yValue = datum[yKey];
    const xString = sanitizeHtml(xAxis.formatDatum(xValue));
    const yString = sanitizeHtml(yAxis.formatDatum(yValue));

    let content =
      `<b>${sanitizeHtml(xName || xKey)}</b>: ${xString}<br>` + `<b>${sanitizeHtml(yName || yKey)}</b>: ${yString}`;

    if (sizeKey) {
      content += `<br><b>${sanitizeHtml(sizeName || sizeKey)}</b>: ${sanitizeHtml(datum[sizeKey])}`;
    }

    if (labelKey) {
      content = `<b>${sanitizeHtml(labelName || labelKey)}</b>: ${sanitizeHtml(datum[labelKey])}<br>` + content;
    }

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
          yName,
          sizeKey,
          sizeName,
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
    const { id, data, xKey, yKey, yName, title, visible, marker } = this;

    if (data && data.length && xKey && yKey) {
      legendData.push({
        id,
        itemId: undefined,
        enabled: visible,
        label: {
          text: title || yName || yKey,
        },
        marker: {
          shape: marker.shape,
          fill: marker.fill || 'rgba(0, 0, 0, 0)',
          stroke: marker.stroke || 'rgba(0, 0, 0, 0)',
          fillOpacity: marker.fillOpacity !== undefined ? marker.fillOpacity : 1,
          strokeOpacity: marker.strokeOpacity !== undefined ? marker.strokeOpacity : 1,
        },
      });
    }
  }
}
