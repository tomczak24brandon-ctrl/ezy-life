const fs = require('fs');
const c = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');

// Find the dashboard page HTML
const idx = c.indexOf('id="page-dashboard"');
console.log('Dashboard page at:', idx);
console.log(c.substring(idx, idx + 1500));
