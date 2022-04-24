import genex from 'genex';

export default (regex: RegExp) => {
    let matchesRegex = regex.source;

    // replace wildcard (.) regex for generate, regex replace is for ignoring \.
    matchesRegex = matchesRegex.replace(/(\\?)\.[\*\+]?\??/g, (a, b) => !b ? ' ' : a);

    return genex(new RegExp(matchesRegex)).generate();
};
