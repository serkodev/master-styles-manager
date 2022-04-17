import { StyleSheet as _StyleSheet, Style as _Style } from '@master-style-original';

export class Style extends _Style {
    static _hookedStyle = true; // for check

    static test1() {
        // style/core.ts: 206

        // In order:
        // this.semantics;
        // this.matches;
        // this.colorStarts;
        // this.symbol;
        // this.key;
    }
}

export const StyleSheet = _StyleSheet;
