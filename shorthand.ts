import genex from 'genex';
import bcd from '@mdn/browser-compat-data';
import { Style } from '@master/style';

const filterProps = [
    '$' // variable
];

// Order:
// this.semantics;
// this.matches;
// this.colorStarts;
// this.symbol;
// this.key;

const filterMap = filterProps.reduce((acc,curr)=> (acc[curr]=true,acc),{});

export default (style: typeof Style): string[] => {
    const properties = [];

    if (style.matches) { //continue;

        let matchesRegex = (<RegExp>style.matches).source;

        // replace wildcard (.) regex for generate
        matchesRegex = matchesRegex.replace(/(?<!\\)\.[\*\+]?\??/g, '');

        const genProps = genex(new RegExp(matchesRegex)).generate()
            .map(result => result.split(':')[0])
            .filter(item => !filterMap[item]);
        properties.push(...genProps);
    }

    if (style.key) {
        properties.push(style.key);
    }

    return properties
        .filter(item =>
            // filter shorthands
            !bcd.css.properties[item] &&
            !bcd.svg.attributes.presentation[item]
        )
        .map(item => item.endsWith('(') ? item+')' : item); // normalize () props
};
