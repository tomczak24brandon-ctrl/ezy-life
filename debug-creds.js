const fs = require('fs');
const c = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');

const idx = c.indexOf('var CREDS');
console.log(c.substring(idx, idx + 200));
