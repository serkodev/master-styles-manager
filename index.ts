import * as fs from 'fs';
import * as path from 'path';
import { ShorthandList } from './shorthand';

(async () => {
    const td = './styles/src';
    const files = fs.readdirSync(td)
        .filter(file => file.endsWith('.ts'))
        // .filter(file => ['animation.ts', 'spacing.ts'].indexOf(file) !== -1) // debug
        .map(file => './' + path.join(td, file.slice(0, -3)));

    const shorthand = new ShorthandList();
    await Promise.all(files.map(item => shorthand.parse(item)));
})();
