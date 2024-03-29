import { Scene } from '../../lib/scene/scene';
import { Group } from '../../lib/scene/group';
import { ClipRect } from '../../lib/scene/clipRect';
import { Arc, ArcType } from '../../lib/scene/shape/arc';
import { Text } from '../../lib/scene/shape/text';
import { Line } from '../../lib/scene/shape/line';
import { Selection } from '../../lib/scene/selection';

function nextFrame() {
  return new Promise((resolve) => {
    requestAnimationFrame(resolve);
  });
}

function delay() {
  return new Promise((resolve) => {
    setTimeout(resolve, 3000);
  }).then(nextFrame);
}

document.addEventListener('DOMContentLoaded', () => {
  testClipRect();
  testClipRectSelection();
});

function testClipRect() {
  const scene = new Scene();
  scene.resize(500, 500);
  scene.container = document.body;
  const rootGroup = new Group();

  const clipRect = new ClipRect();
  clipRect.x = 50;
  clipRect.y = 50;
  clipRect.width = 200;
  clipRect.height = 200;

  const label = new Text();
  label.text = 'Spectacular';
  label.fontSize = 20;
  label.fontFamily = 'Verdana';
  label.textAlign = 'right';
  label.x = 140;
  label.y = 200;

  const arc1 = new Arc();
  arc1.centerX = 50;
  arc1.centerY = 50;
  arc1.radiusX = 50;
  arc1.radiusY = 50;
  arc1.type = ArcType.Chord;
  arc1.fill = 'red';

  const arc2 = new Arc();
  arc2.centerX = 200;
  arc2.centerY = 100;
  arc2.radiusX = 100;
  arc2.radiusY = 100;
  arc2.fill = 'lime';
  arc2.type = ArcType.Chord;
  arc2.opacity = 0.7;

  const hLine = new Line();
  hLine.x1 = 0;
  hLine.y1 = 150;
  hLine.x2 = 300;
  hLine.y2 = 150;

  const vLine = new Line();
  vLine.x1 = 150;
  vLine.y1 = 0;
  vLine.x2 = 150;
  vLine.y2 = 300;

  clipRect.append([arc1, label, hLine, vLine]);
  rootGroup.append([clipRect, arc2]);

  scene.root = rootGroup;

  delay()
    .then(() => {
      clipRect.x += 10;
      clipRect.y += 10;
    })
    .then(delay)
    .then(() => {
      rootGroup.translationX = 100;
      rootGroup.translationY = 100;
    })
    .then(delay)
    .then(() => {
      clipRect.enabled = false;
    })
    .then(delay)
    .then(() => {
      clipRect.enabled = true;
    });
}

function testClipRectSelection() {
  const scene = new Scene();
  scene.resize(500, 500);
  scene.container = document.body;
  const rootGroup = new Group();
  scene.root = rootGroup;

  const clipSelection = Selection.select(rootGroup)
    .append(ClipRect)
    .each((clip) => {
      clip.x = 40;
      clip.y = 50;
      clip.width = 200;
      clip.height = 200;
    });

  clipSelection.append(Text).each((label) => {
    label.text = 'Spectacular';
    label.fontSize = 20;
    label.fontFamily = 'Verdana';
    label.textAlign = 'right';
    label.x = 140;
    label.y = 200;
  });

  clipSelection.append(Arc).each((arc) => {
    arc.centerX = 200;
    arc.centerY = 100;
    arc.radiusX = 100;
    arc.radiusY = 100;
    arc.startAngle = 0;
    arc.endAngle = Math.PI * 2;
    arc.fill = 'lime';
    arc.opacity = 0.7;
    arc.type = ArcType.Chord;
  });
}
