import './app.css';
import { createButton, createSlider } from '../../utils/ui';
import { makeChartResizeable } from '../../utils/chart';
import { CategoryAxis } from '../../lib/chart/axis/categoryAxis';
import { ChartAxisPosition } from '../../lib/chart/chartAxis';
import { BandScale } from '../../lib/scale/bandScale';
import { NumberAxis } from '../../lib/chart/axis/numberAxis';
import { CartesianChart } from '../../lib/chart/cartesianChart';
import { Caption } from '../../lib/caption';
import { AreaSeries } from '../../lib/chart/series/cartesian/areaSeries';
import { find } from '../../lib/util/array';
import { Path } from '../../lib/scene/shape/path';
import { DropShadow } from '../../lib/scene/dropShadow';
import { Group } from '../../lib/scene/group';
import { LegendPosition } from '../../lib/chart/legend';
import { type VkCartesianChartOptions, VkChart, Arc } from '../../lib/main';

type Datum = {
  category: string;

  q1Budget: number;
  q2Budget: number;
  q3Budget: number;
  q4Budget: number;

  q1Actual: number;
  q2Actual: number;
  q3Actual: number;
  q4Actual: number;
};

type Datum2 = {
  xKey: string;
  yKey1: number;
  yKey2: number;
  yKey3: number;
};

const data: Datum[] = [
  {
    category: 'Coffee',

    q1Budget: 500,
    q2Budget: 500,
    q3Budget: 500,
    q4Budget: 500,

    q1Actual: 450,
    q2Actual: 560,
    q3Actual: 600,
    q4Actual: 700,
  },
  {
    category: 'Tea',

    q1Budget: 350,
    q2Budget: 400,
    q3Budget: 450,
    q4Budget: 500,

    q1Actual: 270,
    q2Actual: 380,
    q3Actual: 450,
    q4Actual: 520,
  },
  {
    category: 'Milk',

    q1Budget: 200,
    q2Budget: 180,
    q3Budget: 180,
    q4Budget: 180,

    q1Actual: 180,
    q2Actual: 170,
    q3Actual: 190,
    q4Actual: 200,
  },
];

const data3: Datum2[] = [
  {
    xKey: 'Jan',
    yKey1: 5,
    yKey2: 7,
    yKey3: -9,
  },
  {
    xKey: 'Feb',
    yKey1: 10,
    yKey2: -15,
    yKey3: 20,
  },
];

function generateData(n = 50, yKeyCount = 10) {
  const data: any[] = [];
  const yKeys: string[] = [];
  for (let i = 0; i < yKeyCount; i++) {
    yKeys[i] = 'Y' + (i + 1);
  }
  for (let i = 0; i < n; i++) {
    const datum: any = {
      category: 'A' + (i + 1),
    };
    yKeys.forEach((key) => {
      datum[key] = Math.random() * 10;
    });
    data.push(datum);
  }
  return {
    data,
    xKey: 'category',
    yKeys: yKeys,
  };
}

function makeNuclearChart() {
  document.body.appendChild(document.createElement('br'));

  const usaData = [
    null,
    null,
    null,
    null,
    null,
    6,
    11,
    32,
    110,
    235,
    369,
    640,
    1005,
    1436,
    2063,
    3057,
    4618,
    6444,
    9822,
    15468,
    20434,
    24126,
    27387,
    29459,
    31056,
    31982,
    32040,
    31233,
    29224,
    27342,
    26662,
    26956,
    27912,
    28999,
    28965,
    27826,
    25579,
    25722,
    24826,
    24605,
    24304,
    23464,
    23708,
    24099,
    24357,
    24237,
    24401,
    24344,
    23586,
    22380,
    21004,
    17287,
    14747,
    13076,
    12555,
    12144,
    11009,
    10950,
    10871,
    10824,
    10577,
    10527,
    10475,
    10421,
    10358,
    10295,
    10104,
    9914,
    9620,
    9326,
    5113,
    5113,
    4954,
    4804,
    4761,
    4717,
    4368,
    4018,
  ];
  const ussrData = [
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    5,
    25,
    50,
    120,
    150,
    200,
    426,
    660,
    869,
    1060,
    1605,
    2471,
    3322,
    4238,
    5221,
    6129,
    7089,
    8339,
    9399,
    10538,
    11643,
    13092,
    14478,
    15915,
    17385,
    19055,
    21205,
    23044,
    25393,
    27935,
    30062,
    32049,
    33952,
    35804,
    37431,
    39197,
    45000,
    43000,
    41000,
    39000,
    37000,
    35000,
    33000,
    31000,
    29000,
    27000,
    25000,
    24000,
    23000,
    22000,
    21000,
    20000,
    19000,
    18000,
    18000,
    17000,
    16000,
    15537,
    14162,
    12787,
    12600,
    11400,
    5500,
    4512,
    4502,
    4502,
    4500,
    4500,
  ];
  const startX = 1940;

  const data: { year: string; usa: number; ussr: number }[] = [];
  const n = Math.min(usaData.length, ussrData.length);
  for (let i = 0; i < n; i++) {
    data.push({
      year: String(startX + i),
      usa: usaData[i]!,
      ussr: ussrData[i]!,
    });
  }

  const xAxis = new CategoryAxis();
  xAxis.position = ChartAxisPosition.Bottom;
  (xAxis.scale as BandScale<string>).paddingInner = 1;
  (xAxis.scale as BandScale<string>).paddingOuter = 0;
  xAxis.label.rotation = 45;
  xAxis.label.fontSize = 10;
  const yAxis = new NumberAxis();
  yAxis.position = ChartAxisPosition.Left;

  const chart = new CartesianChart();
  chart.container = document.body;
  chart.width = 1200;
  chart.height = 400;
  chart.axes = [xAxis, yAxis];

  chart.title = new Caption();
  chart.title.text = 'US and USSR nuclear stockpiles';
  chart.title.fontWeight = 'bold';
  chart.title.fontSize = 20;
  chart.title.fontFamily = 'Verdana, sans-serif';

  chart.subtitle = new Caption();
  chart.subtitle.text = 'Sources: thebulletin.org & armscontrol.org';
  chart.subtitle.fontSize = 12;
  chart.subtitle.fontFamily = 'Verdana, sans-serif';
  chart.subtitle.color = 'rgba(0, 0, 0, 0.6)';

  chart.scene.canvas.element.style.border = '1px solid black';

  const usaArea = new AreaSeries();
  usaArea.yNames = ['USA'];
  usaArea.xKey = 'year';
  usaArea.yKeys = ['usa'];
  usaArea.data = data;
  usaArea.fills = ['red'];
  usaArea.strokes = ['maroon'];
  usaArea.tooltip.enabled = true;

  const ussrArea = new AreaSeries();
  ussrArea.yNames = ['USSR/Russia'];
  ussrArea.xKey = 'year';
  ussrArea.yKeys = ['ussr'];
  ussrArea.data = data;
  ussrArea.fills = ['blue'];
  ussrArea.strokes = ['darkblue'];
  ussrArea.tooltip.enabled = true;

  chart.addSeries(usaArea);
  chart.addSeries(ussrArea);

  document.body.appendChild(document.createElement('br'));
  createSlider('skip labels', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], (v) => {
    const xAxis = find(chart.axes, (axis) => axis.position === ChartAxisPosition.Bottom);
    if (xAxis) {
      xAxis.label.formatter = (params) => {
        return params.index % v === 0 ? params.value : '';
      };
    }
    chart.performLayout();
  });

  createSlider('stroke width', [1, 2, 4, 6, 8, 10], (v) => {
    usaArea.strokeWidth = v;
    ussrArea.strokeWidth = v;
  });

  createSlider('stroke opacity', [1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0], (v) => {
    usaArea.strokeOpacity = v;
    ussrArea.strokeOpacity = v;
  });
  createSlider('fill opacity', [1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0], (v) => {
    usaArea.fillOpacity = v;
    ussrArea.fillOpacity = v;
  });
}

function makeNuclearChartWithNumericX() {
  document.body.appendChild(document.createElement('br'));

  const usaData = [
    null,
    null,
    null,
    null,
    null,
    6,
    11,
    32,
    110,
    235,
    369,
    640,
    1005,
    1436,
    2063,
    3057,
    4618,
    6444,
    9822,
    15468,
    20434,
    24126,
    27387,
    29459,
    31056,
    31982,
    32040,
    31233,
    29224,
    27342,
    26662,
    26956,
    27912,
    28999,
    28965,
    27826,
    25579,
    25722,
    24826,
    24605,
    24304,
    23464,
    23708,
    24099,
    24357,
    24237,
    24401,
    24344,
    23586,
    22380,
    21004,
    17287,
    14747,
    13076,
    12555,
    12144,
    11009,
    10950,
    10871,
    10824,
    10577,
    10527,
    10475,
    10421,
    10358,
    10295,
    10104,
    9914,
    9620,
    9326,
    5113,
    5113,
    4954,
    4804,
    4761,
    4717,
    4368,
    4018,
  ];
  const ussrData = [
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    5,
    25,
    50,
    120,
    150,
    200,
    426,
    660,
    869,
    1060,
    1605,
    2471,
    3322,
    4238,
    5221,
    6129,
    7089,
    8339,
    9399,
    10538,
    11643,
    13092,
    14478,
    15915,
    17385,
    19055,
    21205,
    23044,
    25393,
    27935,
    30062,
    32049,
    33952,
    35804,
    37431,
    39197,
    45000,
    43000,
    41000,
    39000,
    37000,
    35000,
    33000,
    31000,
    29000,
    27000,
    25000,
    24000,
    23000,
    22000,
    21000,
    20000,
    19000,
    18000,
    18000,
    17000,
    16000,
    15537,
    14162,
    12787,
    12600,
    11400,
    5500,
    4512,
    4502,
    4502,
    4500,
    4500,
  ];
  const startX = 1940;

  const data: { year: number; usa: number; ussr: number }[] = [];
  const n = Math.min(usaData.length, ussrData.length);
  for (let i = 0; i < n; i++) {
    data.push({
      year: startX + i,
      usa: usaData[i]!,
      ussr: ussrData[i]!,
    });
  }

  const chart = VkChart.create({
    data,
    container: document.body,
    width: 900,
    height: 400,
    autoSize: false,
    title: {
      text: 'US and USSR nuclear stockpiles',
    },
    subtitle: {
      text: 'Sources: thebulletin.org & armscontrol.org',
    },
    axes: [
      {
        type: 'number',
        position: 'bottom',
        max: 2000,
        nice: false,
      },
      {
        type: 'number',
        position: 'left',
      },
    ],
    series: [
      {
        type: 'area',
        xKey: 'year',
        yKeys: ['usa'],
        yNames: ['USA'],
        fills: ['rgba(255, 0, 0, 0.9)'],
        strokes: ['maroon'],
        marker: {
          size: 8,
        },
        highlightStyle: {
          item: {
            fill: 'green',
            stroke: 'gold',
            strokeWidth: 3,
          },
          series: {
            dimOpacity: 0.3,
            strokeWidth: 4,
          },
        },
      },
      {
        type: 'area',
        xKey: 'year',
        yKeys: ['ussr'],
        yNames: ['USSR/Russia'],
        fills: ['rgba(0, 0, 255, 0.9)'],
        strokes: ['darkblue'],
        marker: {
          size: 8,
        },
        highlightStyle: {
          item: {
            fill: 'green',
            stroke: 'gold',
            strokeWidth: 2,
          },
          series: {
            dimOpacity: 0.3,
            strokeWidth: 12,
          },
        },
      },
    ],
    legend: {
      position: 'bottom',
    },
    navigator: {},
  });

  chart.scene.canvas.element.style.border = '1px solid black';
}

function makeAlienChart() {
  const xAxis = new CategoryAxis();
  xAxis.position = ChartAxisPosition.Bottom;
  (xAxis.scale as BandScale<string>).paddingInner = 1;
  (xAxis.scale as BandScale<string>).paddingOuter = 0;
  const yAxis = new NumberAxis();
  yAxis.position = ChartAxisPosition.Left;

  const chart = new CartesianChart();
  chart.container = document.body;
  chart.width = 800;
  chart.height = 500;
  chart.axes = [xAxis, yAxis];

  chart.title = new Caption();
  chart.title.text = 'Area 51 Charts';
  chart.title.fontWeight = 'bold';
  chart.title.fontSize = 16;
  chart.title.fontFamily = 'Verdana, sans-serif';

  chart.subtitle = new Caption();
  chart.subtitle.text = 'and flying saucers';
  chart.subtitle.fontSize = 12;
  chart.subtitle.fontFamily = 'Verdana, sans-serif';
  chart.subtitle.color = 'rgba(0, 0, 0, 0.6)';

  chart.scene.canvas.element.style.border = '1px solid black';

  function aliens() {
    const saucer = new Path();
    const fillShadow = new DropShadow();
    fillShadow.color = 'rgba(0,0,0,0.5)';
    fillShadow.xOffset = 5;
    fillShadow.yOffset = 5;
    fillShadow.blur = 10;
    saucer.fill = 'rgb(50, 50, 50)';
    saucer.translationY = 20;
    saucer.fillShadow = fillShadow;
    saucer.svgPath =
      'M90,31.5c0,-8.7 -12.4,-16 -29.8,-18.8c-1.3,-7.2 -7.6,-12.7 -15.2,-12.7c-7.6,0 -13.9,5.5 -15.2,12.7c-17.4,2.8 -29.8,10.1 -29.8,18.8c0,6.2 6.3,11.7 16.3,15.4l-4,6.6c-0.3,0.8 0.1,1.6 1.1,1.9c1,0.3 2,-0.1 2.3,-0.9l4,-6.5c6.8,2.1 14.8,3.3 23.6,3.5l0,9.5c0,0.8 0.7,1.5 1.5,1.5l0.6,0c0.8,0 1.5,-0.7 1.5,-1.5l0,-9.5c8.7,-0.2 16.8,-1.4 23.6,-3.5l4,6.5c0.3,0.8 1.4,1.2 2.3,0.9c0.9,-0.3 1.4,-1.2 1.1,-1.9l-4.1,-6.6c9.9,-3.7 16.2,-9.2 16.2,-15.4Zm-65,5c-2.8,0 -5,-2.2 -5,-5c0,-2.8 2.2,-5 5,-5c2.8,0 5,2.2 5,5c0,2.8 -2.2,5 -5,5Zm20,0c-2.8,0 -5,-2.2 -5,-5c0,-2.8 2.2,-5 5,-5c2.8,0 5,2.2 5,5c0,2.8 -2.2,5 -5,5Zm0,-15.3c-7.2,0 -14.5,-2 -14.5,-5.7c0,-8 6.5,-14.5 14.5,-14.5c8,0 14.5,6.5 14.5,14.5c0,3.8 -7.3,5.7 -14.5,5.7Zm15,10.3c0,-2.8 2.2,-5 5,-5c2.8,0 5,2.2 5,5c0,2.8 -2.2,5 -5,5c-2.8,0 -5,-2.2 -5,-5Z';

    let flyRight = true;

    let flying = true;
    chart.scene.canvas.element.addEventListener('click', (e: MouseEvent) => {
      const node = chart.scene.root!.pickNode(e.offsetX, e.offsetY);
      if (node === saucer) {
        const acceleration = 0.01;
        let speed = 1;
        function flyDownStep() {
          saucer.translationY += speed;
          speed += acceleration;
          if (saucer.translationY > 1000) {
            flying = false;
          }
          if (flying) {
            requestAnimationFrame(flyDownStep);
          }
        }
        flyDownStep();
      }
    });

    let lastShot = Date.now();

    function shootBeam(count = 5) {
      const arc = new Arc();
      arc.centerX = saucer.translationX + 50;
      arc.centerY = saucer.translationY + 46;
      arc.startAngle = Math.PI / 8;
      arc.endAngle = Math.PI - Math.PI / 8;
      arc.strokeWidth = 2;
      arc.lineCap = 'round';
      arc.fill = undefined;
      arc.strokeOpacity = 0.5;
      arc.stroke = 'skyblue';
      const shadow = new DropShadow();
      shadow.blur = 7;
      shadow.color = 'cyan';
      arc.strokeShadow = shadow;

      function animate() {
        arc.centerY += 7;
        arc.radiusX += 1;
        arc.radiusY += 1;
        arc.strokeOpacity -= 0.01;
        if (arc.strokeOpacity > 0) {
          requestAnimationFrame(animate);
        } else if (arc.parent) {
          arc.parent.removeChild(arc);
        }
      }
      requestAnimationFrame(animate);

      const now = Date.now();
      if (now - lastShot >= 1000 + Math.random() * 2000) {
        lastShot = now;
      }

      (chart.scene.root as Group)!.appendChild(arc);

      if (count > 1) {
        requestAnimationFrame(() =>
          requestAnimationFrame(() =>
            requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => shootBeam(count - 1))))
          )
        );
      }
    }

    setInterval(shootBeam, 1000);

    function step() {
      if (flyRight) {
        saucer.translationX += 1;
        if (saucer.translationX === 700) {
          flyRight = false;
        }
      } else {
        saucer.translationX -= 1;
        if (saucer.translationX === 0) {
          flyRight = true;
        }
      }
      saucer.translationY += Math.random() * 0.5 * (Math.random() > 0.5 ? 1 : -1);
      if (flying) {
        requestAnimationFrame(step);
      }
    }
    step();

    (chart.scene.root as Group)!.appendChild(saucer);
  }

  aliens();

  function addSeriesIf() {
    if (!chart.series.length) {
      chart.addSeries(areaSeries);
    }
  }

  const areaSeries = new AreaSeries();
  addSeriesIf();
  areaSeries.yNames = ['Q1', 'Q2', 'Q3', 'Q4'];
  areaSeries.xKey = 'category';
  areaSeries.yKeys = ['q1Actual'];
  areaSeries.data = data;
  areaSeries.tooltip.enabled = true;
  areaSeries.cursor = 'wait';
  areaSeries.label.enabled = true;

  document.body.appendChild(document.createElement('br'));

  createButton('Save Chart Image', () => {
    chart.scene.download('area-chart');
  });

  createButton('1 y-key', () => {
    addSeriesIf();
    areaSeries.xKey = 'category';
    areaSeries.yKeys = ['q1Actual'];
    areaSeries.data = data;
  });
  createButton('2 y-keys', () => {
    addSeriesIf();
    areaSeries.xKey = 'category';
    areaSeries.yKeys = ['q1Actual', 'q2Actual'];
    areaSeries.data = data;
  });
  createButton('3 y-keys', () => {
    addSeriesIf();
    areaSeries.xKey = 'category';
    areaSeries.yKeys = ['q1Actual', 'q2Actual', 'q3Actual'];
    areaSeries.data = data;
  });
  createButton('4 y-keys', () => {
    addSeriesIf();
    areaSeries.xKey = 'category';
    areaSeries.yKeys = ['q1Actual', 'q2Actual', 'q3Actual', 'q4Actual'];
    areaSeries.data = data;
  });

  createButton('Generate 10 points', () => {
    addSeriesIf();
    const config = generateData(10, 13);
    areaSeries.yNames = [
      'Roswell',
      'New Mexico',
      'Mantell',
      'Abduction',
      'Kecksburg',
      'Fire in the Sky',
      'Phoenix Lights',
      'Bob Lazar',
      'Fata Morgana',
      'Disclosure Project',
      'Steven M. Greer',
      'Conspiracy',
      'Men in Black',
    ];
    areaSeries.xKey = config.xKey;
    areaSeries.yKeys = config.yKeys;
    areaSeries.data = config.data;
    const xAxis = find(chart.axes, (axis) => axis.position === ChartAxisPosition.Bottom);
    if (xAxis) {
      xAxis.label.rotation = 0;
      xAxis.update();
    }
  });

  createButton('No data', () => {
    areaSeries.data = [];
  });
  createButton('Data set #3', () => {
    areaSeries.data = data3;
    areaSeries.xKey = 'xKey';
    areaSeries.yKeys = ['yKey1', 'yKey2', 'yKey3'];
  });

  createButton('Show tooltips', () => {
    areaSeries.tooltip.enabled = true;
  });
  createButton('Hide tooltips', () => {
    areaSeries.tooltip.enabled = false;
  });
  createButton('Custom tooltip class', () => {
    chart.tooltip.class = 'my-tooltip';
  });
  createButton('Use tooltip renderer', () => {
    areaSeries.tooltip.renderer = (params) => {
      return `<div style="background-color: #d4d1d6; padding: 5px;">
                X: ${params.datum[params.xKey]}<br>Y: ${params.datum[params.yKey]}
            </div>`;
    };
  });
  createButton('Use alt tooltip renderer', () => {
    areaSeries.tooltip.renderer = (params) => {
      return {
        title: 'I want to believe',
        content: `X: ${params.datum[params.xKey]}<br>Y: ${params.datum[params.yKey]}`,
        titleBackgroundColor: params.color,
      };
    };
  });
  createButton('Use tooltip format', () => {
    areaSeries.tooltip.format = 'Let me drink #{yValue} liters of #{xValue}';
  });
  createButton('Remove tooltip renderer', () => {
    areaSeries.tooltip.renderer = undefined;
    areaSeries.tooltip.renderer = undefined;
  });
  createButton('Remove all series', () => {
    chart.removeAllSeries();
  });
  createButton('Light theme', () => {
    const labelColor = 'black';

    const xAxis = find(chart.axes, (axis) => axis.position === ChartAxisPosition.Bottom);
    if (xAxis) {
      xAxis.label.color = labelColor;
      xAxis.gridStyle = [
        {
          stroke: 'rgb(219, 219, 219)',
          lineDash: [4, 2],
        },
      ];
      xAxis.update();
    }

    const yAxis = find(chart.axes, (axis) => axis.position === ChartAxisPosition.Left);
    if (yAxis) {
      yAxis.label.color = labelColor;
      yAxis.gridStyle = [
        {
          stroke: 'rgb(219, 219, 219)',
          lineDash: [4, 2],
        },
      ];
      yAxis.update();
    }

    chart.legend.item.label.color = labelColor;

    if (chart.title) {
      chart.title.color = labelColor;
    }
    if (chart.subtitle) {
      chart.subtitle.color = labelColor;
    }

    document.body.style.backgroundColor = 'white';
  });
  createButton('Dark theme', () => {
    const labelColor = 'rgb(221, 221, 221)';

    const xAxis = find(chart.axes, (axis) => axis.position === ChartAxisPosition.Bottom);
    if (xAxis) {
      xAxis.label.color = labelColor;
      xAxis.gridStyle = [
        {
          stroke: 'rgb(100, 100, 100)',
          lineDash: [4, 2],
        },
      ];
      xAxis.update();
    }

    const yAxis = find(chart.axes, (axis) => axis.position === ChartAxisPosition.Left);
    if (yAxis) {
      yAxis.label.color = labelColor;
      yAxis.gridStyle = [
        {
          stroke: 'rgb(100, 100, 100)',
          lineDash: [4, 2],
        },
      ];
      yAxis.update();
    }

    chart.background.fill = '#1e1e1e';
    chart.legend.item.label.color = labelColor;

    if (chart.title) {
      chart.title.color = labelColor;
    }
    if (chart.subtitle) {
      chart.subtitle.color = labelColor;
    }

    document.body.style.backgroundColor = '#1e1e1e';
  });
  createButton('No y-keys', () => {
    areaSeries.yKeys = [];
  });
  createButton('Show Legend', () => (chart.legend.enabled = true));
  createButton('Hide Legend', () => (chart.legend.enabled = false));

  createSlider('lineWidth', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], (v) => {
    areaSeries.strokeWidth = v;
  });
  createSlider('line color', ['white', 'yellow', '#1e1e1e'], (v) => {
    areaSeries.strokes = [v];
  });
  createSlider('legendPosition', ['right', 'bottom', 'left', 'top'] as LegendPosition[], (v) => {
    chart.legend.position = v;
  });
  createSlider('legend font family', ['sans-serif', 'serif', 'Snell Roundhand'], (v) => {
    chart.legend.item.label.fontFamily = v;
  });
  createSlider('normalizeTo', [NaN, 100, 500, 1], (v) => {
    if (v && chart.title) {
      chart.title.text = 'Normalize to any value';
      if (chart.subtitle) {
        chart.subtitle.enabled = false;
      }
    }
    areaSeries.normalizedTo = v;
  });
  createSlider('marker size', [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26], (v) => {
    areaSeries.marker.enabled = true;
    areaSeries.marker.shape = 'circle';
    areaSeries.marker.size = v;
  });

  makeChartResizeable(chart);
}

function makeNumberYAxisArea() {
  const xAxis = new CategoryAxis();
  xAxis.position = ChartAxisPosition.Bottom;
  const yAxis = new NumberAxis();
  yAxis.position = ChartAxisPosition.Left;
  yAxis.max = 3;

  const chart = new CartesianChart();
  chart.container = document.body;
  chart.width = 600;
  chart.height = 400;
  chart.axes = [xAxis, yAxis];

  chart.scene.canvas.element.style.border = '1px solid black';

  const series = new AreaSeries();
  series.xKey = 'x';
  series.yKeys = ['y'];
  series.data = [
    {
      x: 'A',
      y: 2,
    },
    {
      x: 'B',
      y: null,
    },
    {
      x: 'C',
      y: 2,
    },
    {
      x: 'D',
      y: 2,
    },
    {
      x: 'E',
      y: 2,
    },
  ];
  series.fills = ['red'];
  series.strokes = ['maroon'];
  series.tooltip.enabled = true;

  chart.addSeries(series);
}

function makeCategoryYAxisArea() {
  const xAxis = new CategoryAxis();
  xAxis.position = ChartAxisPosition.Bottom;
  const yAxis = new CategoryAxis();
  yAxis.position = ChartAxisPosition.Left;

  const chart = new CartesianChart();
  chart.container = document.body;
  chart.width = 600;
  chart.height = 400;
  chart.axes = [xAxis, yAxis];

  chart.scene.canvas.element.style.border = '1px solid black';

  const series = new AreaSeries();
  series.xKey = 'x';
  series.yKeys = ['y'];
  series.data = [
    {
      x: 'A',
      y: 'X',
    },
    {
      x: 'B',
      y: null,
    },
    {
      x: 'C',
      y: 'Y',
    },
    {
      x: 'D',
      y: 'Z',
    },
    {
      x: 'E',
      y: 'Y',
    },
  ];
  series.fills = ['red'];
  series.strokes = ['maroon'];
  series.tooltip.enabled = true;

  chart.addSeries(series);
}

function makeStackedArea() {
  var options: any;
  const chart = VkChart.create(
    (options = {
      container: document.body,
      autoSize: false,
      width: 800,
      height: 400,
      data: [
        {
          x: 1,
          y1: 5,
          y2: 3,
          y3: 10,
        },
        {
          x: null,
          y1: 7,
          y2: 4,
          y3: 15,
        },
        {
          x: 6,
          y1: 9,
          y2: 4,
          y3: 16,
        },
        {
          x: 7,
          y1: 8,
          y2: 5,
          y3: 17,
        },
        {
          x: 8,
          y1: 6,
          y2: 6,
          y3: 18,
        },
        {
          x: 12,
          y1: 4,
          y2: 5,
          y3: 19,
        },
      ],
      series: [
        {
          type: 'area',
          xKey: 'x',
          yKeys: ['y1', 'y2'],
          marker: {
            size: 10,
          },
          highlightStyle: {
            item: {},
            series: {
              enabled: true,
              dimOpacity: 0.1,
              strokeWidth: 6,
            },
          },
        },
        {
          type: 'scatter',
          xKey: 'x',
          yKey: 'y3',
          marker: {
            size: 10,
            strokeWidth: 1,
          },
          highlightStyle: {
            item: {
              strokeWidth: 4,
            },
            series: {
              enabled: true,
              dimOpacity: 0.1,
              strokeWidth: 2,
            },
          },
        },
      ],
      axes: [
        {
          type: 'number',
          position: 'top',
          max: 7,
        },
        {
          type: 'number',
          position: 'right',
        },
      ],
      // legend: {
      //     spacing: 200
      // },
      navigator: {},
    } as VkCartesianChartOptions)
  );

  chart.scene.canvas.element.style.border = '1px solid black';
  document.body.appendChild(document.createElement('br'));

  makeChartResizeable(chart);

  createButton('Toggle area/column', () => {
    options.series[0].type = options.series[0].type === 'column' ? 'area' : 'column';
    VkChart.update(chart, options);
  });

  createButton('Update data', () => {
    options.data.forEach((datum: any) => {
      (datum.y1 = Math.random() * 50 + 20), (datum.y2 = Math.random() * 30 + 10);
      datum.y3 = Math.random() * 70 + 20;
    });
    VkChart.update(chart, options);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  makeAlienChart();
  makeNuclearChart();
  makeNumberYAxisArea();
  makeCategoryYAxisArea();
  makeNuclearChartWithNumericX();
  makeStackedArea();
});
