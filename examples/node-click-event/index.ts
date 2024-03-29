import { createButton } from '../../utils/ui';
import { CategoryAxis } from '../../lib/chart/axis/categoryAxis';
import { ChartAxisPosition } from '../../lib/chart/chartAxis';
import { NumberAxis } from '../../lib/chart/axis/numberAxis';
import { CartesianChart } from '../../lib/chart/cartesianChart';
import { AreaSeries } from '../../lib/chart/series/cartesian/areaSeries';
import { LineSeries, type LineSeriesNodeClickEvent } from '../../lib/chart/series/cartesian/lineSeries';
import { Circle } from '../../lib/chart/marker/circle';
import { BarSeries } from '../../lib/chart/series/cartesian/barSeries';
import { Caption } from '../../lib/caption';
import { VkChart } from '../../lib/chart/vkChart';
import { type VkChartOptions } from '../../lib/main';

type MultiValue = {
  category: string;
  value1: number;
  value2: number;
  value3: number;
  selected: boolean;
};

function generateMultiValueData(n = 50): MultiValue[] {
  const data: MultiValue[] = [];
  for (let i = 0; i < n; i++) {
    const datum: MultiValue = {
      selected: false,
      category: 'A' + (i + 1),
      value1: Math.random() * 10,
      value2: Math.random() * 20,
      value3: 20 + Math.random() * 15,
    };
    data.push(datum);
  }
  return data;
}

function createMultiLineChart() {
  const xAxis = new CategoryAxis();
  xAxis.position = ChartAxisPosition.Bottom;
  xAxis.label.rotation = 90;

  const yAxis = new NumberAxis();
  yAxis.position = ChartAxisPosition.Left;

  const chart = new CartesianChart();
  chart.container = document.body;
  chart.width = 800;
  chart.height = 600;
  chart.axes = [xAxis, yAxis];
  chart.tooltip.delay = 0;
  chart.navigator.enabled = true;

  const data = generateMultiValueData(10);

  const areaSeries = new AreaSeries();
  areaSeries.marker.shape = Circle;
  areaSeries.marker.enabled = true;
  areaSeries.marker.size = 0;
  areaSeries.marker.formatter = (params) => ({
    fill: 'yellow',
    size: params.highlighted ? 12 : params.size,
  });
  areaSeries.strokeWidth = 3;
  areaSeries.xKey = 'category';
  areaSeries.yKeys = ['value1', 'value2', 'value3'];
  areaSeries.addEventListener('nodeClick', () => {
    window.alert('Area marker clicked');
  });
  areaSeries.tooltip.renderer = () => ({
    title: 'Wow!',
    color: 'yellow',
    backgroundColor: 'black',
  });

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
  lineSeries3.marker.formatter = (params) => {
    if (params.datum.selected) {
      return { fill: 'red' };
    }
    return {};
  };
  lineSeries3.addEventListener('nodeClick', (event) => {
    const e = event as unknown as LineSeriesNodeClickEvent;
    e.datum.selected = !e.datum.selected;
  });

  const barSeries = new BarSeries();
  // barSeries.fills = ['#41a9c9'];
  barSeries.fills = ['red', 'green', 'blue'];
  barSeries.xKey = 'category';
  // barSeries.yKeys = ['value3'];
  barSeries.yKeys = [['value1', 'value2']];
  barSeries.addEventListener('nodeClick', () => {
    window.alert('Bar rect clicked');
  });
  barSeries.tooltip.renderer = () => ({
    title: 'Wow!',
    color: 'yellow',
    backgroundColor: 'black',
  });
  // barSeries.tooltip.enabled = false;

  chart.series = [
    // areaSeries,
    barSeries,
    // lineSeries1,
    // lineSeries2,
    // lineSeries3
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
        selected: false,
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

  chart.tooltip.tracking = true;
  chart.addEventListener('seriesNodeClick', (event) => {
    console.log(event);
  });
}

function createDrilldownChart() {
  const xAxis = new CategoryAxis();
  xAxis.position = ChartAxisPosition.Bottom;

  const yAxis = new NumberAxis();
  yAxis.position = ChartAxisPosition.Left;

  const chart = new CartesianChart();
  chart.container = document.body;
  chart.width = 800;
  chart.height = 600;
  chart.axes = [xAxis, yAxis];

  const barSeries = new BarSeries();
  barSeries.fills = ['red', 'green', 'blue'];
  barSeries.xKey = 'category';
  barSeries.yKeys = [['value']];

  chart.series = [barSeries];

  chart.legend.enabled = false;

  chart.title = new Caption();
  chart.title.fontSize = 20;
  chart.title.color = 'gray';

  const originalCoffeeData = {
    name: 'Nespresso Original Coffees',
    values: [
      {
        category: 'Kazaar',
        value: 20,
      },
      {
        category: 'Ristretto',
        value: 10,
      },
      {
        category: 'Roma',
        value: 30,
      },
      {
        category: 'Livanto',
        value: 25,
      },
      {
        category: 'Arpeggio',
        value: 15,
      },
      {
        category: 'Volluto',
        value: 10,
      },
      {
        category: 'Cosi',
        value: 10,
      },
      {
        category: 'Vivalto',
        value: 20,
      },
    ],
  };

  const coffeeMachineTypeData = {
    name: 'Nespresso Machine Type',
    values: [
      {
        category: 'Original',
        value: 15,
        data: originalCoffeeData,
      },
      {
        category: 'Vertuo',
        value: 10,
      },
    ],
  };

  const productData = {
    name: 'Beverage Type',
    values: [
      {
        category: 'Coffee',
        value: 25,
        data: coffeeMachineTypeData,
      },
      {
        category: 'Tea',
        value: 10,
      },
      {
        category: 'Milk',
        value: 15,
      },
    ],
  };

  const dataStack: any[] = [];

  function setData(data: any, saveOldData = true) {
    if (data) {
      const oldData = barSeries.data;
      if (saveOldData && oldData && oldData.length) {
        dataStack.push({
          name: chart.title?.text,
          values: oldData,
        });
      }
      barSeries.data = data.values;

      if (chart.title) {
        chart.title.text = data.name;
      }
    }
  }

  setData(productData);

  chart.element.addEventListener('click', (event) => {
    // native DOM event
    if (event.shiftKey) {
      setData(dataStack.pop(), false);
    }
  });
}

function createDrilldownChartDeclaratively() {
  const originalCoffeeData = {
    name: 'Nespresso Original Coffees',
    values: [
      {
        category: 'Kazaar',
        value: 20,
      },
      {
        category: 'Ristretto',
        value: 10,
      },
      {
        category: 'Roma',
        value: 30,
      },
      {
        category: 'Livanto',
        value: 25,
      },
      {
        category: 'Arpeggio',
        value: 15,
      },
      {
        category: 'Volluto',
        value: 10,
      },
      {
        category: 'Cosi',
        value: 10,
      },
      {
        category: 'Vivalto',
        value: 20,
      },
    ],
  };

  const coffeeMachineTypeData = {
    name: 'Nespresso Machine Type',
    values: [
      {
        category: 'Original',
        value: 15,
        data: originalCoffeeData,
      },
      {
        category: 'Vertuo',
        value: 10,
      },
    ],
  };

  const productData = {
    name: 'Beverage Type',
    values: [
      {
        category: 'Coffee',
        value: 25,
        data: coffeeMachineTypeData,
      },
      {
        category: 'Tea',
        value: 10,
      },
      {
        category: 'Milk',
        value: 15,
      },
    ],
  };

  const chart = VkChart.create({
    container: document.body,
    series: [
      {
        type: 'column',
        xKey: 'category',
        yKeys: ['value'],
      },
    ],
    title: {},
    legend: {
      enabled: false,
    },
    listeners: {
      seriesNodeClick: function (event: any) {
        setData(event.datum.data);
      },
    },
  });

  const dataStack: any[] = [];

  function setData(data: any, saveOldData = true) {
    if (data) {
      const oldData = chart.data;
      if (saveOldData && oldData && oldData.length) {
        dataStack.push({
          name: chart.title?.text,
          values: oldData,
        });
      }
      chart.data = data.values;

      if (chart.title) {
        chart.title.text = data.name;
      }
    }
  }

  setData(productData);

  (chart.element as HTMLElement).addEventListener('click', (event) => {
    // native DOM event
    if (event.shiftKey) {
      setData(dataStack.pop(), false);
    }
  });
}

function createScatterChart() {
  const options = {
    container: document.body,
    autoSize: true,
    series: [
      {
        title: 'Series A',
        type: 'scatter',
        xKey: 'x',
        yKey: 'y',
        data: [
          {
            x: new Date('2020-08-12T05:00:00.000Z'),
            y: 11,
          },
          {
            x: new Date('2020-06-22T05:00:00.000Z'),
            y: 14,
          },
        ],
      },
      {
        title: 'Series B',
        type: 'scatter',
        xKey: 'x',
        yKey: 'y',
        data: [
          {
            x: new Date('2020-07-12T05:00:00.000Z'),
            y: 30,
          },
        ],
      },
    ],
    axes: [
      {
        position: 'bottom',
        type: 'time',
      },
      {
        position: 'left',
        type: 'number',
      },
    ],
  } as VkChartOptions;

  VkChart.create(options);
}

document.addEventListener('DOMContentLoaded', () => {
  createDrilldownChart();
  createScatterChart();
  createDrilldownChartDeclaratively();
  createMultiLineChart();
});
