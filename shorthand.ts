import genex from 'genex';
import bcd from '@mdn/browser-compat-data';

export class ShorthandList {

    // Order:
    // this.semantics;
    // this.matches;
    // this.colorStarts;
    // this.symbol;
    // this.key;
    async parse (file) {
        const exports = await import(file);
        const shorthands = {};

        for (const exp in exports) {
            const style = exports[exp];
            if (typeof style.match != 'function') continue;

            const properties = [];

            if (style.matches) { //continue;

                let matchesRegex = (<RegExp>style.matches).source;

                // replace wildcard (.) regex for generate
                matchesRegex = matchesRegex.replace(/(?<!\\)\.[\*\+]?\??/g, '');

                const genProps = genex(new RegExp(matchesRegex)).generate()
                    .map(result => result.split(':')[0]);

                properties.push(...genProps);
            }

            if (style.key) {
                properties.push(style.key);
            }

            properties
                .filter((item, pos) => properties.indexOf(item) == pos ) // filter repeate
                .filter(item => item != '$' ) // TODO
                .map(item => item.endsWith('(') ? item+')' : item) // normalize () props
                .filter(item => !bcd.css.properties[item] && !bcd.svg.attributes.presentation[item]) // filter shorthands
                .forEach(item => {
                    shorthands[item] = true;
                });
        }

        Object.keys(shorthands).length &&
        console.log(Object.keys(shorthands));
    }
}
