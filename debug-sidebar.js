const fs = require('fs');
const c = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');

// Find sidebarGroups definition
const idx = c.indexOf('var sidebarGroups');
console.log('sidebarGroups at:', idx);
console.log(c.substring(idx, idx + 3000));
