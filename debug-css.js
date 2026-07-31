const fs = require('fs');
const c = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');

// Find .page CSS rule
const idx = c.indexOf('.page {');
console.log('.page CSS:', c.substring(idx, idx + 200));
const idx2 = c.indexOf('.page.active');
console.log('.page.active CSS:', c.substring(idx2, idx2 + 100));

// Also check if there's any issue with _currentFinTab variable initialization
const idx3 = c.indexOf('_currentFinTab');
let pos = 0, count = 0;
while ((pos = c.indexOf('_currentFinTab', pos)) !== -1 && count < 8) {
  console.log('\n_currentFinTab at', pos + ':', c.substring(Math.max(0,pos-20), pos+60).replace(/\n/g,'↵'));
  pos += 14; count++;
}
