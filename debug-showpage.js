const fs = require('fs');
const c = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');

// Check showPage / _showPageInternal for fin-budgets handling
const idx = c.indexOf('function _showPageInternal');
console.log('=== _showPageInternal ===');
console.log(c.substring(idx, idx + 800));

// Also check the sidebarGroups financials entry
const idx2 = c.indexOf("id: 'financials'");
console.log('\n=== financials sidebarGroup ===');
console.log(c.substring(idx2, idx2 + 200));
