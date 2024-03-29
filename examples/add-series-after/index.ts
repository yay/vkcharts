import { ChartAxisPosition } from '../../lib/chart/chartAxis';
import { CategoryAxis } from '../../lib/chart/axis/categoryAxis';
import { NumberAxis } from '../../lib/chart/axis/numberAxis';
import { CartesianChart } from '../../lib/chart/cartesianChart';
import { AreaSeries } from '../../lib/chart/series/cartesian/areaSeries';
import { createButton } from '../../utils/ui';
import { makeChartResizeable } from '../../utils/chart';

const data = [
  { label: 'L1', v1: 1, v2: 2, v3: 5, v4: 4, v5: 5 },
  { label: 'L2', v1: 1, v2: 2, v3: 5, v4: 4, v5: 5 },
  { label: 'L3', v1: 1, v2: 2, v3: 5, v4: 4, v5: 5 },
];

document.addEventListener('DOMContentLoaded', () => {
  const xAxis = new CategoryAxis();
  xAxis.position = ChartAxisPosition.Bottom;
  const yAxis = new NumberAxis();
  yAxis.position = ChartAxisPosition.Left;

  const chart = new CartesianChart();
  chart.width = 800;
  chart.height = 600;
  chart.container = document.body;
  chart.axes = [xAxis, yAxis];

  const series1 = new AreaSeries();
  series1.xKey = 'label';
  series1.yKeys = ['v1', 'v2'];
  series1.data = data;
  series1.fills = ['red', 'green'];
  series1.fillOpacity = 0.3;
  series1.strokes = ['black'];

  const series2 = new AreaSeries();
  series2.xKey = 'label';
  series2.yKeys = ['v3'];
  series2.data = data;
  series2.fills = ['blue'];
  series2.fillOpacity = 0.3;
  series2.strokes = ['black'];

  const series3 = new AreaSeries();
  series3.xKey = 'label';
  series3.yKeys = ['v4', 'v5'];
  series3.data = data;
  series3.fills = ['yellow', 'magenta'];
  series3.fillOpacity = 0.3;
  series3.strokes = ['black'];

  chart.series = [series1, series2];

  document.body.appendChild(document.createElement('br'));

  createButton('add stacked `series3` (v4, v5) after stacked `series1` (v1, v2)', () => {
    chart.addSeriesAfter(series3, series1);
  });

  createButton('add stacked `series3` (v4, v5) after `series2` (v3)', () => {
    chart.addSeriesAfter(series3, series2);
  });

  makeChartResizeable(chart);
});
