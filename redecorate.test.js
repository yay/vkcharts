import { transformText } from './redecorate.js';

const testText = `
class Hello extends Observable {
  regularClassField = 7;
  // @reactive is a decorator, but we shouldn't transform any comments.
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
  @reactive() obj = {};
  @reactive() point: Point = { x: 1, y: 2 };

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
  // @reactive is a decorator, but we shouldn't transform any comments.
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
    if (value !== oldValue) {
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
    if (value !== oldValue) {
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
    if (value !== oldValue) {
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
    if (value !== oldValue) {
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
    if (value !== oldValue) {
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

  private _obj: any = {};
  set obj(value: any) {
    const oldValue = this._obj;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._obj = value;
      this.notifyPropertyListeners('obj', oldValue, value);
    }
  }
  get obj(): any {
    return this._obj;
  }

  private _point: Point = { x: 1, y: 2 };
  set point(value: Point) {
    const oldValue = this._point;
    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
      this._point = value;
      this.notifyPropertyListeners('point', oldValue, value);
    }
  }
  get point(): Point {
    return this._point;
  }


  testMethod(): string {
    return 'one, two, three';
  }

  anotherTestMethod() {
    this.testMethod();
  }
}
`;

function test() {
  const output = transformText(testText.split('\n'));
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

test();