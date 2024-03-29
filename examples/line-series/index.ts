import { makeChartResizeable } from '../../utils/chart';
import { createButton, createSlider } from '../../utils/ui';
import { CategoryAxis } from '../../lib/chart/axis/categoryAxis';
import { ChartAxisPosition } from '../../lib/chart/chartAxis';
import { CartesianChart } from '../../lib/chart/cartesianChart';
import { LineSeries } from '../../lib/chart/series/cartesian/lineSeries';
import { Circle } from '../../lib/chart/marker/circle';
import { NumberAxis } from '../../lib/chart/axis/numberAxis';
import { Marker } from '../../lib/chart/marker/marker';
import { Square } from '../../lib/chart/marker/square';
import { AreaSeries } from '../../lib/chart/series/cartesian/areaSeries';
import { VkChart } from '../../lib/chart/vkChart';
import second from '../../lib/util/time/second';
import { BarSeries } from '../../lib/chart/series/cartesian/barSeries';
import minute from '../../lib/util/time/minute';

type NumericDatum = {
  xValue: number;
  yValue: number;
};

type MultiValue = {
  category: string;
  value1: number;
  value2: number;
  value3: number;
};

function generateMultiValueData(n = 50): MultiValue[] {
  const data: MultiValue[] = [];
  for (let i = 0; i < n; i++) {
    const datum: MultiValue = {
      category: 'A' + (i + 1),
      value1: Math.random() * 10,
      value2: Math.random() * 20,
      value3: Math.random() * 15,
    };
    data.push(datum);
  }
  return data;
}

function generateSinData(): NumericDatum[] {
  const data: NumericDatum[] = [];
  const step = 0.1;
  for (let i = -10; i < 10; i += step) {
    const datum: NumericDatum = {
      xValue: i,
      yValue: Math.sin(i),
    };
    data.push(datum);
  }
  return data;
}

function generateLogData(): NumericDatum[] {
  const data: NumericDatum[] = [];
  const step = 10;
  for (let i = 1; i < 1000; i += step) {
    const datum: NumericDatum = {
      xValue: i,
      yValue: Math.log(i),
    };
    data.push(datum);
  }
  return data;
}

function generateSpiralData(): NumericDatum[] {
  // r = a + bθ
  // x = r * Math.cos(θ)
  // y = r * Math.sin(θ)
  const a = 1;
  const b = 1;
  const data: NumericDatum[] = [];
  const step = 0.1;
  for (let th = 1; th < 50; th += step) {
    const r = a + b * th;
    const datum: NumericDatum = {
      xValue: r * Math.cos(th),
      yValue: r * Math.sin(th),
    };
    data.push(datum);
  }
  return data;
}

function createCategoryLineChart() {
  const xAxis = new CategoryAxis();
  xAxis.position = ChartAxisPosition.Bottom;

  const yAxis = new CategoryAxis();
  yAxis.position = ChartAxisPosition.Left;

  const chart = new CartesianChart();
  chart.axes = [xAxis, yAxis];
  chart.container = document.body;
  chart.width = 400;
  chart.height = 300;

  const lineSeries = new LineSeries();
  lineSeries.marker.shape = Circle;
  lineSeries.marker.enabled = true;
  chart.addSeries(lineSeries);
  lineSeries.tooltip.enabled = true;
  lineSeries.data = [
    {
      x: 'Tea',
      y: 'John',
    },
    {
      x: 'Coffee',
      y: 'Mary',
    },
    {
      x: 'Milk',
      y: 'Ann',
    },
  ];
  lineSeries.xKey = 'x';
  lineSeries.yKey = 'y';

  document.body.appendChild(document.createElement('br'));

  createButton('Data #2', () => {
    lineSeries.data = [
      {
        x: 'Tea',
        y: 'John',
      },
      {
        x: 'Coffee',
        y: 'Ann',
      },
      {
        x: 'Milk',
        y: 'Mary',
      },
    ];
  });

  createButton('Data #3', () => {
    lineSeries.data = [
      {
        x: 'UK',
        y: 'English',
      },
      {
        x: 'US',
        y: 'English',
      },
      {
        x: 'Spain',
        y: 'Spanish',
      },
      {
        x: 'Singapore',
        y: 'English',
      },
    ];
  });

  document.body.appendChild(document.createElement('br'));
}

function createLeftCategoryLineChart() {
  const xAxis = new NumberAxis();
  xAxis.position = ChartAxisPosition.Bottom;

  const yAxis = new CategoryAxis();
  yAxis.position = ChartAxisPosition.Left;

  const chart = new CartesianChart();
  chart.axes = [xAxis, yAxis];
  chart.container = document.body;
  chart.width = 400;
  chart.height = 300;

  const lineSeries = new LineSeries();
  lineSeries.marker.shape = Circle;
  lineSeries.marker.enabled = true;
  chart.addSeries(lineSeries);
  lineSeries.tooltip.enabled = true;
  lineSeries.data = [
    {
      x: 5,
      y: 'John',
    },
    {
      x: 3,
      y: 'Mary',
    },
    {
      x: 7,
      y: 'Ann',
    },
  ];
  lineSeries.xKey = 'x';
  lineSeries.yKey = 'y';

  document.body.appendChild(document.createElement('br'));
}

function createTwoVerticalAxesLineChart() {
  const xAxisTop = new CategoryAxis();
  xAxisTop.position = ChartAxisPosition.Top;

  const xAxisBottom = new CategoryAxis();
  xAxisBottom.position = ChartAxisPosition.Bottom;
  xAxisBottom.linkedTo = xAxisTop;

  const yAxisLeft = new NumberAxis();
  yAxisLeft.position = ChartAxisPosition.Left;
  yAxisLeft.gridStyle = [];
  yAxisLeft.keys = ['y1'];

  const yAxisRight = new NumberAxis();
  yAxisRight.position = ChartAxisPosition.Right;
  yAxisRight.gridStyle = [
    {
      stroke: '#c2c3c2',
    },
  ];
  yAxisRight.keys = ['y2'];

  const yAxisRight2 = new NumberAxis();
  yAxisRight2.position = ChartAxisPosition.Right;
  yAxisRight2.gridStyle = [];
  yAxisRight2.linkedTo = yAxisRight;

  const yAxisRight3 = new NumberAxis();
  yAxisRight3.position = ChartAxisPosition.Right;
  yAxisRight3.gridStyle = [];
  yAxisRight3.linkedTo = yAxisRight;

  const chart = new CartesianChart();
  chart.axes = [xAxisTop, xAxisBottom, yAxisLeft, yAxisRight];
  chart.container = document.body;
  chart.width = document.body.clientWidth;
  chart.height = 600;

  const data = [
    {
      category: 'A1',
      y1: 5,
      y2: 800,
    },
    {
      category: 'A2',
      y1: 12,
      y2: 300,
    },
    {
      category: 'A3',
      y1: 8,
      y2: 500,
    },
    {
      category: 'A4',
      y1: 10,
      y2: 450,
    },
  ];

  const lineSeries1 = new LineSeries();
  lineSeries1.title = 'Flashy Title';
  lineSeries1.marker.shape = Circle;
  lineSeries1.marker.enabled = true;
  lineSeries1.tooltip.enabled = true;
  lineSeries1.data = data;
  lineSeries1.xKey = 'category';
  lineSeries1.yKey = 'y1';

  const lineSeries2 = new LineSeries();
  // lineSeries2.fill = '#57b757';
  lineSeries2.stroke = '#3d803d';
  lineSeries2.marker.shape = Square;
  lineSeries2.marker.enabled = true;
  lineSeries2.tooltip.enabled = true;
  lineSeries2.data = data;
  lineSeries2.xKey = 'category';
  lineSeries2.yKey = 'y2';

  chart.series = [lineSeries1, lineSeries2];

  makeChartResizeable(chart);
}

function createNumericLineChart() {
  document.body.appendChild(document.createElement('br'));

  const xAxis = new NumberAxis();
  xAxis.position = ChartAxisPosition.Bottom;
  xAxis.label.rotation = 45;
  const yAxis = new NumberAxis();
  yAxis.position = ChartAxisPosition.Left;

  const chart = new CartesianChart();
  chart.axes = [xAxis, yAxis];
  chart.container = document.body;
  chart.width = 600;
  chart.height = 600;

  const lineSeries = new LineSeries();
  lineSeries.marker.shape = Circle;
  lineSeries.marker.enabled = true;
  lineSeries.strokeWidth = 2;
  lineSeries.showInLegend = false;
  chart.addSeries(lineSeries);
  lineSeries.data = generateSinData();
  lineSeries.xKey = 'xValue';
  lineSeries.yKey = 'yValue';

  document.body.appendChild(document.createElement('br'));

  createButton('Save Chart Image', () => {
    chart.scene.download('chart');
  });

  createButton('Math.log data', () => {
    lineSeries.data = generateLogData();
  });

  createButton('Spiral data', () => {
    lineSeries.data = generateSpiralData();
  });

  createButton('Hide markers', () => {
    lineSeries.marker.enabled = false;
  });

  createButton('Show markers', () => {
    lineSeries.marker.enabled = true;
  });

  createButton('Hide labels', () => {
    lineSeries.label.enabled = false;
  });

  createButton('Show labels', () => {
    lineSeries.label.enabled = true;
  });

  createButton('Use label formatter', () => {
    lineSeries.label.formatter = (params) => params.value.toFixed(2) + '😛';
  });

  createButton('Animate Math.sin data', () => {
    const data: NumericDatum[] = [];
    const step = 0.02;
    let i = -10;

    chart.addEventListener('layoutDone', nextFrame);

    function nextFrame() {
      data.push({
        xValue: i,
        yValue: Math.sin(i),
      });
      lineSeries.data = data;

      if (i < 10) {
        i += step;
      } else {
        chart.removeEventListener('layoutDone', nextFrame);
      }
    }

    nextFrame();
  });

  createButton('Animate spiral data', () => {
    const a = 1;
    const b = 1;
    const data: NumericDatum[] = [];
    const step = 0.1;
    let th = 1;

    chart.addEventListener('layoutDone', nextFrame);

    function nextFrame() {
      const r = a + b * th;
      data.push({
        xValue: r * Math.cos(th),
        yValue: r * Math.sin(th),
      });
      lineSeries.data = data;

      if (th < 50) {
        th += step;
      } else {
        chart.removeEventListener('layoutDone', nextFrame);
      }
    }

    nextFrame();
  });

  document.body.appendChild(document.createElement('br'));
  const niceCheckboxLabel = document.createElement('label');
  niceCheckboxLabel.innerHTML = 'Data domain auto-rounding (desirable for static charts but not for animated ones)';
  const niceCheckbox = document.createElement('input');
  niceCheckbox.type = 'checkbox';
  niceCheckbox.checked = true;
  niceCheckboxLabel.appendChild(niceCheckbox);
  document.body.appendChild(niceCheckboxLabel);
  niceCheckbox.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement;

    if (xAxis instanceof NumberAxis) {
      xAxis.nice = target.checked;
    }
    if (yAxis instanceof NumberAxis) {
      yAxis.nice = target.checked;
    }
    chart.layoutPending = true;
  });

  createSlider('stroke width', [0, 2, 4, 6, 8], (value) => (lineSeries.strokeWidth = value));
  createSlider('marker stroke width', [0, 2, 4, 6, 8], (value) => (lineSeries.marker.strokeWidth = value));
  createSlider('marker size', [0, 2, 4, 6, 8], (value) => (lineSeries.marker.size = value));
  createSlider('label font size', [8, 10, 12, 14, 16, 18, 20, 22, 24], (value) => (lineSeries.label.fontSize = value));
}

function createMultiLineChart() {
  const xAxis = new CategoryAxis();
  xAxis.position = ChartAxisPosition.Bottom;
  xAxis.label.rotation = 90;

  const yAxis = new NumberAxis();
  yAxis.position = ChartAxisPosition.Left;

  const chart = new CartesianChart();
  chart.container = document.body;
  chart.width = document.body.clientWidth;
  chart.height = 600;
  chart.axes = [xAxis, yAxis];

  const data = generateMultiValueData(10);

  const areaSeries = new AreaSeries();
  areaSeries.marker.shape = Circle;
  areaSeries.marker.size = 15;
  // areaSeries.marker.enabled = true;
  areaSeries.strokeWidth = 3;
  areaSeries.xKey = 'category';
  areaSeries.yKeys = ['value1', 'value2', 'value3'];

  const lineSeries1 = new LineSeries();
  lineSeries1.marker.shape = Circle;
  lineSeries1.strokeWidth = 4;
  lineSeries1.marker.size = 15;
  lineSeries1.marker.fill = '#f3622d';
  lineSeries1.xKey = 'category';
  lineSeries1.yKey = 'value1';

  const lineSeries2 = new LineSeries();
  lineSeries2.marker.shape = Circle;
  lineSeries2.strokeWidth = 4;
  lineSeries2.marker.size = 15;
  lineSeries2.marker.fill = '#fba71b';
  lineSeries2.xKey = 'category';
  lineSeries2.yKey = 'value2';

  const lineSeries3 = new LineSeries();
  lineSeries3.marker.shape = Circle;
  lineSeries3.strokeWidth = 4;
  lineSeries3.marker.size = 15;
  lineSeries3.marker.fill = '#57b757';
  lineSeries3.xKey = 'category';
  lineSeries3.yKey = 'value3';

  const barSeries = new BarSeries();
  barSeries.fills = ['#41a9c9'];
  barSeries.xKey = 'category';
  barSeries.yKeys = [['value3']];

  // Both approaches are valid here:
  // chart.addSeries(barSeries);
  // chart.addSeries(lineSeries1);
  // chart.addSeries(lineSeries2);
  // chart.addSeries(lineSeries3);

  chart.series = [
    // areaSeries,
    barSeries,
    lineSeries1,
    lineSeries2,
    lineSeries3,
  ];

  chart.data = data;

  document.body.appendChild(document.createElement('br'));
  const saveImageButton = document.createElement('button');
  saveImageButton.textContent = 'Save Chart Image';
  document.body.appendChild(saveImageButton);
  saveImageButton.addEventListener('click', () => {
    chart.scene.download('chart');
  });

  const changeDataButton = document.createElement('button');
  changeDataButton.textContent = 'Change data';
  document.body.appendChild(changeDataButton);
  changeDataButton.addEventListener('click', () => {
    chart.data = generateMultiValueData(Math.random() * 30);
  });

  const animateButton = document.createElement('button');
  animateButton.textContent = 'Animate';
  document.body.appendChild(animateButton);
  animateButton.addEventListener('click', () => {
    const data: MultiValue[] = [];
    const step = 0.1;
    let i = -10;
    let index = 0;

    chart.addEventListener('layoutDone', nextFrame);

    function nextFrame() {
      data.push({
        category: 'A' + ++index,
        value1: Math.sin(i) * 0.5,
        value2: Math.cos(i),
        value3: Math.sin(i),
      });
      i += step;

      chart.data = data;

      if (i < 10) {
        i += step;
      } else {
        chart.removeEventListener('layoutDone', nextFrame);
      }
    }

    nextFrame();
  });

  createButton('Remove the bar series', () => {
    if (chart.removeSeries(barSeries)) {
      console.log('The bar series was removed.');
    } else {
      console.log('No series removed. The chart does not contain the given series.');
    }
  });

  createButton('Add the bar series back', () => {
    if (chart.addSeries(barSeries)) {
      console.log('Bar series was successfully added.');
    } else {
      console.log('Could not add bar series.');
    }
  });

  createButton('Insert bar series before line series', () => {
    if (chart.addSeries(barSeries, lineSeries1)) {
      console.log('Bar series was successfully inserted.');
    } else {
      console.log('Could not insert bar series.');
    }
  });
}

// import { Marker } from "./marker";

export class Heart extends Marker {
  rad(degree: number) {
    return (degree / 180) * Math.PI;
  }

  updatePath() {
    let { x, path, size, rad } = this;
    const r = size / 4;
    const y = this.y + r / 2;

    path.clear();
    path.cubicArc(x - r, y - r, r, r, 0, rad(130), rad(330), 0);
    path.cubicArc(x + r, y - r, r, r, 0, rad(220), rad(50), 0);
    path.lineTo(x, y + r);
    path.closePath();
  }
}

function createBasicLineChartUsingFactory() {
  const fuelSpending = [
    {
      quarter: 'Q1',
      gas: 200,
      diesel: 100,
    },
    {
      quarter: 'Q2',
      gas: 300,
      diesel: 130,
    },
    {
      quarter: 'Q3',
      gas: 350,
      diesel: 160,
    },
    {
      quarter: 'Q4',
      gas: 400,
      diesel: 200,
    },
  ];

  VkChart.create({
    container: document.body,
    width: 400,
    height: 300,
    title: {
      text: 'Average expenditure on coffee',
    },
    subtitle: {
      text: 'per person per week in the UK',
    },
    data: [
      {
        quarter: '2015',
        spending: 37,
        y: 10,
      },
      {
        quarter: '2016',
        spending: 40,
        y: 15,
      },
      {
        quarter: '2017',
        spending: 42,
        y: 20,
      },
      {
        quarter: '2018',
        spending: 43,
        y: 25,
      },
    ],
    series: [
      {
        xKey: 'quarter',
        yKey: 'spending',
        stroke: 'green',
        strokeWidth: 1,
        marker: {
          strokeWidth: 0,
          size: 12,
        },
        highlightStyle: {
          item: {
            strokeWidth: 3,
          },
          series: {
            enabled: true,
            strokeWidth: 3,
          },
        },
      },
      {
        xKey: 'quarter',
        yKey: 'y',
        stroke: 'red',
        marker: {
          size: 12,
        },
        highlightStyle: {
          item: {
            strokeWidth: 5,
          },
          series: {
            enabled: true,
            strokeWidth: 5,
          },
        },
      },
    ],
    axes: [
      {
        type: 'number',
        position: 'left',
      },
      {
        type: 'category',
        position: 'bottom',
      },
    ],
  });

  document.body.appendChild(document.createElement('br'));

  const chart = VkChart.create({
    width: 400,
    height: 300,
    data: fuelSpending,
    container: document.body,
    title: {
      text: 'Fuel Spending (2019)',
    },
    series: [
      {
        xKey: 'quarter',
        yKey: 'gas',
        title: 'Gas',
        marker: {
          size: 16,
          shape: 'heart',
        },
      },
      {
        xKey: 'quarter',
        yKey: 'diesel',
        title: 'Diesel',
        stroke: 'black',
        marker: {
          shape: 'plus',
          size: 16,
          fill: 'gray',
          stroke: 'black',
        },
      },
    ],
  });
  makeChartResizeable(chart);
  createButton('Download', () => chart.download());
}

function test() {
  const beverageSpending = [
    {
      beverage: 'Coffee',
      Q1: 450,
      Q2: 560,
      Q3: 600,
      Q4: 700,
    },
    {
      beverage: 'Tea',
      Q1: 270,
      Q2: 380,
      Q3: 450,
      Q4: 520,
    },
    {
      beverage: 'Milk',
      Q1: 180,
      Q2: 170,
      Q3: 190,
      Q4: 200,
    },
  ];

  VkChart.create({
    data: beverageSpending,
    container: document.body,
    title: {
      text: 'Beverage Expenses',
    },
    subtitle: {
      text: 'per quarter',
    },
    series: [
      {
        type: 'column',
        xKey: 'beverage',
        yKeys: ['Q1', 'Q2', 'Q3', 'Q4'],
        label: {},
      },
    ],
  });
}

function createGapChart() {
  const discontinousData = [
    {
      year: '2005',
      visitors: 191000,
    },
    {
      year: '2006',
      visitors: 45000,
    },
    {
      year: '2007',
      visitors: 100000,
    },
    {
      year: '2008',
      visitors: null,
    },
    {
      year: '2009',
      visitors: 78000,
    },
    {
      year: '2010',
      visitors: 136000,
    },
    {
      year: '2011',
      visitors: null,
    },
    {
      year: '2012',
      visitors: 74000,
    },
    {
      year: '2013',
      visitors: 67000,
    },
    {
      year: '2014',
      visitors: 74000,
    },
    {
      year: '2015',
      visitors: 174000,
    },
    {
      year: '2016',
      visitors: 76000,
    },
    {
      year: '2017',
      visitors: 56000,
    },
  ];

  const gapChart = VkChart.create({
    width: 700,
    height: 400,
    data: discontinousData,
    container: document.body,
    title: {
      text: 'Visitors to website',
    },
    subtitle: {
      text: '2005-2017',
    },
    series: [
      {
        xKey: 'year',
        yKey: 'visitors',
      },
    ],
  });

  makeChartResizeable(gapChart);

  createButton('Save Chart', () => {
    gapChart.download();
  });
}

function createTimeLineChart() {
  VkChart.create({
    container: document.body,
    theme: {
      overrides: {
        cartesian: {
          axes: {
            time: {
              tick: {
                count: minute.every(2),
              },
            },
          },
        },
      },
    },
    axes: [
      {
        type: 'time',
        position: 'bottom',
        // tick: {
        //     count: minute.every(2)
        // }
      },
      {
        type: 'number',
        position: 'left',
        label: {
          formatter: (params: any) => {
            return params.value + ' C°';
          },
        },
      },
    ],
    series: [
      {
        data: [
          {
            time: new Date('01 Jan 2020 13:25:30 GMT'),
            sensor: 25,
          },
          {
            time: new Date('01 Jan 2020 13:26:30 GMT'),
            sensor: 24,
          },
          {
            time: new Date('01 Jan 2020 13:27:30 GMT'),
            sensor: 24,
          },
          {
            time: new Date('01 Jan 2020 13:28:30 GMT'),
            sensor: 23,
          },
          {
            time: new Date('01 Jan 2020 13:29:30 GMT'),
            sensor: 22.5,
          },
          {
            time: new Date('01 Jan 2020 13:30:30 GMT'),
            sensor: 21.5,
          },
          {
            time: new Date('01 Jan 2020 13:31:30 GMT'),
            sensor: 22.5,
          },
        ],
        xKey: 'time',
        yKey: 'sensor',
        yName: 'Lounge Temperature',
        stroke: '#03a9f4',
        marker: {
          fill: '#03a9f4',
          stroke: '#0276ab',
        },
      },
      {
        data: [
          {
            time: Date.parse('01 Jan 2020 13:25:00 GMT'),
            sensor: 21,
          },
          {
            time: Date.parse('01 Jan 2020 13:26:00 GMT'),
            sensor: 22,
          },
          {
            time: Date.parse('01 Jan 2020 13:28:00 GMT'),
            sensor: 22,
          },
          {
            time: Date.parse('01 Jan 2020 13:29:00 GMT'),
            sensor: 23,
          },
          {
            time: Date.parse('01 Jan 2020 13:30:00 GMT'),
            sensor: 24,
          },
          {
            time: Date.parse('01 Jan 2020 13:31:00 GMT'),
            sensor: 24,
          },
          {
            time: Date.parse('01 Jan 2020 13:32:00 GMT'),
            sensor: 24.5,
          },
          {
            time: Date.parse('01 Jan 2020 13:33:00 GMT'),
            sensor: 24.5,
          },
        ],
        xKey: 'time',
        yKey: 'sensor',
        yName: 'Office Temperature',
        stroke: '#8bc24a',
        marker: {
          fill: '#8bc24a',
          stroke: '#658d36',
        },
      },
    ],
    legend: {
      position: 'bottom',
    },
  });
}

function createRealTimeChart() {
  var lastTime = new Date('07 Jan 2020 13:25:00 GMT').getTime();
  var data = [] as any;
  for (var i = 0; i < 20; i++) {
    data.push({
      time: new Date((lastTime += 1000)),
      voltage: 1.1 + Math.random() / 2,
    });
  }

  var chart = VkChart.create({
    container: document.body,
    data,
    series: [
      {
        xKey: 'time',
        yKey: 'voltage',
        tooltipEnabled: false,
      },
    ],
    axes: [
      {
        type: 'time',
        position: 'bottom',
        tick: {
          count: second.every(5),
        },
        label: {
          format: '%H:%M:%S',
        },
      },
      {
        type: 'number',
        position: 'left',
        label: {
          formatter: (params: any) => {
            return params.value + 'v';
          },
        },
      },
    ],
    title: {
      text: 'Core Voltage',
    },
    legend: {
      enabled: false,
    },
  });

  setInterval(function () {
    data.shift();
    data.push({
      time: new Date((lastTime += 1000)),
      voltage: 1.1 + Math.random() / 2,
    });
    chart.data = data;
  }, 1000);
}

function createAllCategoryLineChart() {
  document.body.appendChild(document.createElement('br'));

  const xAxis = new CategoryAxis();
  xAxis.position = ChartAxisPosition.Bottom;
  xAxis.label.rotation = 45;
  const yAxis = new CategoryAxis();
  yAxis.position = ChartAxisPosition.Left;

  const chart = new CartesianChart();
  chart.axes = [xAxis, yAxis];
  chart.container = document.body;
  chart.width = 600;
  chart.height = 600;

  const lineSeries = new LineSeries();
  lineSeries.marker.shape = Circle;
  lineSeries.marker.enabled = true;
  lineSeries.strokeWidth = 2;
  lineSeries.showInLegend = false;
  chart.addSeries(lineSeries);
  lineSeries.data = [
    {
      x: 'John',
      y: 'Berlin',
    },
    {
      x: 'Sarah',
      y: 'London',
    },
    {
      x: '',
    },
  ];
  lineSeries.xKey = 'x';
  lineSeries.yKey = 'y';
}

document.addEventListener('DOMContentLoaded', () => {
  createBasicLineChartUsingFactory();
  createGapChart();
  createTwoVerticalAxesLineChart();
  createCategoryLineChart();
  createLeftCategoryLineChart();
  createAllCategoryLineChart();
  createNumericLineChart();
  createTimeLineChart();
  createRealTimeChart();
  createMultiLineChart();
  test();
});
