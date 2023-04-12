import { Selection } from '../../../scene/selection';
import { HdpiCanvas } from '../../../canvas/hdpiCanvas';
import { type TypedEvent } from '../../../util/observable';
import { Label } from '../../label';
import { type SeriesNodeDatum, SeriesTooltip, type TooltipRendererParams } from '../series';
import { HierarchySeries } from './hierarchySeries';
import { type TooltipRendererResult, toTooltipHtml } from '../../chart';
import { Group } from '../../../scene/group';
import { Text } from '../../../scene/shape/text';
import { Rect } from '../../../scene/shape/rect';
import { DropShadow } from '../../../scene/dropShadow';
import { LinearScale } from '../../../scale/linearScale';
import { ChartAxisDirection } from '../../chartAxis';
import { type LegendDatum } from '../../legend';
import { Treemap } from '../../../layout/treemap';
import { hierarchy } from '../../../layout/hierarchy';
import { toFixed } from '../../../util/number';

interface TreemapNodeDatum extends SeriesNodeDatum {
  parent?: TreemapNodeDatum;
  children?: TreemapNodeDatum[];
  value: number;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  depth: number;

  series: TreemapSeries;
  fill: string;
  label: string;
  hasTitle: boolean;
  colorValue: number;
}

export interface TreemapTooltipRendererParams extends TooltipRendererParams {
  datum: TreemapNodeDatum;
  labelKey: string;
  sizeKey?: string;
  colorKey?: string;
}

export class TreemapSeriesTooltip extends SeriesTooltip {
  private _renderer: ((params: TreemapTooltipRendererParams) => string | TooltipRendererResult) | undefined;
  set renderer(value: ((params: TreemapTooltipRendererParams) => string | TooltipRendererResult) | undefined) {
    const oldValue = this._renderer;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._renderer = value;
      this.notifyPropertyListeners('renderer', oldValue, value);
      this.notifyEventListeners(['change']);
    }
  }
  get renderer(): ((params: TreemapTooltipRendererParams) => string | TooltipRendererResult) | undefined {
    return this._renderer;
  }
}

export interface TreemapSeriesNodeClickEvent extends TypedEvent {
  readonly type: 'nodeClick';
  readonly event: MouseEvent;
  readonly series: TreemapSeries;
  readonly datum: any;
  readonly labelKey: string;
  readonly sizeKey?: string;
  readonly colorKey?: string;
}

export class TreemapSeriesLabel extends Label {
  private _padding: number = 10;
  set padding(value: number) {
    const oldValue = this._padding;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._padding = value;
      this.notifyPropertyListeners('padding', oldValue, value);
      this.notifyEventListeners(['change']);
    }
  }
  get padding(): number {
    return this._padding;
  }
}

enum TextNodeTag {
  Name,
  Value,
}

export class TreemapSeries extends HierarchySeries {
  static className = 'TreemapSeries';
  static type = 'treemap';

  private groupSelection: Selection<Group, Group, TreemapNodeDatum, any> = Selection.select(
    this.pickGroup
  ).selectAll<Group>();

  private labelMap = new Map<number, Text>();
  private layout = new Treemap();
  private dataRoot?: TreemapNodeDatum;

  constructor() {
    super();

    this.shadow.addEventListener('change', this.scheduleUpdate, this);
    this.title.addEventListener('change', this.scheduleUpdate, this);
    this.subtitle.addEventListener('change', this.scheduleUpdate, this);
    this.labels.small.addEventListener('change', this.scheduleUpdate, this);
    this.labels.medium.addEventListener('change', this.scheduleUpdate, this);
    this.labels.large.addEventListener('change', this.scheduleUpdate, this);
    this.labels.color.addEventListener('change', this.scheduleUpdate, this);
  }

  readonly title: TreemapSeriesLabel = (() => {
    const label = new TreemapSeriesLabel();
    label.color = 'white';
    label.fontWeight = 'bold';
    label.fontSize = 12;
    label.fontFamily = 'Verdana, sans-serif';
    label.padding = 15;
    return label;
  })();

  readonly subtitle: TreemapSeriesLabel = (() => {
    const label = new TreemapSeriesLabel();
    label.color = 'white';
    label.fontSize = 9;
    label.fontFamily = 'Verdana, sans-serif';
    label.padding = 13;
    return label;
  })();

  readonly labels = {
    large: (() => {
      const label = new Label();
      label.color = 'white';
      label.fontWeight = 'bold';
      label.fontSize = 18;
      return label;
    })(),
    medium: (() => {
      const label = new Label();
      label.color = 'white';
      label.fontWeight = 'bold';
      label.fontSize = 14;
      return label;
    })(),
    small: (() => {
      const label = new Label();
      label.color = 'white';
      label.fontWeight = 'bold';
      label.fontSize = 10;
      return label;
    })(),
    color: (() => {
      const label = new Label();
      label.color = 'white';
      return label;
    })(),
  };

  protected _nodePadding = 2;
  set nodePadding(value: number) {
    if (this._nodePadding !== value) {
      this._nodePadding = value;
      this.updateLayoutPadding();
      this.update();
    }
  }
  get nodePadding(): number {
    return this._nodePadding;
  }

  private _labelKey: string = 'label';
  set labelKey(value: string) {
    const oldValue = this._labelKey;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._labelKey = value;
      this.notifyPropertyListeners('labelKey', oldValue, value);
      this.notifyEventListeners(['dataChange']);
    }
  }
  get labelKey(): string {
    return this._labelKey;
  }

  private _sizeKey: string | undefined = 'size';
  set sizeKey(value: string | undefined) {
    const oldValue = this._sizeKey;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._sizeKey = value;
      this.notifyPropertyListeners('sizeKey', oldValue, value);
      this.notifyEventListeners(['dataChange']);
    }
  }
  get sizeKey(): string | undefined {
    return this._sizeKey;
  }

  private _colorKey: string | undefined = 'color';
  set colorKey(value: string | undefined) {
    const oldValue = this._colorKey;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._colorKey = value;
      this.notifyPropertyListeners('colorKey', oldValue, value);
      this.notifyEventListeners(['dataChange']);
    }
  }
  get colorKey(): string | undefined {
    return this._colorKey;
  }

  private _colorDomain: number[] = [-5, 5];
  set colorDomain(value: number[]) {
    const oldValue = this._colorDomain;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._colorDomain = value;
      this.notifyPropertyListeners('colorDomain', oldValue, value);
      this.notifyEventListeners(['dataChange']);
    }
  }
  get colorDomain(): number[] {
    return this._colorDomain;
  }

  private _colorRange: string[] = ['#cb4b3f', '#6acb64'];
  set colorRange(value: string[]) {
    const oldValue = this._colorRange;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._colorRange = value;
      this.notifyPropertyListeners('colorRange', oldValue, value);
      this.notifyEventListeners(['dataChange']);
    }
  }
  get colorRange(): string[] {
    return this._colorRange;
  }

  private _colorParents: boolean = false;
  set colorParents(value: boolean) {
    const oldValue = this._colorParents;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._colorParents = value;
      this.notifyPropertyListeners('colorParents', oldValue, value);
      this.notifyEventListeners(['dataChange']);
    }
  }
  get colorParents(): boolean {
    return this._colorParents;
  }

  private _gradient: boolean = true;
  set gradient(value: boolean) {
    const oldValue = this._gradient;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._gradient = value;
      this.notifyPropertyListeners('gradient', oldValue, value);
      this.notifyEventListeners(['update']);
    }
  }
  get gradient(): boolean {
    return this._gradient;
  }

  colorName: string = 'Change';
  rootName: string = 'Root';

  protected _shadow: DropShadow = (() => {
    const shadow = new DropShadow();
    shadow.color = 'rgba(0, 0, 0, 0.4)';
    shadow.xOffset = 1.5;
    shadow.yOffset = 1.5;
    return shadow;
  })();
  set shadow(value: DropShadow) {
    if (this._shadow !== value) {
      this._shadow = value;
      this.update();
    }
  }
  get shadow(): DropShadow {
    return this._shadow;
  }

  readonly tooltip = new TreemapSeriesTooltip();

  onHighlightChange() {
    this.updateNodes();
  }

  private updateLayoutPadding() {
    const { title, subtitle, nodePadding, labelKey } = this;

    this.layout.paddingRight = () => nodePadding;
    this.layout.paddingBottom = () => nodePadding;
    this.layout.paddingLeft = () => nodePadding;
    this.layout.paddingTop = (node: TreemapNodeDatum) => {
      let name = node.datum[labelKey] || '';
      if (node.children) {
        name = name.toUpperCase();
      }
      const font = node.depth > 1 ? subtitle : title;
      const textSize = HdpiCanvas.getTextSize(
        name,
        [font.fontWeight, font.fontSize + 'px', font.fontFamily].join(' ').trim()
      );
      const innerNodeWidth = node.x1 - node.x0 - nodePadding * 2;
      const hasTitle = node.depth > 0 && node.children && textSize.width <= innerNodeWidth;
      node.hasTitle = !!hasTitle;

      return hasTitle ? textSize.height + nodePadding * 2 : nodePadding;
    };
  }

  processData(): boolean {
    if (!this.data) {
      return false;
    }

    const { data, sizeKey, labelKey, colorKey, colorDomain, colorRange, colorParents } = this;

    let dataRoot: unknown;
    if (sizeKey) {
      dataRoot = hierarchy(data).sum((datum) => (datum.children ? 1 : datum[sizeKey]));
    } else {
      dataRoot = hierarchy(data).sum((datum) => (datum.children ? 0 : 1));
    }
    this.dataRoot = dataRoot as TreemapNodeDatum;

    const colorScale = new LinearScale();
    colorScale.domain = colorDomain;
    colorScale.range = colorRange;

    const series = this;
    function traverse(root: TreemapNodeDatum, depth = 0) {
      const { children, datum } = root;
      const label = datum[labelKey];
      const colorValue = colorKey ? datum[colorKey] : depth;

      root.series = series;
      root.fill = !children || colorParents ? colorScale.convert(colorValue) : '#272931';
      root.colorValue = colorValue;

      if (label) {
        root.label = children ? label.toUpperCase() : label;
      } else {
        root.label = '';
      }

      if (children) {
        children.forEach((child: any) => traverse(child, depth + 1));
      }
    }
    traverse(this.dataRoot);

    return true;
  }

  protected getLabelCenterX(datum: any): number {
    return (datum.x0 + datum.x1) / 2;
  }

  protected getLabelCenterY(datum: any): number {
    return (datum.y0 + datum.y1) / 2 + 2;
  }

  update(): void {
    this.updatePending = false;

    this.updateSelections();
    this.updateNodes();
  }

  updateSelections() {
    if (!this.nodeDataPending) {
      return;
    }
    this.nodeDataPending = false;

    const { chart, dataRoot } = this;

    if (!chart || !dataRoot) {
      return;
    }

    const seriesRect = chart.getSeriesRect();

    if (!seriesRect) {
      return;
    }

    this.layout.size = [seriesRect.width, seriesRect.height];
    this.updateLayoutPadding();

    const descendants = this.layout.processData(dataRoot).descendants();

    const updateGroups = this.groupSelection.setData(descendants);
    updateGroups.exit.remove();

    const enterGroups = updateGroups.enter.append(Group);
    enterGroups.append(Rect);
    enterGroups.append(Text).each((node: any) => (node.tag = TextNodeTag.Name));
    enterGroups.append(Text).each((node: any) => (node.tag = TextNodeTag.Value));

    this.groupSelection = updateGroups.merge(enterGroups) as any;
  }

  updateNodes() {
    if (!this.chart) {
      return;
    }

    const {
      colorKey,
      labelMap,
      nodePadding,
      title,
      subtitle,
      labels,
      shadow,
      gradient,
      chart: { highlightedDatum },
      highlightStyle: {
        item: { fill: highlightedFill, stroke: highlightedStroke, strokeWidth: highlightedDatumStrokeWidth },
      },
    } = this;

    this.groupSelection.selectByClass(Rect).each((rect, datum) => {
      const isDatumHighlighted = datum === highlightedDatum;
      const fill = isDatumHighlighted && highlightedFill !== undefined ? highlightedFill : datum.fill;
      const stroke =
        isDatumHighlighted && highlightedStroke !== undefined
          ? highlightedStroke
          : datum.depth < 2
          ? undefined
          : 'black';
      const strokeWidth =
        isDatumHighlighted && highlightedDatumStrokeWidth !== undefined
          ? highlightedDatumStrokeWidth
          : this.getStrokeWidth(1, datum);

      rect.fill = fill;
      rect.stroke = stroke;
      rect.strokeWidth = strokeWidth;
      rect.crisp = true;
      rect.gradient = gradient;

      rect.x = datum.x0;
      rect.y = datum.y0;
      rect.width = datum.x1 - datum.x0;
      rect.height = datum.y1 - datum.y0;
    });

    this.groupSelection.selectByTag<Text>(TextNodeTag.Name).each((text, datum, index) => {
      const isLeaf = !datum.children;
      const innerNodeWidth = datum.x1 - datum.x0 - nodePadding * 2;
      const innerNodeHeight = datum.y1 - datum.y0 - nodePadding * 2;
      const hasTitle = datum.hasTitle;
      const highlighted = datum === highlightedDatum;

      let label;
      if (isLeaf) {
        if (innerNodeWidth > 40 && innerNodeHeight > 40) {
          label = labels.large;
        } else if (innerNodeWidth > 20 && innerNodeHeight > 20) {
          label = labels.medium;
        } else {
          label = labels.small;
        }
      } else {
        if (datum.depth > 1) {
          label = subtitle;
        } else {
          label = title;
        }
      }

      text.fontWeight = label.fontWeight;
      text.fontSize = label.fontSize;
      text.fontFamily = label.fontFamily;
      text.textBaseline = isLeaf ? 'bottom' : hasTitle ? 'top' : 'middle';
      text.textAlign = hasTitle ? 'left' : 'center';
      text.text = datum.label;

      const textBBox = text.computeBBox();

      const hasLabel =
        isLeaf && !!textBBox && textBBox.width <= innerNodeWidth && textBBox.height * 2 + 8 <= innerNodeHeight;

      labelMap.set(index, text);

      text.fill = highlighted ? 'black' : label.color;
      text.fillShadow = hasLabel && !highlighted ? shadow : undefined;
      text.visible = hasTitle || hasLabel;

      if (hasTitle) {
        text.x = datum.x0 + nodePadding;
        text.y = datum.y0 + nodePadding;
      } else {
        text.x = this.getLabelCenterX(datum);
        text.y = this.getLabelCenterY(datum);
      }
    });

    this.groupSelection.selectByTag<Text>(TextNodeTag.Value).each((text, datum, index) => {
      const isLeaf = !datum.children;
      const innerNodeWidth = datum.x1 - datum.x0 - nodePadding * 2;
      const highlighted = datum === highlightedDatum;
      const value = datum.colorValue;
      const label = labels.color;

      text.fontSize = label.fontSize;
      text.fontFamily = label.fontFamily;
      text.fontStyle = label.fontStyle;
      text.fontWeight = label.fontWeight;
      text.textBaseline = 'top';
      text.textAlign = 'center';
      text.text = typeof value === 'number' && isFinite(value) ? String(toFixed(datum.colorValue)) + '%' : '';

      const textBBox = text.computeBBox();
      const nameNode = labelMap.get(index);
      const hasLabel = !!nameNode && nameNode.visible;
      const isVisible = isLeaf && !!colorKey && hasLabel && !!textBBox && textBBox.width < innerNodeWidth;

      text.fill = highlighted ? 'black' : label.color;
      text.fillShadow = highlighted ? undefined : shadow;

      text.visible = isVisible;
      if (isVisible) {
        text.x = this.getLabelCenterX(datum);
        text.y = this.getLabelCenterY(datum);
      } else {
        if (nameNode && !(datum.children && datum.children.length)) {
          nameNode.textBaseline = 'middle';
          nameNode.y = this.getLabelCenterY(datum);
        }
      }
    });
  }

  getDomain(_direction: ChartAxisDirection): any[] {
    return [0, 1];
  }

  fireNodeClickEvent(event: MouseEvent, datum: TreemapNodeDatum): void {
    this.fireEvent<TreemapSeriesNodeClickEvent>({
      type: 'nodeClick',
      event,
      series: this,
      datum: datum.datum,
      labelKey: this.labelKey,
      sizeKey: this.sizeKey,
      colorKey: this.colorKey,
    });
  }

  getTooltipHtml(nodeDatum: TreemapNodeDatum): string {
    const { tooltip, sizeKey, labelKey, colorKey, colorName, rootName } = this;
    const { datum } = nodeDatum;
    const { renderer: tooltipRenderer } = tooltip;

    const title: string | undefined = nodeDatum.depth ? datum[labelKey] : rootName || datum[labelKey];
    let content: string | undefined = undefined;
    const color = nodeDatum.fill || 'gray';

    if (colorKey && colorName) {
      const colorValue = datum[colorKey];
      if (typeof colorValue === 'number' && isFinite(colorValue)) {
        content = `<b>${colorName}</b>: ${toFixed(datum[colorKey])}`;
      }
    }

    const defaults: TooltipRendererResult = {
      title,
      backgroundColor: color,
      content,
    };

    if (tooltipRenderer) {
      return toTooltipHtml(
        tooltipRenderer({
          datum: nodeDatum,
          sizeKey,
          labelKey,
          colorKey,
          title,
          color,
        }),
        defaults
      );
    }

    return toTooltipHtml(defaults);
  }

  listSeriesItems(_legendData: LegendDatum[]): void {}
}
