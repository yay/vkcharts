import { HierarchyChart } from '../../hierarchyChart';
import { Series } from '../series';

export abstract class HierarchySeries extends Series {
  chart?: HierarchyChart = undefined;

  protected _data: any = undefined;
  set data(value: any) {
    const oldValue = this._data;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._data = value;
      this.notifyPropertyListeners('data', oldValue, value);
      this.notifyEventListeners(['dataChange']);
    }
  }
  get data(): any {
    return this._data;
  }
}
