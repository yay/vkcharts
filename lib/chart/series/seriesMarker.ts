import { Marker } from '../marker/marker';
import { Observable } from '../../util/observable';
import { Circle } from '../marker/circle';

export class SeriesMarker extends Observable {
  private _enabled: any = true;
  set enabled(value: any) {
    const oldValue = this._enabled;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._enabled = value;
      this.notifyPropertyListeners('enabled', oldValue, value);
      this.notifyEventListeners(['change']);
    }
  }
  get enabled(): any {
    return this._enabled;
  }

  /**
   * One of the predefined marker names, or a marker constructor function (for user-defined markers).
   * A series will create one marker instance per data point.
   */
  private _shape: string | (new () => Marker) = Circle;
  set shape(value: string | (new () => Marker)) {
    const oldValue = this._shape;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._shape = value;
      this.notifyPropertyListeners('shape', oldValue, value);
      this.notifyEventListeners(['change']);
    }
  }
  get shape(): string | (new () => Marker) {
    return this._shape;
  }

  private _size: number = 6;
  set size(value: number) {
    const oldValue = this._size;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._size = value;
      this.notifyPropertyListeners('size', oldValue, value);
      this.notifyEventListeners(['change']);
    }
  }
  get size(): number {
    return this._size;
  }

  /**
   * In case a series has the `sizeKey` set, the `sizeKey` values along with the `size` and `maxSize` configs
   * will be used to determine the size of the marker. All values will be mapped to a marker size
   * within the `[size, maxSize]` range, where the largest values will correspond to the `maxSize`
   * and the lowest to the `size`.
   */
  private _maxSize: number = 30;
  set maxSize(value: number) {
    const oldValue = this._maxSize;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._maxSize = value;
      this.notifyPropertyListeners('maxSize', oldValue, value);
      this.notifyEventListeners(['change']);
    }
  }
  get maxSize(): number {
    return this._maxSize;
  }

  private _domain: [number, number] | undefined;
  set domain(value: [number, number] | undefined) {
    const oldValue = this._domain;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._domain = value;
      this.notifyPropertyListeners('domain', oldValue, value);
      this.notifyEventListeners(['change']);
    }
  }
  get domain(): [number, number] | undefined {
    return this._domain;
  }

  private _fill: string | undefined;
  set fill(value: string | undefined) {
    const oldValue = this._fill;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._fill = value;
      this.notifyPropertyListeners('fill', oldValue, value);
      this.notifyEventListeners(['change']);
    }
  }
  get fill(): string | undefined {
    return this._fill;
  }

  private _stroke: string | undefined;
  set stroke(value: string | undefined) {
    const oldValue = this._stroke;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._stroke = value;
      this.notifyPropertyListeners('stroke', oldValue, value);
      this.notifyEventListeners(['change']);
    }
  }
  get stroke(): string | undefined {
    return this._stroke;
  }

  private _strokeWidth: number | undefined = 1;
  set strokeWidth(value: number | undefined) {
    const oldValue = this._strokeWidth;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._strokeWidth = value;
      this.notifyPropertyListeners('strokeWidth', oldValue, value);
      this.notifyEventListeners(['change']);
    }
  }
  get strokeWidth(): number | undefined {
    return this._strokeWidth;
  }

  private _fillOpacity: number | undefined;
  set fillOpacity(value: number | undefined) {
    const oldValue = this._fillOpacity;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._fillOpacity = value;
      this.notifyPropertyListeners('fillOpacity', oldValue, value);
      this.notifyEventListeners(['change']);
    }
  }
  get fillOpacity(): number | undefined {
    return this._fillOpacity;
  }

  private _strokeOpacity: number | undefined;
  set strokeOpacity(value: number | undefined) {
    const oldValue = this._strokeOpacity;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._strokeOpacity = value;
      this.notifyPropertyListeners('strokeOpacity', oldValue, value);
      this.notifyEventListeners(['change']);
    }
  }
  get strokeOpacity(): number | undefined {
    return this._strokeOpacity;
  }
}

export interface SeriesMarkerFormatterParams {
  datum: any;
  fill?: string;
  stroke?: string;
  strokeWidth: number;
  size: number;
  highlighted: boolean;
}
