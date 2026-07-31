const fs = require('fs');
const c = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');

// Find renderSidebar to see what onclick it generates for the financials group
const idx = c.indexOf('function renderSidebar');
console.log('=== renderSidebar ===');
console.log(c.substring(idx, idx + 1200));
