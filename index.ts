import { Style } from '@master/style';
import * as fs from 'fs';
import * as path from 'path';

import Shorthand from './shorthand';

type fileImport = {
    file: string,
    exports: { [key: string]: typeof Style}
}

type fileStyle = {
    file: string,
    export: string,
    style: typeof Style
}

(async () => {
    const td = './styles/src';
    const files = fs.readdirSync(td)
        .filter(file => file.endsWith('.ts'))
        // .filter(file => ['animation.ts', 'spacing.ts'].indexOf(file) !== -1) // debug
        .map(file => './' + path.join(td, file.slice(0, -3)));

    // load and import all styles
    const imports: fileImport[] = await Promise.all(files.map(async item => {
        return {
            file: item,
            exports: await import(item)
        };
    }));

    // build styles list with export name and file
    const styles = imports.reduce((all, fileImport) => {
        for (const [exp, style] of Object.entries(fileImport.exports)) {
            if (typeof style.match === 'function') {
                all.push({
                    file: fileImport.file,
                    export: exp,
                    style: style
                });
            }
        }
        return all;
    }, [] as fileStyle[]);

    const shorthandSet = {};
    styles.forEach(style => {
        Shorthand(style).forEach(sh => shorthandSet[sh] = true); // filter same
    });
    console.dir(Object.keys(shorthandSet), {'maxArrayLength': null});
})();
