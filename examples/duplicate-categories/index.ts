import { CategoryAxis } from '../../lib/chart/axis/categoryAxis';
import { NumberAxis } from '../../lib/chart/axis/numberAxis';
import { CartesianChart } from '../../lib/chart/cartesianChart';
import { LineSeries } from '../../lib/chart/series/cartesian/lineSeries';
import { BarSeries } from '../../lib/chart/series/cartesian/barSeries';

type CategoryDatum = {
  country: { toString: () => string };
  value: number;
  other: number;
};

const data: CategoryDatum[] = [
  { country: { toString: () => 'France' }, value: 3, other: 2 },
  { country: { toString: () => 'Italy' }, value: 7, other: 3 },
  { country: { toString: () => 'France' }, value: 6, other: 2 },
  { country: { toString: () => 'Italy' }, value: 4, other: 5 },
  { country: { toString: () => 'Italy' }, value: 8, other: 3 },
];

function createCategoryLineChart() {
  const xAxis = new CategoryAxis();
  const yAxis = new NumberAxis();

  const chart = new CartesianChart();
  chart.axes = [xAxis, yAxis];
  chart.container = document.body;
  chart.width = 800;
  chart.height = 500;

  const lineSeries = new LineSeries();
  lineSeries.strokeWidth = 4;
  lineSeries.data = data;
  lineSeries.xKey = 'country';
  lineSeries.yKey = 'value';
  lineSeries.tooltip.enabled = true;
  lineSeries.title = 'Countries';

  chart.series = [lineSeries as any];
}

function createBarChart() {
  const xAxis = new CategoryAxis();
  const yAxis = new NumberAxis();

  const chart = new CartesianChart();
  chart.container = document.body;
  chart.width = 800;
  chart.height = 500;
  chart.axes = [xAxis, yAxis];

  const lineSeries = new BarSeries();
  lineSeries.strokeWidth = 4;
  lineSeries.data = data;
  lineSeries.xKey = 'country';
  lineSeries.yKeys = [['value', 'other']];
  lineSeries.yNames = {
    value: 'Countries',
    other: 'Whatever',
  };
  lineSeries.tooltip.enabled = true;

  chart.series = [lineSeries as any];
}

document.addEventListener('DOMContentLoaded', () => {
  createCategoryLineChart();
  createBarChart();
});
