const fs = require('fs');
const t = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', 'utf8');

// Check buildKCard to understand goal card structure/IDs
const bkc = t.indexOf('function buildKCard');
console.log('=== buildKCard (first 600) ===');
console.log(t.substring(bkc, bkc + 600));

// Check renderKanban to see how goal cards get IDs
const rk = t.indexOf('function renderKanban()');
console.log('\n=== renderKanban (first 400) ===');
console.log(t.substring(rk, rk + 400));

// Check _goalsTabIdx default value
const lines = t.split('\n');
lines.forEach((l, i) => {
  if (/_goalsTabIdx\s*=/.test(l)) console.log((i+1)+': '+l.trim().substring(0,100));
});
