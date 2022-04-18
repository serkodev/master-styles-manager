import genex from 'genex';

const filterProps = [
    '$' // variable
];

const filterMap = filterProps.reduce((acc,curr)=> (acc[curr]=true,acc),{});

export default (regex: RegExp) => {
    let matchesRegex = regex.source;

    // replace wildcard (.) regex for generate
    matchesRegex = matchesRegex.replace(/(?<!\\)\.[\*\+]?\??/g, '');

    return genex(new RegExp(matchesRegex)).generate()
        .map(result => result.split(':')[0])
        .filter(item => !filterMap[item]);
};
