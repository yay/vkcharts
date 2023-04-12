import { type FontStyle, type FontWeight, getFont } from '../scene/shape/text';
import { Observable } from '../util/observable';

export class Label extends Observable {
  private _enabled: any = true;
  set enabled(value: any) {
    const oldValue = this._enabled;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._enabled = value;
      this.notifyPropertyListeners('enabled', oldValue, value);
      this.notifyEventListeners(['change', 'dataChange']);
    }
  }
  get enabled(): any {
    return this._enabled;
  }

  private _fontSize: number = 12;
  set fontSize(value: number) {
    const oldValue = this._fontSize;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._fontSize = value;
      this.notifyPropertyListeners('fontSize', oldValue, value);
      this.notifyEventListeners(['change']);
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
      this.notifyEventListeners(['change']);
    }
  }
  get fontFamily(): string {
    return this._fontFamily;
  }

  private _fontStyle: FontStyle | undefined;
  set fontStyle(value: FontStyle | undefined) {
    const oldValue = this._fontStyle;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._fontStyle = value;
      this.notifyPropertyListeners('fontStyle', oldValue, value);
      this.notifyEventListeners(['change']);
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
      this.notifyEventListeners(['change']);
    }
  }
  get fontWeight(): FontWeight | undefined {
    return this._fontWeight;
  }

  private _color: string = 'rgba(70, 70, 70, 1)';
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

  getFont(): string {
    return getFont(this.fontSize, this.fontFamily, this.fontStyle, this.fontWeight);
  }

  constructor() {
    super();
  }
}
