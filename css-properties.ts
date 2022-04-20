import 'css.escape';
import { Style } from '@master/style';
import { Variable } from './styles/src/variable';
import { MdnCompat, flatAlternativeNameResult } from 'mdn-compat-browserlist';
import bcd from '@mdn/browser-compat-data';

import regen from './regen';
const WILDCARD = '�';

type ValEquals = boolean | string | { [key:string]: string }
type ValCondition = {
    // equals:
    //  boolean (all vals equal or not)
    //  string: all vals equal string
    //  kv: every properties (key) in map are equal to its value
    equals: ValEquals,

    // if mathed all equals then return cls
    style: string
}

class CSSMapper {
    mapper: {[key: string]: {
        related?: { [key: string]: {
            vals?: ValCondition[],
            prop?: string
        }},
        vals?: ValCondition[],
        prop?: string;
    }} = {};
    compat: MdnCompat;

    constructor() {
        this.compat = new MdnCompat();
    }

    propPrefixes = ['-webkit-', '-moz-'];

    private filterAlternativeProps(properties: string[]): string[] {
        const alternativeProps = properties.reduce((all, prop) => {
            flatAlternativeNameResult(this.compat.alternative(bcd.css.properties[prop])).forEach(name => {
                all[name] = true;
            });
            return all;
        }, {});
        return properties.filter(prop => !alternativeProps[prop]);

        // FIXME: filter all prefixed property (should not use this filter, currently fix for some)
        // .filter(prop =>
        //     properties.every(eProp => {
        //         for (const prefix of this.propPrefixes) {
        //             if (prefix + eProp == prop) return false;
        //         }
        //         return true;
        //     })
        // )
    }

    register(properties: string[], style: string, ...equals: ValEquals[]) {
        const sortedProps = [...properties].sort();
        // sortedProps = this.filterAlternativeProps(sortedProps);
        // console.log(sortedProps);

        const prop = style.split(':')[0];
        const mainProperty = sortedProps[0];
        const cssMap = this.mapper[mainProperty] || (this.mapper[mainProperty] = {});

        const upsert = (map) => {
            if (equals && equals.length > 0) {
                const vals = map.vals || (map.vals = []);
                vals.push({ equals, style });
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

        // TODO: optimize for prefix (--webkit-)
    }
}

export const cssMapper = new CSSMapper();

export default (style: typeof Style): string[] => {
    if (style == Variable) {
        // special handle
        return;
    }

    if (style.key) return [ style.key ];

    // generate all possible samples from matches (regex)
    const samples = regen(style.matches);

    samples.forEach(sample => {
        let wildcards = sample.split(' ').length - 1;
        if (wildcards > 1) throw 'more then 1 wildcard';

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
        if (b.props) {
            if (b.value == undefined) throw 'undefined value';
            if (b.unit == undefined) throw 'undefined unit';

            const cssProps = Object.keys(b.props);

            const thisProps = cssProps.filter(prop => b.props[prop] == b);
            if (thisProps.length == cssProps.length) { // all same value
                if (wildcards) {
                    cssMapper.register(cssProps, b.name);
                } else {
                    cssMapper.register(cssProps, b.name, b.value+b.unit);
                }
            } else {
                console.log(sample, thisProps, cssProps);

                if (wildcards) {
                    // TODO
                } else if (thisProps.length == 0) {
                    // all static props value
                    const equals = cssProps
                        .map((prop): ValEquals => {
                            return { [prop]: b.props[prop].value + b.props[prop].unit };
                        });
                    cssMapper.register(cssProps, b.name, ...equals);
                }

                // TODO
                // console.log('external vales style', b.props, b.value);
            }
        } else {
            throw 'no props and key';
        }
    });

    // console.log(cssMapper.mapper['border-style']);

    return [];
};

// cssProperties(BackdropFilterStyle);
// cssProperties(SpacingStyle);
