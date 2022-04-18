import 'css.escape';
import { Style } from '@master/style';

import regen from './regen';
import { BackdropFilterStyle } from './styles/src/backdrop-filter';
import { SpacingStyle } from './styles/src/spacing';

export const cssProperties = (style: typeof Style): string[] => {
    // if (style.key) return [ style.key ];

    regen(style.matches).forEach(key => {
        const name = key + ':inherit';
        const matching = style.match(name);
        if (matching) {
            const b = new style(name, matching);
            if (b.props && !style.key) {
                console.log('props', b.props);
            }
        }
    });

    return [];
};

// cssProperties(BackdropFilterStyle);
// cssProperties(SpacingStyle);
