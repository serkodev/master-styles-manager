import 'css.escape';
import { Style } from '@master/style';
import regen from './regen';

const WILDCARD = '�';

export type ValCondition = {
    // equals:
    //  boolean (all vals equal or not)
    //  string: all vals equal string
    //  kv: every properties (key) in map are equal to its value
    eq: string,

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

export type Options = {
    warning?: boolean
}

export default class CSSProperties {
    readonly mapper: Mapper;
    private options: Options = {};

    constructor(options?: Options) {
        if (options)
            this.options = options;
        this.mapper = {};
    }

    private register(properties: string[], style: string, equals?: string) {
        const sortedProps = [...properties].sort();

        const prop = style.split(':')[0];
        const mainProperty = sortedProps[0];
        const cssMap = this.mapper[mainProperty] || (this.mapper[mainProperty] = {});

        const upsert = (map: MapMeta) => {
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

        // generate all possible samples from matches (regex)
        const samples = style.matches ? regen(style.matches) : [];

        for (const _sample of samples) {
            let sample = _sample;
            let wildcards = sample.split(' ').length - 1;

            if (wildcards > 1) {
                this.options.warning && console.warn('[WARNING] more then 1 wildcard:', style.id);
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

            const s = new style(sample, matches);

            const { value, unit } = s;
            const props = s.props;
            if (!props) {
                if (style.key) {
                    this.register([ style.key ], s.name);
                    continue;
                } else {
                    throw 'undefined value';
                }
            }
            if (value == undefined) throw 'undefined value';
            if (unit == undefined) throw 'undefined unit';

            const cssProps = Object.keys(props);

            const thisProps = cssProps.filter(prop => props[prop] == s);
            if (thisProps.length == cssProps.length) {
                // all same value
                if (wildcards) {
                    this.register(cssProps, s.name);
                } else {
                    this.register(cssProps, s.name, value+unit);
                }
            } else {
                // contains hardcode value
                switch (style.id) {
                    case 'fontSmoothing': {
                        cssProps.forEach(prop => {
                            this.register([prop], s.name, props[prop].value + props[prop].unit);
                        });
                    }
                        break;
                    case 'lines':
                    case 'textSize':
                        // ignore knowns styles
                        break;
                    default:
                        this.options.warning && console.warn('[WARNING] ignored style:', style.id || style);
                        continue;
                }
            }
        }

        if (style.key) {
            this.register([ style.key ], style.key);
        }
    }
}
