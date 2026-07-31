const fs = require('fs');
const c = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');
// showModal likely builds modal content dynamically. Let's find the showModal function
const idx = c.indexOf('function showModal(');
console.log('showModal at:', idx);
console.log(c.substring(idx, idx + 800));
