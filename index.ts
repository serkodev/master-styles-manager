import { Styles } from '@master/styles';

import Shorthand from './shorthand';
import CSSProperties from './css-properties';

const args = process.argv.slice(2);

if (args[0] == '-s') {
    const shorthandSet = {};
    Styles.forEach(style => {
        Shorthand(style).forEach(name => shorthandSet[name] = true); // filter same
    });
    console.dir(Object.keys(shorthandSet), {maxArrayLength: null});
}

if (args[0] == '-c') {
    const cssProperty = new CSSProperties();
    Styles
        // .filter(style => style.key == 'overflow') // debug
        .forEach(style => { cssProperty.process(style); });
    console.dir(cssProperty.mapper, {maxArrayLength: null, depth: null});
}
