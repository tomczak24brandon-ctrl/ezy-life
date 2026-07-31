const fs = require('fs');
const c = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');

// Get the full renderSidebar to see item rendering with drag
const idx = c.lastIndexOf('function renderSidebar');
console.log(c.substring(idx, idx + 2000));

// Also get sgItemDrag functions
const idx2 = c.indexOf('sgItemDrag');
console.log('\n=== sgItemDrag area ===');
console.log(c.substring(idx2 - 20, idx2 + 800));
