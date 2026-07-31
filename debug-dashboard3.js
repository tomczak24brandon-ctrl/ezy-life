const fs = require('fs');
const c = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');

// Show the full dashboard page HTML
const start = c.indexOf('id="page-dashboard"');
const nextPage = c.indexOf('<div class="page"', start + 10);
console.log('Dashboard ends at:', nextPage);
console.log(c.substring(start, nextPage));
