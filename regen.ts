import genex from 'genex';

export default (regex: RegExp) => {
    let matchesRegex = regex.source;

    // replace wildcard (.) regex for generate
    matchesRegex = matchesRegex.replace(/(?<!\\)\.[\*\+]?\??/g, ' ');

    return genex(new RegExp(matchesRegex)).generate();
};
