// This expands all reactive properties in the codebase into plain TypeScript.
// When Stage 3 decorators are well supported, this will no longer be needed.
// This is not a bulletproof solution like a full blown parser, but it's easy to understand, standalone,
// and works in almost all cases. Edge cases can be fixed manually with minimal effort.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const testText = `
class Hello extends Observable {
  regularClassField = 7;
  // @reactive is a decorator, but we shouldn't process any comments.
  /** @reactive
   * @reactive
   */
  @reactive('change') domain?: [number, number];
  @reactive('change', 'layoutChange', 'tag') foo = 'oof';
  @reactive('change') bar: string = 'rab';
  @reactive() xyz: number = 42;
  @reactive() yes = true;
  @reactive() no = false;
  @reactive() optional?: string | number = '55';
  @reactive() anotherOptional: string | number | undefined = '69';
  @reactive('change') shape: string | (new () => Marker) = Circle;
  @reactive('dataChange') formatter?: (params: { value: any }) => string;

  testMethod(): string {
    return 'one, two, three';
  }

  anotherTestMethod() {
    this.testMethod();
  }
}
`;

const expectedOutput = `
class Hello extends Observable {
  regularClassField = 7;
  // @reactive is a decorator, but we shouldn't process any comments.
  /** @reactive
   * @reactive
   */
  private _domain: [number, number] | undefined;
  set domain(value: [number, number] | undefined) {
    const oldValue = this._domain;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._domain = value;
      this.notifyPropertyListeners('domain', oldValue, value);
      this.notifyEventListeners(['change']);
    }
  }
  get domain(): [number, number] | undefined {
    return this._domain;
  }

  private _foo: string = 'oof';
  set foo(value: string) {
    const oldValue = this._foo;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._foo = value;
      this.notifyPropertyListeners('foo', oldValue, value);
      this.notifyEventListeners(['change', 'layoutChange', 'tag']);
    }
  }
  get foo(): string {
    return this._foo;
  }

  private _bar: string = 'rab';
  set bar(value: string) {
    const oldValue = this._bar;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._bar = value;
      this.notifyPropertyListeners('bar', oldValue, value);
      this.notifyEventListeners(['change']);
    }
  }
  get bar(): string {
    return this._bar;
  }

  private _xyz: number = 42;
  set xyz(value: number) {
    const oldValue = this._xyz;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._xyz = value;
      this.notifyPropertyListeners('xyz', oldValue, value);
    }
  }
  get xyz(): number {
    return this._xyz;
  }

  private _yes: boolean = true;
  set yes(value: boolean) {
    const oldValue = this._yes;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._yes = value;
      this.notifyPropertyListeners('yes', oldValue, value);
    }
  }
  get yes(): boolean {
    return this._yes;
  }

  private _no: boolean = false;
  set no(value: boolean) {
    const oldValue = this._no;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._no = value;
      this.notifyPropertyListeners('no', oldValue, value);
    }
  }
  get no(): boolean {
    return this._no;
  }

  private _optional: string | number | undefined = '55';
  set optional(value: string | number | undefined) {
    const oldValue = this._optional;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._optional = value;
      this.notifyPropertyListeners('optional', oldValue, value);
    }
  }
  get optional(): string | number | undefined {
    return this._optional;
  }

  private _anotherOptional: string | number | undefined = '69';
  set anotherOptional(value: string | number | undefined) {
    const oldValue = this._anotherOptional;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._anotherOptional = value;
      this.notifyPropertyListeners('anotherOptional', oldValue, value);
    }
  }
  get anotherOptional(): string | number | undefined {
    return this._anotherOptional;
  }

  private _shape: string | (new () => Marker) = Circle;
  set shape(value: string | (new () => Marker)) {
    const oldValue = this._shape;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._shape = value;
      this.notifyPropertyListeners('shape', oldValue, value);
      this.notifyEventListeners(['change']);
    }
  }
  get shape(): string | (new () => Marker) {
    return this._shape;
  }

  private _formatter: ((params: { value: any }) => string) | undefined;
  set formatter(value: ((params: { value: any }) => string) | undefined) {
    const oldValue = this._formatter;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._formatter = value;
      this.notifyPropertyListeners('formatter', oldValue, value);
      this.notifyEventListeners(['dataChange']);
    }
  }
  get formatter(): ((params: { value: any }) => string) | undefined {
    return this._formatter;
  }


  testMethod(): string {
    return 'one, two, three';
  }

  anotherTestMethod() {
    this.testMethod();
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
  // The closing parenthesis in @reactive(...)
  const closeParen = line.indexOf(')', reactiveIdx);
  // The semicolon or the EOL
  const semiIdx = line.lastIndexOf(';');
  const semiOrEOL = semiIdx >= 0 ? semiIdx : line.length - 1;
  // The index of the initializing assignment operator
  const assignIdx = line.lastIndexOf('=');
  // We might find the `=`, but it can come from a function type.
  // For example: @reactive() foo?: () => number;
  // fnType will be true if that's the case.
  const fnType = assignIdx >= 0 && line.indexOf('>', assignIdx) === assignIdx + 1;
  const assignSemiOrEOL = assignIdx >= 0 && !fnType ? assignIdx : semiOrEOL;
  // field (key) name and type delimiter
  const colon = line.indexOf(':', closeParen);
  // optional type delimiter
  const optional = line.indexOf('?:', closeParen);
  // the list of events to fire when a new property value is set
  const events = line.substring(reactiveIdx + reactiveLen, closeParen)
    .split(',')
    .map(event => event.trim())
    .filter(event => Boolean(event))
    .map(event => event.substring(1, event.length - 1));

  const key = line.substring(closeParen + 1, optional >= 0 ? optional : colon >= 0 ? colon : assignSemiOrEOL).trim();
  const explicitType = colon >= 0 ? line.substring(colon, assignSemiOrEOL).trim() : '';
  const value = line.substring(assignSemiOrEOL + 1, semiOrEOL).trim();

  const eventsStrings = events.length ? [
    `    this.notifyEventListeners([${events.map(event => `'${event}'`).join(', ')}]);`
  ] : [];

  const orUndefined = optional >= 0 ? ' | undefined' : '';
  const type = explicitType
    ? explicitType.lastIndexOf('| undefined') >= 0
      ? explicitType
      : fnType
        ? `: (${explicitType.substring(2)})${orUndefined}`
        : `${explicitType}${orUndefined}`
    : (value[0] === "'" || value[0] === '"')
      ? `: string${orUndefined}`
      : !isNaN(parseFloat(value))
        ? `: number${orUndefined}`
        : value === 'true' || value === 'false'
          ? ': boolean'
          : ': any';

  const privateKey = `_${key}`;
  const assignValue = assignIdx >= 0 && !fnType ? ` = ${value}` : '';
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
  ].map(line => {
    const indentedLine = `${indent}${line}`;
    if (indentedLine.trim() === '') {
      return '';
    }
    return indentedLine;
  }).join('\n');

  return strings;
}

export function processText(lines) {
  let comment = 0;
  return lines.map(line => {
    const trimmedLine = line.trimStart();
    if (trimmedLine.startsWith('/*')) {
      comment += 1;
    } else if (trimmedLine.startsWith('*/')) {
      comment = Math.max(0, comment - 1);
    }
    if (comment > 0) {
      return line;
    }
    return expandReactiveProperty(line, getIndent(line));
  }).join('\n');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getAllFiles(dirPath, arrayOfFiles = [], ext = '.ts') {
  const files = fs.readdirSync(dirPath);
  files.forEach(file => {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles, ext);
    } else if (!ext || path.extname(file) === ext) {
      arrayOfFiles.push(path.join(__dirname, dirPath, '/', file));
    }
  });

  return arrayOfFiles;
}

function getChangedFiles(ext = '.ts') {
  ext = ext && `-- '***${ext}'`;
  const command = `{ git diff --name-only ${ext}; git diff --name-only --staged ${ext}; } | sort | uniq`;
  const diffOutput = execSync(command).toString();

  return diffOutput.split('\n').filter(Boolean);
}

function transformFiles() {
  // const files = getAllFiles('./lib');
  const files = getChangedFiles();

  files.map(file => {
    console.log('Processing...', file);
    try {
      const text = fs.readFileSync(file, 'utf8');
      const lines = text.split('\n');

      const processedText = processText(lines);

      if (processedText !== text) {
        try {
          fs.writeFileSync(file, processedText);
        } catch (err) {
          console.error('Error writing file:', err);
        }
      }
    } catch (err) {
      console.error('Error reading file:', err);
    }
  });
  console.log('All files processed.');
}

function test() {
  const output = processText(testText.split('\n'));
  if (output === expectedOutput) {
    console.info('Tests passed.');
  } else {
    console.error('Tests failed.');
    const outputLines = output.split('\n');
    const expectedOutputLines = expectedOutput.split('\n');
    const min = Math.min(outputLines.length, expectedOutputLines.length);
    const maxLineNumberLength = Math.ceil(Math.log10(min));
    const radius = 3;
    for (let i = 0; i < min; i++) {
      if (outputLines[i] !== expectedOutputLines[i]) {
        console.error(`Line #${i} is different:\nExpected:\n'${expectedOutputLines[i]}'\nActual:\n'${outputLines[i]}'`);
        const start = Math.max(0, i - radius);
        const end = Math.min(min, i + radius);
        const outputContext = outputLines
          .slice(start, end)
          .map((line, i) => addLineNumber(line, start + i, maxLineNumberLength));
        const expectedOutputContext = expectedOutputLines
          .slice(start, end)
          .map((line, i) => addLineNumber(line, start + i, maxLineNumberLength));
        console.log('Expected context:\n', expectedOutputContext);
        console.log('Actual context:\n', outputContext);
        break;
      }
    }
    if (outputLines.length > min) {
      console.log('Actual output is longer than expected. Extra lines:\n', outputLines.slice(min)
        .map((line, i) => addLineNumber(line, min + i, maxLineNumberLength)));
    } else if (expectedOutputLines.length > min) {
      console.log('Expected output is longer than actual. Extra lines:\n', expectedOutputLines.slice(min)
        .map((line, i) => addLineNumber(line, min + i, maxLineNumberLength)));
    }
  }
}

function addLineNumber(line, number, maxLength) {
  const pad = String(number).padStart(maxLength, ' ');
  return `${pad} ${line}`;
}

// test();
transformFiles();
