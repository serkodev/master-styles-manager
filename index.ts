import { Style } from '@master/style';
import * as fs from 'fs';
import * as path from 'path';

import Shorthand from './shorthand';

(async () => {
    const td = './styles/src';
    const files = fs.readdirSync(td)
        .filter(file => file.endsWith('.ts'))
        // .filter(file => ['animation.ts', 'spacing.ts'].indexOf(file) !== -1) // debug
        .map(file => './' + path.join(td, file.slice(0, -3)));

    const imports: Array<{ [key: string]: typeof Style}>  = await Promise.all(files.map(item => import(item)));
    const styles = imports.reduce((all, exports) => {
        const exportStyles = Object.values(exports).filter(style => typeof style.match == 'function');
        return all.concat(...exportStyles);
    }, [] as Array<typeof Style>);

    const shorthandSet = {};
    styles.forEach(style => {
        Shorthand(style).forEach(sh => shorthandSet[sh] = true); // filter same
    });
    console.dir(Object.keys(shorthandSet), {'maxArrayLength': null});
})();
