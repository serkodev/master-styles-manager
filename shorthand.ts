import bcd from '@mdn/browser-compat-data';
import { Style } from '@master/style';
import regen from './regen';

export default (style: typeof Style): string[] => {
    if (style.id == 'variable') {
        // special handle
        return [];
    }

    const properties = [];

    if (style.matches) {
        const props = regen(style.matches)
            .map(result => result.split(':')[0]);
        properties.push(...props);
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
