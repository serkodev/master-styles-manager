import 'css.escape';
import { Transform } from './styles/src/transform';
import CSSProperties from './css-properties';
import { Display } from './styles/src/display';

// CSSProperties(TransformStyle);

// const matches = Transform.match('translate(123)');
// if (!matches) throw 'not matches sample';

// const b = new Transform('translate(123)', matches);

// console.log(b);

const name = 'block';
const matches = Display.match(name);
if (!matches) throw 'not matches sample';
const b = new Display(name, matches);
console.log(Display, b);

/*
TransformStyle {
  name: 'translate(123)',
  matching: { origin: 'matches' },
  at: {},
  prioritySelectorIndex: -1,
  prefix: '',
  value: 'translate(7.6875rem)',
  unit: '',
  selector: '',
  text: '.translate\\(123\\){transform:translate(7.6875rem)}',
  order: 0
}
*/

/*
user-select:0 UserSelectStyle {
  name: 'user-select:0',
  matching: { origin: 'matches' },
  at: {},
  prioritySelectorIndex: -1,
  prefix: 'user-select:',
  value: 0,
  unit: 'rem',
  selector: '',
  text: '.user-select\\:0{user-select:0rem;-webkit-user-select:0rem}',
  order: 0
}
*/
