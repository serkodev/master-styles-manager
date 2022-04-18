import bcd from '@mdn/browser-compat-data';
import { Style } from '@master/style';
import regen from './regen';

// Order:
// semantics;
// matches;
// colorStarts;
// symbol;
// key;

export default (style: typeof Style): string[] => {
    const properties = [];

    if (style.matches) {
        properties.push(...regen(style.matches));
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
