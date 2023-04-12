import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const testLine = `@reactive('hello','100','MIT') foo = 'blah';`;

const testFile = `
class Hello extends Observable {
  @reactive('change') domain?: [number, number];
  @reactive('hello','100','MIT') foo = 'blah';
  @reactive('change') bar: string = 'boo';
  @reactive() bar: number = 42;
  @reactive() optional?: string | number = '55';
  @reactive() anotherOptional: string | number | undefined = '69';
  @reactive('change') shape: string | (new () => Marker) = Circle;
  @reactive('dataChange') formatter?: (params: { value: any }) => string;

  getName(): string {
    return 'hahaha';
  }
}
`;

const reactive = '@reactive(';
const reactiveLen = reactive.length;

function getIndent(line) {
  const trimmed = line.trimStart(line);
  return line.substring(0, line.length - trimmed.length);
}

function expandReactiveProperty(line, indent = '') {
  const reactiveIdx = line.indexOf(reactive);
  if (!(reactiveIdx >= 0) || line.trimStart().indexOf('//') === 0) {
    return line;
  }
  const closeParen = line.indexOf(')', reactiveIdx);
  const semi = line.lastIndexOf(';');
  const assignIdx = line.lastIndexOf('=');
  const isArrow = assignIdx >= 0 && line.indexOf('>', assignIdx) === assignIdx + 1;
  const assign = assignIdx >= 0 && !isArrow ? assignIdx : semi;
  const colon = line.indexOf(':', closeParen);
  const optional = line.indexOf('?:', closeParen);
  const events = line.substring(reactiveIdx + reactiveLen, closeParen)
    .split(',')
    .map(event => event.trim())
    .filter(event => Boolean(event))
    .map(event => event.substring(1, event.length - 1));

  const key = line.substring(closeParen + 1, optional >= 0 ? optional : colon >= 0 ? colon : assign).trim();
  const explicitType = colon >= 0 ? line.substring(colon, assign).trim() : '';
  console.log('explicitType', explicitType);
  const value = assignIdx ? line.substring(assign + 1, semi).trim() : '';

  const eventsStrings = events.length ? [
    `    this.notifyEventListeners([${events.map(event => `'${event}'`).join(', ')}]);`
  ] : [];

  const orUndefined = optional >= 0 ? ' | undefined' : '';
  const type = assignIdx
    ? explicitType
      ? explicitType.lastIndexOf('| undefined') >= 0
        ? explicitType
        : isArrow ? `: (${explicitType.substring(2)})${orUndefined}` : `${explicitType}${orUndefined}`
      : (value[0] === "'" || value[0] === '"')
        ? `: string${orUndefined}`
        : !isNaN(parseFloat(value))
          ? `: number${orUndefined}`
          : ': any'
    : ': any';

  const privateKey = `_${key}`;
  const assignValue = assignIdx >= 0 && !isArrow ? ` = ${value}` : '';
  const strings = [
    `private ${privateKey}${type}${assignValue};`,
    `set ${key}(value${type}) {`,
    `  const oldValue = this.${privateKey};`,
    `  if (value !== oldValue || (typeof value === 'object' && value !== null)) {`,
    `    this.${privateKey} = value;`,
    `    this.notifyPropertyListeners('${key}', oldValue, value);`,
    ...eventsStrings,
    `  }`,
    `}`,
    `get ${key}()${type} {`,
    `  return this.${privateKey};`,
    `}`,
    ``
  ].map(line => `${indent}${line}`).join('\n');

  return strings;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getAllFiles(dirPath, arrayOfFiles) {
  arrayOfFiles = arrayOfFiles || [];

  const files = fs.readdirSync(dirPath);

  files.forEach(function(file) {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(__dirname, dirPath, '/', file));
    }
  });

  return arrayOfFiles;
}

function convertAllFiles() {
  const files = getAllFiles('./lib');

  files.map(file => {
    console.log('Processing...', file);
    try {
      const data = fs.readFileSync(file, 'utf8');
      const lines = data.split('\n');

      const newData = lines.map(line => expandReactiveProperty(line, getIndent(line))).join('\n');

      if (newData !== data) {
        try {
          fs.writeFileSync(file, newData);
        } catch (err) {
          console.error('Error writing file:', err);
        }
      }
    } catch (err) {
      console.error('Error reading file:', err);
    }
  });
}

// console.log(expandReactiveProperty(testLine));
// console.log(testFile.split('\n').map(line => expandReactiveProperty(line, getIndent(line))).join('\n'));
// console.log(getAllFiles('./lib'));
convertAllFiles();

console.log('Done!');