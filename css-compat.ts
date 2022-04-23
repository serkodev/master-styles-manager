import { MdnCompat, flatAlternativeNameResult } from 'mdn-compat-browserlist';
import bcd from '@mdn/browser-compat-data';

const compat = new MdnCompat();

// filter all prefixed property (should not use this filter, currently fix for some)
export const isPrefixedProperty = (prop: string, properties: string[]): boolean => {
    const propPrefixes = ['-webkit-', '-moz-'];
    return properties.every(eProp => {
        for (const prefix of propPrefixes) {
            if (prefix + eProp == prop) return false;
        }
        return true;
    });
};

// filter prefixed property in properties
export const filterAltProps = (properties: string[]): string[] => {
    const altProps = properties.reduce((all, prop) => {
        const ident = bcd.css.properties[prop];
        if (ident) {
            flatAlternativeNameResult(compat.alternative(ident))
                .forEach(name => { all[name] = true; });
        }
        return all;
    }, <{[key: string]: true}>{});
    return properties.filter(prop => !altProps[prop]);
    // return properties.filter(prop => { altProps[prop] && console.log('filtered', prop); return !altProps[prop]; });
};
