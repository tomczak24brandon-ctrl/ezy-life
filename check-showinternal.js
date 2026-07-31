const fs = require('fs');
const t = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', 'utf8');

const i = t.indexOf('function _showPageInternal');
console.log('=== _showPageInternal ===');
console.log(t.substring(i, i + 1500));

// Also check the showPage function fully
const j = t.indexOf('function showPage(id)');
const jend = t.indexOf('\nfunction ', j + 100);
console.log('\n=== showPage ===');
console.log(t.substring(j, jend));
