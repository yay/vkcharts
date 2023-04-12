import { Group } from '../scene/group';
import { Selection } from '../scene/selection';
import { MarkerLabel } from './markerLabel';
import { BBox } from '../scene/bbox';
import { type FontStyle, type FontWeight } from '../scene/shape/text';
import { Marker } from './marker/marker';
import { Observable, type PropertyChangeEvent, type SourceEvent } from '../util/observable';
import { getMarker } from './marker/util';
import { createId } from '../util/id';

export interface LegendDatum {
  id: string; // component ID
  itemId: any; // sub-component ID
  enabled: boolean; // the current state of the sub-component
  marker: {
    shape?: string | (new () => Marker);
    fill: string;
    stroke: string;
    fillOpacity: number;
    strokeOpacity: number;
  };
  label: {
    text: string; // display name for the sub-component
  };
}

export interface LegendClickEvent extends SourceEvent<Legend> {
  event: MouseEvent;
  itemId: string;
  enabled: boolean;
}

export enum LegendOrientation {
  Vertical,
  Horizontal,
}

export enum LegendPosition {
  Top = 'top',
  Right = 'right',
  Bottom = 'bottom',
  Left = 'left',
}

interface LegendLabelFormatterParams {
  id: string;
  itemId: any;
  value: string;
}

export class LegendLabel extends Observable {
  private _color: string = 'black';
  set color(value: string) {
    const oldValue = this._color;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._color = value;
      this.notifyPropertyListeners('color', oldValue, value);
      this.notifyEventListeners(['change']);
    }
  }
  get color(): string {
    return this._color;
  }

  private _fontStyle: FontStyle | undefined;
  set fontStyle(value: FontStyle | undefined) {
    const oldValue = this._fontStyle;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._fontStyle = value;
      this.notifyPropertyListeners('fontStyle', oldValue, value);
      this.notifyEventListeners(['layoutChange']);
    }
  }
  get fontStyle(): FontStyle | undefined {
    return this._fontStyle;
  }

  private _fontWeight: FontWeight | undefined;
  set fontWeight(value: FontWeight | undefined) {
    const oldValue = this._fontWeight;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._fontWeight = value;
      this.notifyPropertyListeners('fontWeight', oldValue, value);
      this.notifyEventListeners(['layoutChange']);
    }
  }
  get fontWeight(): FontWeight | undefined {
    return this._fontWeight;
  }

  private _fontSize: number = 12;
  set fontSize(value: number) {
    const oldValue = this._fontSize;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._fontSize = value;
      this.notifyPropertyListeners('fontSize', oldValue, value);
      this.notifyEventListeners(['layoutChange']);
    }
  }
  get fontSize(): number {
    return this._fontSize;
  }

  private _fontFamily: string = 'Verdana, sans-serif';
  set fontFamily(value: string) {
    const oldValue = this._fontFamily;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._fontFamily = value;
      this.notifyPropertyListeners('fontFamily', oldValue, value);
      this.notifyEventListeners(['layoutChange']);
    }
  }
  get fontFamily(): string {
    return this._fontFamily;
  }

  private _formatter: ((params: LegendLabelFormatterParams) => string) | undefined;
  set formatter(value: ((params: LegendLabelFormatterParams) => string) | undefined) {
    const oldValue = this._formatter;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._formatter = value;
      this.notifyPropertyListeners('formatter', oldValue, value);
    }
  }
  get formatter(): ((params: LegendLabelFormatterParams) => string) | undefined {
    return this._formatter;
  }
}

export class LegendMarker extends Observable {
  private _size: number = 15;
  set size(value: number) {
    const oldValue = this._size;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._size = value;
      this.notifyPropertyListeners('size', oldValue, value);
      this.notifyEventListeners(['layoutChange']);
    }
  }
  get size(): number {
    return this._size;
  }

  /**
   * If the marker type is set, the legend will always use that marker type for all its items,
   * regardless of the type that comes from the `data`.
   */
  private _shape: (string | (new () => Marker)) | undefined;
  set shape(value: (string | (new () => Marker)) | undefined) {
    const oldValue = this._shape;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._shape = value;
      this.notifyPropertyListeners('shape', oldValue, value);
      this.notifyEventListeners(['layoutChange']);
    }
  }
  get shape(): (string | (new () => Marker)) | undefined {
    return this._shape;
  }

  /**
   * Padding between the marker and the label within each legend item.
   */
  private _padding: number = 8;
  set padding(value: number) {
    const oldValue = this._padding;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._padding = value;
      this.notifyPropertyListeners('padding', oldValue, value);
      this.notifyEventListeners(['layoutChange']);
    }
  }
  get padding(): number {
    return this._padding;
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

export class LegendItem extends Observable {
  readonly marker = new LegendMarker();
  readonly label = new LegendLabel();
  /**
   * The legend uses grid layout for its items, occupying as few columns as possible when positioned to left or right,
   * and as few rows as possible when positioned to top or bottom. This config specifies the amount of horizontal
   * padding between legend items.
   */
  private _paddingX: number = 16;
  set paddingX(value: number) {
    const oldValue = this._paddingX;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._paddingX = value;
      this.notifyPropertyListeners('paddingX', oldValue, value);
      this.notifyEventListeners(['layoutChange']);
    }
  }
  get paddingX(): number {
    return this._paddingX;
  }

  /**
   * The legend uses grid layout for its items, occupying as few columns as possible when positioned to left or right,
   * and as few rows as possible when positioned to top or bottom. This config specifies the amount of vertical
   * padding between legend items.
   */
  private _paddingY: number = 8;
  set paddingY(value: number) {
    const oldValue = this._paddingY;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._paddingY = value;
      this.notifyPropertyListeners('paddingY', oldValue, value);
      this.notifyEventListeners(['layoutChange']);
    }
  }
  get paddingY(): number {
    return this._paddingY;
  }

  constructor() {
    super();

    const changeListener = () => this.fireEvent({ type: 'change' });
    this.marker.addEventListener('change', changeListener);
    this.label.addEventListener('change', changeListener);

    const layoutChangeListener = () => this.fireEvent({ type: 'layoutChange' });
    this.marker.addEventListener('layoutChange', layoutChangeListener);
    this.label.addEventListener('layoutChange', layoutChangeListener);
  }
}

export class Legend extends Observable {
  static className = 'Legend';

  readonly id = createId(this);

  onLayoutChange?: () => void;

  readonly group: Group = new Group();

  private itemSelection: Selection<MarkerLabel, Group, any, any> = Selection.select(
    this.group
  ).selectAll<MarkerLabel>();

  private oldSize: [number, number] = [0, 0];

  readonly item = new LegendItem();

  private _data: LegendDatum[] = [];
  set data(value: LegendDatum[]) {
    const oldValue = this._data;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._data = value;
      this.notifyPropertyListeners('data', oldValue, value);
      this.notifyEventListeners(['layoutChange']);
    }
  }
  get data(): LegendDatum[] {
    return this._data;
  }

  private _enabled: boolean = true;
  set enabled(value: boolean) {
    const oldValue = this._enabled;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._enabled = value;
      this.notifyPropertyListeners('enabled', oldValue, value);
      this.notifyEventListeners(['layoutChange']);
    }
  }
  get enabled(): boolean {
    return this._enabled;
  }

  private _orientation: LegendOrientation = LegendOrientation.Vertical;
  set orientation(value: LegendOrientation) {
    const oldValue = this._orientation;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._orientation = value;
      this.notifyPropertyListeners('orientation', oldValue, value);
      this.notifyEventListeners(['layoutChange']);
    }
  }
  get orientation(): LegendOrientation {
    return this._orientation;
  }

  private _position: LegendPosition = LegendPosition.Right;
  set position(value: LegendPosition) {
    const oldValue = this._position;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._position = value;
      this.notifyPropertyListeners('position', oldValue, value);
      this.notifyEventListeners(['layoutChange']);
    }
  }
  get position(): LegendPosition {
    return this._position;
  }

  /**
   * Spacing between the legend and the edge of the chart's element.
   */
  private _spacing: number = 20;
  set spacing(value: number) {
    const oldValue = this._spacing;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._spacing = value;
      this.notifyPropertyListeners('spacing', oldValue, value);
      this.notifyEventListeners(['layoutChange']);
    }
  }
  get spacing(): number {
    return this._spacing;
  }

  constructor() {
    super();

    this.addPropertyListener('data', this.onDataChange);
    this.addPropertyListener('enabled', this.onEnabledChange);
    this.addPropertyListener('position', this.onPositionChange);
    this.item.marker.addPropertyListener('shape', this.onMarkerShapeChange, this);

    this.addEventListener('change', this.update);

    this.item.addEventListener('change', () => this.fireEvent({ type: 'change' }));
    this.item.addEventListener('layoutChange', () => this.fireEvent({ type: 'layoutChange' }));
  }

  private _size: [number, number] = [0, 0];
  get size(): Readonly<[number, number]> {
    return this._size;
  }

  protected onDataChange(event: PropertyChangeEvent<this, LegendDatum[]>) {
    this.group.visible = event.value.length > 0 && this.enabled;
  }

  protected onEnabledChange(event: PropertyChangeEvent<this, boolean>) {
    this.group.visible = event.value && this.data.length > 0;
  }

  protected onPositionChange(event: PropertyChangeEvent<this, LegendPosition>) {
    switch (event.value) {
      case 'right':
      case 'left':
        this.orientation = LegendOrientation.Vertical;
        break;
      case 'bottom':
      case 'top':
        this.orientation = LegendOrientation.Horizontal;
        break;
    }
  }

  protected onMarkerShapeChange() {
    this.itemSelection = this.itemSelection.setData([]);
    this.itemSelection.exit.remove();
    if (this.group.scene) {
      this.group.scene.dirty = false;
    }
  }

  /**
   * The method is given the desired size of the legend, which only serves as a hint.
   * The vertically oriented legend will take as much horizontal space as needed, but will
   * respect the height constraints, and the horizontal legend will take as much vertical
   * space as needed in an attempt not to exceed the given width.
   * After the layout is done, the {@link size} will contain the actual size of the legend.
   * If the actual size is not the same as the previous actual size, the legend will fire
   * the 'layoutChange' event to communicate that another layout is needed, and the above
   * process should be repeated.
   * @param width
   * @param height
   */
  performLayout(width: number, height: number) {
    const { item } = this;
    const { marker, paddingX, paddingY } = item;
    const updateSelection = this.itemSelection.setData(this.data, (_, datum) => {
      const MarkerShape = getMarker(marker.shape || datum.marker.shape);
      return datum.id + '-' + datum.itemId + '-' + MarkerShape.name;
    });
    updateSelection.exit.remove();

    const enterSelection = updateSelection.enter.append(MarkerLabel).each((node, datum) => {
      const MarkerShape = getMarker(marker.shape || datum.marker.shape);
      node.marker = new MarkerShape();
    });
    const itemSelection = (this.itemSelection = updateSelection.merge(enterSelection));
    const itemCount = itemSelection.size;

    // Update properties that affect the size of the legend items and measure them.
    const bboxes: BBox[] = [];
    const itemMarker = this.item.marker;
    const itemLabel = this.item.label;
    itemSelection.each((markerLabel, datum) => {
      // TODO: measure only when one of these properties or data change (in a separate routine)
      markerLabel.markerSize = itemMarker.size;
      markerLabel.spacing = itemMarker.padding;
      markerLabel.fontStyle = itemLabel.fontStyle;
      markerLabel.fontWeight = itemLabel.fontWeight;
      markerLabel.fontSize = itemLabel.fontSize;
      markerLabel.fontFamily = itemLabel.fontFamily;
      markerLabel.text = datum.label.text;

      bboxes.push(markerLabel.computeBBox());
    });

    const itemHeight = bboxes.length && bboxes[0].height;
    let rowCount = 0;

    let columnWidth = 0;
    let paddedItemsWidth = 0;
    let paddedItemsHeight = 0;

    width = Math.max(1, width);
    height = Math.max(1, height);

    switch (this.orientation) {
      case LegendOrientation.Horizontal:
        if (!(isFinite(width) && width > 0)) {
          return false;
        }

        rowCount = 0;
        let columnCount = 0;

        // Split legend items into columns until the width is suitable.
        do {
          let itemsWidth = 0;

          columnCount = 0;
          columnWidth = 0;
          rowCount++;

          let i = 0;
          while (i < itemCount) {
            const bbox = bboxes[i];
            if (bbox.width > columnWidth) {
              columnWidth = bbox.width;
            }
            i++;
            if (i % rowCount === 0) {
              itemsWidth += columnWidth;
              columnWidth = 0;
              columnCount++;
            }
          }
          if (i % rowCount !== 0) {
            itemsWidth += columnWidth;
            columnCount++;
          }
          paddedItemsWidth = itemsWidth + (columnCount - 1) * paddingX;
        } while (paddedItemsWidth > width && columnCount > 1);

        paddedItemsHeight = itemHeight * rowCount + (rowCount - 1) * paddingY;

        break;

      case LegendOrientation.Vertical:
        if (!(isFinite(height) && height > 0)) {
          return false;
        }

        rowCount = itemCount * 2;

        // Split legend items into columns until the height is suitable.
        do {
          rowCount = (rowCount >> 1) + (rowCount % 2);
          columnWidth = 0;

          let itemsWidth = 0;
          let itemsHeight = 0;
          let columnCount = 0;

          let i = 0;
          while (i < itemCount) {
            const bbox = bboxes[i];
            if (!columnCount) {
              itemsHeight += bbox.height;
            }
            if (bbox.width > columnWidth) {
              columnWidth = bbox.width;
            }
            i++;
            if (i % rowCount === 0) {
              itemsWidth += columnWidth;
              columnWidth = 0;
              columnCount++;
            }
          }
          if (i % rowCount !== 0) {
            itemsWidth += columnWidth;
            columnCount++;
          }
          paddedItemsWidth = itemsWidth + (columnCount - 1) * paddingX;
          paddedItemsHeight = itemsHeight + (rowCount - 1) * paddingY;
        } while (paddedItemsHeight > height && rowCount > 1);

        break;
    }

    // Top-left corner of the first legend item.
    const startX = (width - paddedItemsWidth) / 2;
    const startY = (height - paddedItemsHeight) / 2;

    let x = 0;
    let y = 0;
    columnWidth = 0;

    // Position legend items using the layout computed above.
    itemSelection.each((markerLabel, _datum, i) => {
      // Round off for pixel grid alignment to work properly.
      markerLabel.translationX = Math.floor(startX + x);
      markerLabel.translationY = Math.floor(startY + y);

      const bbox = bboxes[i];
      if (bbox.width > columnWidth) {
        columnWidth = bbox.width;
      }
      if ((i + 1) % rowCount === 0) {
        x += columnWidth + paddingX;
        y = 0;
        columnWidth = 0;
      } else {
        y += bbox.height + paddingY;
      }
    });

    // Update legend item properties that don't affect the layout.
    this.update();

    const size = this._size;
    const oldSize = this.oldSize;
    size[0] = paddedItemsWidth;
    size[1] = paddedItemsHeight;

    if (size[0] !== oldSize[0] || size[1] !== oldSize[1]) {
      oldSize[0] = size[0];
      oldSize[1] = size[1];
    }

    return undefined;
  }

  update() {
    this.itemSelection.each((markerLabel, datum) => {
      const marker = datum.marker;
      markerLabel.markerFill = marker.fill;
      markerLabel.markerStroke = marker.stroke;
      markerLabel.markerStrokeWidth = this.item.marker.strokeWidth;
      markerLabel.markerFillOpacity = marker.fillOpacity;
      markerLabel.markerStrokeOpacity = marker.strokeOpacity;
      markerLabel.opacity = datum.enabled ? 1 : 0.5;
      markerLabel.color = this.item.label.color;
    });
  }

  getDatumForPoint(x: number, y: number): LegendDatum | undefined {
    const node = this.group.pickNode(x, y);

    if (node && node.parent) {
      return node.parent.datum;
    }

    return undefined;
  }
}
