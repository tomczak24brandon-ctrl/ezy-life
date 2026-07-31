const fs = require('fs');
const t = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', 'utf8');
const lines = t.split('\n');

// Find goalsCarouselInit and any DOMContentLoaded / init that renders goals into timeblocking
console.log('=== DOMContentLoaded / init calls ===');
const dclIdx = t.indexOf('DOMContentLoaded');
console.log(t.substring(dclIdx, dclIdx + 1500));

// Check for any showPage('goals') call inside timeblocking logic
console.log('\n=== showPage goals in timeblocking? ===');
const tbIdx = t.indexOf('<div id="page-timeblocking">');
const tbEnd = t.indexOf('<!-- TIME BLOCKING') + 10000;
const tbRegion = t.substring(tbIdx, tbIdx + 3000);
console.log('showPage goals in timeblocking region?', tbRegion.includes('showPage') || tbRegion.includes('goals'));

// Check goalsCarouselInit
const gci = t.indexOf('function goalsCarouselInit');
console.log('\n=== goalsCarouselInit ===');
if (gci >= 0) console.log(t.substring(gci, gci + 400));

// Check if there's a 'life' tab group that forces goals as first page and renders kanban on timeblocking nav
const lifeIdx = t.indexOf("'life'");
lines.forEach((l, i) => {
  if (/firstPages|life.*goals|goals.*life|renderKanban.*timeblocking|timeblocking.*renderKanban/i.test(l)) {
    console.log('\n>>> line '+(i+1)+': '+l.trim().substring(0,140));
  }
});
