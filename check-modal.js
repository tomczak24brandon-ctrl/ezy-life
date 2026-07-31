const fs = require('fs');
const c = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');
const idx = c.indexOf('addfin');
console.log('addfin at:', idx);
console.log(c.substring(idx - 50, idx + 1000));
