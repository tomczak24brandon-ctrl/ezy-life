const fs = require('fs');
const t = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', 'utf8');

// Find actual DOMContentLoaded / init block
const idx = t.lastIndexOf('DOMContentLoaded');
console.log('Last DOMContentLoaded at:', idx);
console.log(t.substring(idx, idx + 2000));
