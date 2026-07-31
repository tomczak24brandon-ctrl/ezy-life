const fs = require('fs');
const t = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', 'utf8');

// Find the sidebar nav tab click / group tab switch logic
const sidebarNav = t.indexOf('function switchSidebarGroup');
if (sidebarNav >= 0) {
  console.log('=== switchSidebarGroup ===');
  console.log(t.substring(sidebarNav, sidebarNav + 800));
}

// Find where firstPages is used
const fpIdx = t.indexOf('firstPages');
console.log('\n=== firstPages usage ===');
// Get surrounding context for each occurrence
let idx = t.indexOf('firstPages');
while (idx >= 0 && idx < t.length) {
  console.log(t.substring(idx - 100, idx + 300));
  console.log('---');
  idx = t.indexOf('firstPages', idx + 10);
}
