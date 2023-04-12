import { Observable } from '../util/observable';

export class DropShadow extends Observable {
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

  private _color: string = 'rgba(0, 0, 0, 0.5)';
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

  private _xOffset: number = 0;
  set xOffset(value: number) {
    const oldValue = this._xOffset;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._xOffset = value;
      this.notifyPropertyListeners('xOffset', oldValue, value);
      this.notifyEventListeners(['change']);
    }
  }
  get xOffset(): number {
    return this._xOffset;
  }

  private _yOffset: number = 0;
  set yOffset(value: number) {
    const oldValue = this._yOffset;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._yOffset = value;
      this.notifyPropertyListeners('yOffset', oldValue, value);
      this.notifyEventListeners(['change']);
    }
  }
  get yOffset(): number {
    return this._yOffset;
  }

  private _blur: number = 5;
  set blur(value: number) {
    const oldValue = this._blur;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._blur = value;
      this.notifyPropertyListeners('blur', oldValue, value);
      this.notifyEventListeners(['change']);
    }
  }
  get blur(): number {
    return this._blur;
  }
}
