const fs = require('fs');
const c = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');

// Find renderDashboard function
const idx = c.indexOf('function renderDashboard');
console.log('renderDashboard at:', idx);
if (idx !== -1) console.log(c.substring(idx, idx + 800));

// Also find quick-links or shortcuts section in dashboard
const ql = c.indexOf('quick-link');
console.log('\nquick-link at:', ql);
if (ql !== -1) console.log(c.substring(ql - 50, ql + 300));

// Find shortcut or pinned section
const sc = c.indexOf('shortcut');
console.log('\nshortcut at:', sc);
if (sc !== -1) console.log(c.substring(sc - 50, sc + 200));
