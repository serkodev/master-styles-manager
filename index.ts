import * as fs from 'fs';
import * as path from 'path';

const td = './styles/src';

const parseStyle = async styleFile => {
    const imports = await import(styleFile);
    for (const exp in imports) {
        if (imports[exp]._hookedStyle) {
            console.log(exp);
        }
    }
};

fs.readdirSync(td)
    .filter(file => file.endsWith('.ts'))
    .filter(file => ['animation.ts', 'spacing.ts'].indexOf(file) !== -1) // debug
    .map((file) => './' + path.join(td, file.slice(0, -3)))
    .forEach(parseStyle);
