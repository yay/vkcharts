import value from './value';

export default function (a: any, b: any): (t: number) => object {
  const i: any = {};
  const c: any = {};

  if (a === null || typeof a !== 'object') {
    a = {};
  }
  if (b === null || typeof b !== 'object') {
    b = {};
  }

  let k: string;
  for (k in b) {
    if (k in a) {
      i[k] = value(a[k], b[k]);
    } else {
      c[k] = b[k];
    }
  }

  return (t) => {
    for (k in i) {
      c[k] = i[k](t);
    }
    return c;
  };
}
