// This expands all reactive properties in the codebase into plain TypeScript.
// When Stage 3 decorators are well supported, this will no longer be needed.
// This is not a bulletproof solution like a full blown parser, but it's easy to understand, standalone,
// and works in almost all cases. Edge cases can be fixed manually with minimal effort.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const reactive = '@reactive(';
const reactiveLen = reactive.length;

function getIndent(line) {
  const trimmed = line.trimStart();
  return line.substring(0, line.length - trimmed.length);
}

const primitiveTypes = [
  ': number', ': string', ': boolean',
  ': number | undefined', ': string | undefined', ': boolean | undefined'
];

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
    .filter(Boolean)
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

  const objectCheck = !primitiveTypes.some(t => t === type)
    ? ` || (typeof value === 'object' && value !== null)`
    : '';

  const privateKey = `_${key}`;
  const assignValue = assignIdx >= 0 && !fnType ? ` = ${value}` : '';
  const strings = [
    `private ${privateKey}${type}${assignValue};`,
    `set ${key}(value${type}) {`,
    `  const oldValue = this.${privateKey};`,
    `  if (value !== oldValue${objectCheck}) {`,
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

export function transformText(lines) {
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

  if (!files.length) {
    console.log('No file changes detected.');
    return;
  }

  files.map(file => {
    try {
      const text = fs.readFileSync(file, 'utf8');
      const lines = text.split('\n');

      const transformedText = transformText(lines);

      if (transformedText !== text) {
        try {
          fs.writeFileSync(file, transformedText);
        } catch (err) {
          console.error('Error writing file:', err);
        }
      }
    } catch (err) {
      console.error('Error reading file:', err);
    }
  });
  console.log('Redecoration complete!');
}

transformFiles();
