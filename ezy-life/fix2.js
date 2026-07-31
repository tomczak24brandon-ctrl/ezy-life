const fs = require('fs');
const f = 'C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html';
let t = fs.readFileSync(f, 'utf8');

const lines = t.split('\n');
const hits = lines.map((l,i) => ({n:i+1, l})).filter(({l}) => l.includes('??') && !l.includes('emojis:'));
hits.forEach(({n,l}) => console.log(n + ': ' + JSON.stringify(l.trim().substring(0,200))));
