import 'css.escape';
import { Style } from '@master/style';
import { MdnCompat, flatAlternativeNameResult } from 'mdn-compat-browserlist';
import bcd from '@mdn/browser-compat-data';
import regen from './regen';

const WILDCARD = '�';

export type ValEquals = boolean | string | { [key:string]: string }

export type ValCondition = {
    // equals:
    //  boolean (all vals equal or not)
    //  string: all vals equal string
    //  kv: every properties (key) in map are equal to its value
    eq: ValEquals,

    // if mathed all equals then return cls
    style: string
}

export interface MapMeta {
    vals?: ValCondition[],
    prop?: string;
}

export interface PriMapMeta extends MapMeta {
    related?: { [key: string]: MapMeta }
}

export type Mapper = { [key: string]: PriMapMeta }

export default class CSSProperties {
    readonly mapper: Mapper;
    private compat: MdnCompat;

    constructor() {
        this.mapper = {};
        this.compat = new MdnCompat();
    }

    // filter all prefixed property (should not use this filter, currently fix for some)
    // private isPrefixedProperty(prop: string, properties: string[]): boolean {
    //     const propPrefixes = ['-webkit-', '-moz-'];
    //     return properties.every(eProp => {
    //         for (const prefix of propPrefixes) {
    //             if (prefix + eProp == prop) return false;
    //         }
    //         return true;
    //     });
    // }

    // filter prefixed property in properties
    private filterAltProps(properties: string[]): string[] {
        const altProps = properties.reduce((all, prop) => {
            const ident = bcd.css.properties[prop];
            if (ident) {
                flatAlternativeNameResult(this.compat.alternative(ident))
                    .forEach(name => { all[name] = true; });
            }
            return all;
        }, {});
        return properties.filter(prop => !altProps[prop]);
        // return properties.filter(prop => { altProps[prop] && console.log('filtered', prop); return !altProps[prop]; });
    }

    private register(properties: string[], style: string, equals?: ValEquals) {
        let sortedProps = [...properties].sort();
        sortedProps = this.filterAltProps(sortedProps);

        const prop = style.split(':')[0];
        const mainProperty = sortedProps[0];
        const cssMap = this.mapper[mainProperty] || (this.mapper[mainProperty] = {});

        const upsert = (map) => {
            if (equals) {
                const vals: ValCondition[] = map.vals || (map.vals = []);

                // find excits equals
                const equalsJSON = JSON.stringify(equals);
                const excitsEqualVal = vals.find(val => JSON.stringify(val.eq) == equalsJSON);
                if (excitsEqualVal !== undefined) {
                    // pick the shortest style
                    if (style.length < excitsEqualVal.style.length) {
                        excitsEqualVal.style = style;
                    }
                } else {
                    vals.push({ eq: equals, style });
                }
            }

            // pick the shortest
            if (!map.prop || prop.length < map.prop.length )
                map.prop = prop;
        };

        if (sortedProps.length == 1) {
            upsert(cssMap);
        } else {
            const relatedPropsKey = sortedProps.slice(1).join(' ');
            const related = cssMap.related || (cssMap.related = {});
            const relatedMap = related[relatedPropsKey] || (cssMap.related[relatedPropsKey] = {});
            upsert(relatedMap);
        }
    }

    process(style: typeof Style) {
        if (style.id == 'variable') {
            // special handle
            return;
        }

        if (style.key) {
            this.register([ style.key ], style.key);
            return;
        }

        // generate all possible samples from matches (regex)
        const samples = regen(style.matches);

        for (const s of samples) {
            let sample = s;
            let wildcards = sample.split(' ').length - 1;

            if (wildcards > 1) {
                console.warn('[WARNING] more then 1 wildcard:', style.id);
                continue;
            }

            // fill wildcard
            if (wildcards === 1) {
                sample = sample.replace(' ', WILDCARD);
            }
            if (sample.endsWith(':')) {
                wildcards++;
                sample = sample + WILDCARD;
            }

            const matches = style.match(sample);
            if (!matches) throw 'not matches sample';

            const b = new style(sample, matches);
            if (!b.props) throw 'no props and key';
            if (b.value == undefined) throw 'undefined value';
            if (b.unit == undefined) throw 'undefined unit';

            const cssProps = Object.keys(b.props);

            const thisProps = cssProps.filter(prop => b.props[prop] == b);
            if (thisProps.length == cssProps.length) {
                // all same value
                if (wildcards) {
                    this.register(cssProps, b.name);
                } else {
                    this.register(cssProps, b.name, b.value+b.unit);
                }
            } else {
                // contains hardcode value
                switch (style.id) {
                    case 'fontSmoothing': {
                        cssProps.forEach(prop => {
                            this.register([prop], b.name, b.props[prop].value + b.props[prop].unit);
                        });
                    }
                        break;
                    case 'lines':
                    case 'textSize':
                        // ignore knowns styles
                        break;
                    default:
                        console.warn('[WARNING] ignored style:', style.id || style);
                        continue;
                }
            }
        }
    }
}
