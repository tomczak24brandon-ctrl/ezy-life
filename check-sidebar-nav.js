const fs = require('fs');
const t = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', 'utf8');
const lines = t.split('\n');

// Find sidebar item onclick handlers
lines.forEach((l, i) => {
  if (/onclick.*showPage|showPage.*onclick|navItem|sidebarItem|sidebar.*click/i.test(l) && /timeblocking|goals/i.test(l)) {
    console.log((i+1)+': '+l.trim().substring(0,140));
  }
});

// Find renderSidebar to see how nav items are built
const rsi = t.indexOf('function renderSidebar');
console.log('\n=== renderSidebar excerpt ===');
console.log(t.substring(rsi, rsi + 1000));
