import { reactive } from '../../../util/observable';
import type { HierarchyChart } from '../../hierarchyChart';
import { Series } from '../series';

export abstract class HierarchySeries extends Series {
  chart?: HierarchyChart = undefined;

  @reactive('dataChange') data: any = undefined;
}
