const fs = require('fs');
const t = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', 'utf8');
const lines = t.split('\n');

// Find all lines mentioning kanban/goals rendering near timeblocking context
console.log('=== renderKanban calls ===');
lines.forEach((l, i) => {
  if (/renderKanban/i.test(l)) console.log((i+1)+': '+l.trim().substring(0,120));
});

// Check if goals kanban HTML is inside page-timeblocking div
const tbStart = t.indexOf('<div id="page-timeblocking">');
const tbEnd = t.indexOf('</div><!-- /page-timeblocking -->');
console.log('\n=== page-timeblocking HTML span:', tbStart, '->', tbEnd, 'chars:', tbEnd-tbStart);
const tbBlock = t.substring(tbStart, tbEnd+35);
const hasKanban = tbBlock.includes('kanban') || tbBlock.includes('goals-tab') || tbBlock.includes('goals-panel');
console.log('Goals/kanban HTML inside page-timeblocking?', hasKanban);
if (hasKanban) {
  // Find what's in there
  const idx = tbBlock.indexOf('kanban');
  if (idx >= 0) console.log('...at:', tbBlock.substring(idx-100, idx+200));
}

// Check showPage for any goals rendering injected into timeblocking
const spIdx = t.indexOf('function showPage');
const spBlock = t.substring(spIdx, spIdx+2000);
console.log('\n=== showPage mentions renderKanban?', spBlock.includes('renderKanban'));
console.log('=== showPage mentions goals?', spBlock.includes('goals'));
