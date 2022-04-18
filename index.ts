import * as fs from 'fs';
import * as path from 'path';
import Shorthand from './shorthand';

(async () => {
    const td = './styles/src';
    const files = fs.readdirSync(td)
        .filter(file => file.endsWith('.ts'))
        // .filter(file => ['animation.ts', 'spacing.ts'].indexOf(file) !== -1) // debug
        .map(file => './' + path.join(td, file.slice(0, -3)));

    const imports = await Promise.all(files.map(item => import(item)));
    const styles = imports.reduce((all, exports) => {
        const exportStyles = Object.values<unknown>(exports).filter(style => typeof style['match'] == 'function');
        return all.concat(...exportStyles);
    }, []);

    const shorthands = styles.reduce((all, style) => {
        Shorthand(style).forEach(sh => all[sh] = true); // filter same
        return all;
    }, {});

    Object.keys(shorthands).forEach(s => console.log(s));
})();
