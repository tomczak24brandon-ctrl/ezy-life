const fs = require('fs');
const t = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', 'utf8');

// Get full renderGCal function
const i = t.indexOf('function renderGCal()');
const j = t.indexOf('\nfunction ', i + 10);
const block = t.substring(i, j);
console.log('=== renderGCal ===');
console.log(block);

// Also check if renderKanban is called from renderGCal path
console.log('\nrenderGCal calls renderKanban?', block.includes('renderKanban'));
console.log('renderGCal calls goals?', /goals|kanban/i.test(block));
