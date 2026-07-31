const fs = require('fs');
const t = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', 'utf8');

const ai = t.indexOf('function appInit');
console.log('=== appInit ===');
console.log(t.substring(ai, ai + 1500));
