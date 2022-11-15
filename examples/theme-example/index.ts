import { ChartAxisPosition } from '../../lib/chart/chartAxis';
import { NumberAxis } from '../../lib/chart/axis/numberAxis';
import { CartesianChart } from '../../lib/chart/cartesianChart';
import { BarSeries } from '../../lib/chart/series/cartesian/barSeries';
import { makeChartResizeable } from '../../utils/chart';
import { GroupedCategoryAxis } from '../../lib/chart/axis/groupedCategoryAxis';
import { VkChart } from '../../lib/chart/vkChart';
import { createSlider } from '../../utils/ui';
import { type VkCartesianChartOptions, type VkChartOptions, type VkChartTheme } from '../../lib/chart/vkChartOptions';
import { type LineSeriesNodeClickEvent } from '../../lib/chart/series/cartesian/lineSeries';

const data = [
  { name: 'E', value: 0.12702 },
  { name: 'T', value: 0.09056 },
  { name: 'A', value: 0.08167 },
  { name: 'O', value: 0.07507 },
  { name: 'I', value: 0.06966 },
  { name: 'N', value: 0.06749 },
  { name: 'S', value: 0.06327 },
  { name: 'H', value: 0.06094 },
  { name: 'R', value: 0.05987 },
  { name: 'D', value: 0.04253 },
  { name: 'L', value: 0.04025 },
  { name: 'C', value: 0.02782 },
  { name: 'U', value: 0.02758 },
  { name: 'M', value: 0.02406 },
  { name: 'W', value: 0.0236 },
  { name: 'F', value: 0.02288 },
  { name: 'G', value: 0.02015 },
  { name: 'Y', value: 0.01974 },
  { name: 'P', value: 0.01929 },
  { name: 'B', value: 0.01492 },
  { name: 'V', value: 0.00978 },
  { name: 'K', value: 0.00772 },
  { name: 'J', value: 0.00153 },
  { name: 'X', value: 0.0015 },
  { name: 'Q', value: 0.00095 },
  { name: 'Z', value: 0.00074 },
].map((v: any) => {
  v.value2 = v.value * Math.random();
  v.value3 = v.value * Math.random();
  v.value4 = 0.1 + Math.random() * 0.1;
  v.value5 = 0.1 + Math.random() * 0.2;
  v.value6 = 0.2 + Math.random() * 0.2;
  v.value7 = 0.15 + Math.random() * 0.1;
  v.value8 = 0.1 + Math.random() * 0.1;
  return v;
});

const polarChartData = [
  { label: 'Android', value: 56.9, other: 7 },
  { label: 'iOS', value: 22.5, other: 8 },
  { label: 'BlackBerry', value: 6.8, other: 9 },
  { label: 'Symbian', value: 8.5, other: 10 },
  { label: 'Bada', value: 2.6, other: 11 },
  { label: 'Windows', value: 1.9, other: 12 },
];

const groupedCategoryData = [
  {
    category: {
      labels: ['Poppy Grady', 'Argentina'],
    },
    jan: 86135,
    feb: 178,
    mar: 55905,
  },
  {
    category: {
      labels: ['Layla Smith', 'Argentina'],
    },
    jan: 23219,
    feb: 11523,
    mar: 54291,
  },
  {
    category: {
      labels: ['Isabella Kingston', 'Belgium'],
    },
    jan: 66433,
    feb: 3655,
    mar: 52061,
  },
  {
    category: {
      labels: ['Mia Unalkat', 'Brazil'],
    },
    jan: 57544,
    feb: 39051,
    mar: 78481,
  },
  {
    category: {
      labels: ['Gil Lopes', 'Colombia'],
    },
    jan: 20479,
    feb: 2253,
    mar: 39309,
  },
  {
    category: {
      labels: ['Isabelle Donovan', 'Colombia'],
    },
    jan: 73957,
    feb: 25775,
    mar: 56291,
  },
].map((d) => {
  d.category.toString = function () {
    return this.labels.slice().reverse().join(' - ');
  };
  return d;
});

const themes: (string | VkChartTheme)[] = [
  {
    baseTheme: 'vk-pastel',
    palette: {
      fills: ['#5C2983', '#0076C5', '#21B372', '#FDDE02', '#F76700', '#D30018'],
      strokes: ['black'],
    },
    defaults: {
      common: {
        title: {},
      },
      cartesian: {
        title: {
          text: 'Get Your Pot Of Gold Theme',
        },
        series: {
          line: {
            marker: {
              size: 16,
            },
          },
        },
      },
    },
  } as VkChartTheme,
  'vk-material',
  'vk-pastel',
  'vk-solar',
  'vk-vivid',
  'vk-default',
  'vk-default-dark',
  'vk-material-dark',
  'vk-pastel-dark',
  'vk-solar-dark',
  'vk-vivid-dark',
];

function createColumnChart() {
  const div = document.createElement('div');
  document.body.appendChild(div);

  const options: VkChartOptions = {
    type: 'line',
    autoSize: false,
    tooltip: {
      enabled: true,
      tracking: false,
    },
    data,
    theme: {
      // baseTheme: 'ag-default-dark',
      palette: {
        fills: ['#5C2983', '#0076C5', '#21B372', '#FDDE02', '#F76700', '#D30018'],
        strokes: ['black'],
      },
      overrides: {
        common: {
          title: {
            enabled: true,
            text: 'LOL',
          },
        },
        cartesian: {
          // title: {
          //     text: 'Get Your Pot Of Gold Theme'
          // },
          series: {
            scatter: {
              marker: {
                size: 16,
              },
            },
          },
          axes: {
            category: {
              title: {
                text: 'Bottom',
              },
            },
            number: {
              title: {
                text: 'Left',
              },
            },
          },
          listeners: {
            seriesNodeClick: function (event: LineSeriesNodeClickEvent) {
              console.log(event);
            },
          },
        },
        line: {
          legend: {
            position: 'bottom',
          },
          series: {
            marker: {
              size: 30,
            },
          },
        },
      },
    } as VkChartTheme,
    // title: {},
    // subtitle: {},
    axes: [
      {
        type: 'category',
        position: 'bottom',
      },
      {
        type: 'number',
        position: 'left',
      },
    ],
    series: [
      {
        type: 'area',
        xKey: 'name',
        yKeys: ['value7', 'value8'],
      },
      {
        type: 'column',
        xKey: 'name',
        yKeys: ['value', 'value2'],
      },
      {
        type: 'scatter',
        xKey: 'name',
        yKey: 'value3',
      },
      {
        type: 'line',
        xKey: 'name',
        yKey: 'value4',
      },
      {
        type: 'line',
        xKey: 'name',
        yKey: 'value5',
      },
      {
        type: 'line',
        xKey: 'name',
        yKey: 'value6',
      },
    ],
    listeners: {
      seriesNodeClick: function (event: LineSeriesNodeClickEvent) {
        console.log(
          event.event.type,
          'shift:',
          event.event.shiftKey,
          'alt:',
          event.event.altKey,
          'ctrl:',
          event.event.ctrlKey,
          'meta:',
          event.event.metaKey
        );
      },
    },
  };
  const chart = VkChart.create(options, div, data);

  chart.scene.canvas.element.style.border = '1px solid black';

  makeChartResizeable(chart);

  document.body.appendChild(document.createElement('br'));

  createSlider('Theme', themes, (value: string | VkChartTheme) => {
    options.theme = value;
    VkChart.update(chart, options, div);
  });

  return chart;
}

function createGroupedColumnChart() {
  const xAxis = new GroupedCategoryAxis();
  xAxis.position = ChartAxisPosition.Bottom;
  xAxis.label.rotation = 0;

  const yAxis = new NumberAxis();
  yAxis.position = ChartAxisPosition.Left;

  const chart = new CartesianChart();
  chart.legend.spacing = 40;
  chart.axes = [xAxis, yAxis];
  chart.container = document.body;
  chart.width = 800;
  chart.height = 500;
  chart.scene.canvas.element.style.border = '1px solid black';

  const barSeries = new BarSeries();
  barSeries.xKey = 'category';
  barSeries.yKeys = [['jan', 'feb', 'mar']];
  barSeries.data = groupedCategoryData;

  chart.series = [barSeries];

  chart.navigator.enabled = true;

  makeChartResizeable(chart);

  return chart;
}

function createZoomedColumnChartUsingFactory() {
  const options: VkCartesianChartOptions = {
    container: document.body,
    data,
    width: 500,
    series: [
      {
        type: 'column',
        xKey: 'name',
        yKeys: ['value'],
      },
    ],
    axes: [
      {
        type: 'number',
        position: 'left',
        // visibleRange: [0, 0.5]
      },
      {
        type: 'category',
        position: 'bottom',
        // visibleRange: [0, 0.5]
      },
    ],
    navigator: {
      enabled: true,
      height: 50,
      mask: {
        fill: 'red',
        strokeWidth: 2,
      },
      minHandle: {
        width: 16,
        height: 30,
        stroke: 'blue',
        fill: 'yellow',
        gripLineGap: 4,
        gripLineLength: 12,
        strokeWidth: 2,
      },
      maxHandle: {
        width: 16,
        stroke: 'red',
        fill: 'cyan',
      },
    },
  };
  const chart = VkChart.create(options);

  makeChartResizeable(chart);

  return chart;
}

function createPieChart() {
  const div = document.createElement('div');
  document.body.appendChild(div);

  const options: any = {
    type: 'pie',
    autoSize: false,
    tooltipTracking: false,
    data: polarChartData,
    title: {},
    subtitle: {},
    series: [
      {
        // type: 'pie',
        angleKey: 'value',
        labelKey: 'label',
      },
    ],
  };
  const chart = VkChart.create(options, div);

  chart.scene.canvas.element.style.border = '1px solid black';

  makeChartResizeable(chart);

  document.body.appendChild(document.createElement('br'));

  createSlider('Theme', themes, (value) => {
    options.theme = value;
    VkChart.update(chart, options, div);
  });

  return chart;
}

document.addEventListener('DOMContentLoaded', () => {
  createColumnChart();
  createPieChart();
  createGroupedColumnChart();
  createZoomedColumnChartUsingFactory();
});
