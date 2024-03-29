import { createButton } from '../../utils/ui';
import { VkChart } from '../../lib/chart/vkChart';
import { CartesianChart } from '../../lib/chart/cartesianChart';
import { LegendPosition } from '../../lib/chart/legend';
import { ChartAxisPosition } from '../../lib/chart/chartAxis';
import { NumberAxis } from '../../lib/chart/axis/numberAxis';
import { CategoryAxis } from '../../lib/chart/axis/categoryAxis';
import { LineSeries } from '../../lib/chart/series/cartesian/lineSeries';

const revenueProfitData = [
  {
    month: 'Jan',
    revenue: 155000,
    profit: 33000,
    foobar: 44700,
    blah: 10,
  },
  {
    month: 'Feb',
    revenue: 123000,
    profit: 35500,
    foobar: 23400,
    blah: 30,
  },
  {
    month: 'Mar',
    revenue: 172500,
    profit: 41000,
    foobar: 43400,
    blah: 40,
  },
  {
    month: 'Apr',
    revenue: 185000,
    profit: 50000,
    foobar: 23500,
    blah: 70,
  },
];

function randomNumber(range: [number, number] = [0, 100]): number {
  const delta = range[1] - range[0];
  return range[0] + Math.random() * delta;
}

const scatterData = [0, 1, 2].map((_) => {
  const data: { x: number; y: number }[] = [];
  for (let i = 0; i < 10; i++) {
    data.push({
      x: randomNumber(),
      y: randomNumber(),
    });
  }
  return data;
});

function createLineChart() {
  const chart1 = VkChart.create({
    // chart type is optional because it defaults to `cartesian`
    container: document.body,
    data: revenueProfitData,
    series: [
      {
        // series type if optional because `line` is default for `cartesian` charts
        xKey: 'month',
        yKey: 'revenue',
        marker: {
          shape: 'plus',
        },
      },
      {
        type: 'column', // have to specify type explicitly here
        xKey: 'month',
        yKeys: ['profit'],
        fills: ['lime'],
      },
    ],
    legend: {},
  });

  let legendMarkerSize = 15;
  let legendPositionIndex = 0;
  createButton('Increase legend marker size', () => {
    VkChart.update(chart1, {
      data: revenueProfitData,
      container: document.body,
      series: [
        {
          xKey: 'month',
          yKey: 'revenue',
        },
        {
          type: 'column',
          xKey: 'month',
          yKeys: ['profit'],
          fills: ['lime'],
        },
      ],
      legend: {
        markerSize: (legendMarkerSize += 2),
        position: [LegendPosition.Right, LegendPosition.Bottom, LegendPosition.Left, LegendPosition.Right][
          legendPositionIndex++ % 4
        ],
      },
    });
  });

  VkChart.create({
    container: document.body,
    data: scatterData[0],
    title: {
      text: 'Scatter Plot',
      // fontSize: 18,
      // fontWeight: 'bold'
    },
    subtitle: {
      fontStyle: 'italic',
    },
    axes: [
      {
        type: 'number',
        position: 'right',
        gridStyle: [
          {
            stroke: 'rgba(0,0,0,0.3)',
            lineDash: [2, 2],
          },
          {
            stroke: undefined,
          },
        ],
      },
      {
        type: 'number',
        position: 'bottom',
        label: {
          rotation: 45,
        },
      },
    ],
    series: [
      {
        type: 'scatter',
        // marker: {
        //     type: 'plus'
        // },
        xKey: 'x',
        yKey: 'y',
      },
    ],
    // legend: {
    //     enabled: true
    // }
  });
}

function test() {
  const chart = VkChart.create({
    // chart type is optional because it defaults to `cartesian`
    container: document.body,
    data: [
      {
        month: 'Jan',
        revenue: 155000,
        profit: 33000,
      },
      {
        month: 'Feb',
        revenue: 123000,
        profit: 35500,
      },
    ],
    series: [
      {
        // series type if optional because `line` is default for `cartesian` charts
        xKey: 'month',
        yKey: 'revenue',
        marker: {
          shape: 'plus',
        },
      },
      {
        type: 'column', // have to specify type explicitly here
        xKey: 'month',
        yKeys: ['profit'],
        fills: ['lime'],
      },
    ],
    legend: {
      item: {
        paddingY: 16,
      },
    },
  });
  VkChart.update(chart, {
    autoSize: false,
    width: 500,
    height: 500,
    padding: {
      top: 30,
      right: 40,
      bottom: 50,
      left: 60,
    },
    subtitle: {
      enabled: false,
      text: 'My Subtitle',
      fontSize: 20,
    },
    series: [
      {
        // series type if optional because `line` is default for `cartesian` charts
        xKey: 'month',
        yKey: 'revenue',
        marker: {
          shape: 'plus',
        },
      },
      {
        type: 'column', // have to specify type explicitly here
        xKey: 'month',
        yKeys: ['profit'],
        fills: ['lime'],
      },
    ],
    legend: {
      padding: 50,
      position: LegendPosition.Bottom,
    },
  });

  console.assert(chart.container === undefined);
  console.assert(chart.width === 500);
  console.assert(chart.height === 500);
  console.assert(chart.data.length === 0);
  console.assert(chart.padding.top === 30);
  console.assert(chart.padding.right === 40);
  console.assert(chart.padding.bottom === 50);
  console.assert(chart.padding.left === 60);
  console.assert(chart.title?.enabled === false);
  console.assert(chart.title?.text === 'Title');
  console.assert(chart.title?.fontSize === 16);
  console.assert(chart.subtitle?.text === 'My Subtitle');
  console.assert(chart.subtitle?.fontSize === 20);
  console.assert(chart.subtitle?.enabled === false);
}

function createAreaChart() {
  VkChart.create({
    type: 'area',
    container: document.body,
    data: revenueProfitData,
    series: [
      {
        xKey: 'month',
        yKeys: ['revenue'],
        fills: ['red'],
        marker: {
          enabled: true,
        },
      },
      {
        xKey: 'month',
        yKeys: ['profit'],
        fills: ['blue'],
        shadow: {
          color: 'red',
        },
        marker: {
          enabled: true,
        },
      },
    ],
  });
}

function createScatterChart() {
  VkChart.create({
    type: 'scatter',
    container: document.body,
    series: [
      {
        title: 'foo',
        data: scatterData[0],
        xKey: 'x',
        yKey: 'y',
        fill: 'red',
        marker: {
          shape: 'plus',
        },
      },
      {
        title: 'bar',
        data: scatterData[1],
        xKey: 'x',
        yKey: 'y',
        fill: 'blue',
        marker: {
          shape: 'cross',
        },
      },
    ],
  });
}

function testAxisMappings() {
  VkChart.create({
    container: document.body,
    data: revenueProfitData,
    series: [
      {
        type: 'area',
        xKey: 'month',
        yKeys: ['revenue'],
        fills: ['green'],
      },
    ],
    axes: [
      {
        type: 'category',
        position: 'bottom',
        label: {
          fontSize: 20,
        },
        line: {
          width: 5,
          color: 'cyan',
        },
        title: {},
        gridStyle: [
          {
            stroke: 'red',
            lineDash: [8, 8],
          },
        ],
      },
      {
        type: 'number',
        position: 'left',
        tick: {
          size: 15,
        },
      },
    ],
  });
  // VkChart.update(chart, {
  //     container: document.body,
  //     data: revenueProfitData,
  //     series: [{
  //         type: 'area',
  //         xKey: 'month',
  //         yKeys: ['revenue'],
  //         fills: ['green']
  //     }],
  //     axes: [{
  //         type: 'category',
  //         position: 'bottom',
  //         label: {
  //             fontWeight: 'bold'
  //         }
  //     }, {
  //         type: 'number',
  //         position: 'left',
  //         tick: {
  //             width: 4
  //         }
  //     }]
  // });
}

function testSeriesUpdate() {
  const chart = VkChart.create({
    data: revenueProfitData,
    series: [
      {
        // series type if optional because `line` is default for `cartesian` charts
        xKey: 'month',
        yKey: 'revenue',
        marker: {
          shape: 'plus',
        },
      },
      {
        type: 'column', // have to specify type explicitly here
        xKey: 'month',
        yKeys: ['profit'],
        fills: ['lime'],
      },
    ],
  });

  VkChart.update(chart, {
    data: revenueProfitData,
    series: [
      {
        // series type if optional because `line` is default for `cartesian` charts
        xKey: 'month',
        yKey: 'revenue',
        marker: {
          shape: 'square',
        },
      },
      {
        type: 'column', // have to specify type explicitly here
        xKey: 'month',
        yKeys: ['profit', 'foobar'],
        fills: ['lime', 'cyan'],
      },
      {
        type: 'area',
        xKey: 'month',
        yKeys: ['foobar'],
      },
    ],
  });

  VkChart.update(chart, {
    data: revenueProfitData,
    series: [
      {
        // series type if optional because `line` is default for `cartesian` charts
        xKey: 'month',
        yKey: 'revenue',
        marker: {
          shape: 'square',
        },
      },
      {
        type: 'column', // have to specify type explicitly here
        xKey: 'month',
        yKeys: ['profit', 'foobar'],
        fills: ['lime', 'cyan'],
      },
    ],
  });

  VkChart.update(chart, {
    data: revenueProfitData,
    series: [
      {
        type: 'column', // have to specify type explicitly here
        xKey: 'month',
        yKeys: ['profit', 'foobar'],
        fills: ['lime', 'cyan'],
      },
      {
        // series type if optional because `line` is default for `cartesian` charts
        xKey: 'month',
        yKey: 'revenue',
        marker: {
          shape: 'square',
        },
      },
    ],
  });

  VkChart.update(chart, {
    data: revenueProfitData,
    series: [
      {
        type: 'area', // have to specify type explicitly here
        xKey: 'month',
        yKeys: ['profit', 'foobar'],
        fills: ['lime', 'cyan'],
      },
      {
        // series type if optional because `line` is default for `cartesian` charts
        xKey: 'month',
        yKey: 'revenue',
        marker: {
          shape: 'square',
        },
      },
    ],
  });
}

function swapAxes() {
  const chart = new CartesianChart();
  const bottomCategoryAxis = new CategoryAxis();
  const leftNumberAxis = new NumberAxis();
  const bottomNumberAxis = new NumberAxis();

  leftNumberAxis.position = ChartAxisPosition.Left;
  bottomCategoryAxis.position = ChartAxisPosition.Bottom;
  bottomNumberAxis.position = ChartAxisPosition.Bottom;

  const lineSeries = new LineSeries();
  lineSeries.xKey = 'month';
  lineSeries.yKey = 'revenue';
  lineSeries.tooltip.enabled = true;

  chart.container = document.body;
  chart.axes = [leftNumberAxis, bottomCategoryAxis];
  chart.series = [lineSeries];
  chart.data = revenueProfitData;

  createButton('Swap bottom axis', () => {
    chart.axes = [leftNumberAxis, bottomNumberAxis];
    lineSeries.xKey = 'blah';
  });
}

function createPieChart() {
  VkChart.create({
    type: 'polar',
    container: document.body,
    data: revenueProfitData,
    series: [
      {
        // series type is optional because that's the default for `polar` charts
        angleKey: 'profit',
        tooltipEnabled: true,
      },
    ],
  });

  VkChart.create({
    // `polar` chart type is optional because it can be inferred from the type of series
    container: document.body,
    data: revenueProfitData,
    series: [
      {
        type: 'pie',
        angleKey: 'revenue',
        labelKey: 'month',
        innerRadiusOffset: -50, // donut hole
      },
    ],
  });
}

function createNormalizedColumnChart() {
  const config = {
    container: document.body,
    data: revenueProfitData,
    series: [
      {
        type: 'column',
        xKey: 'month',
        yKeys: ['revenue', 'profit'],
      },
    ],
  } as any;

  const chart = VkChart.create(config);

  createButton('Normalize to 50', () => {
    config.series[0].normalizedTo = 50;
    VkChart.update(chart, config);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  createLineChart();
  createAreaChart();
  createScatterChart();
  createPieChart();
  testSeriesUpdate();
  testAxisMappings();
  swapAxes();
  createNormalizedColumnChart();
  test();
});
