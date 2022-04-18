import genex from 'genex';
import bcd from '@mdn/browser-compat-data';

const filterProps = [
    '$'
];

// Order:
// this.semantics;
// this.matches;
// this.colorStarts;
// this.symbol;
// this.key;

const filterMap = {...filterProps.map(k => ({ [k]: true }))};

export default (style): string[] => {
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

    return properties
        .filter((item, pos) =>
            // filter repeate
            properties.indexOf(item) == pos &&
            !filterMap[item] &&
            (
                // filter shorthands
                !bcd.css.properties[item] &&
                !bcd.svg.attributes.presentation[item]
            )
        )
        .map(item => item.endsWith('(') ? item+')' : item); // normalize () props
};
