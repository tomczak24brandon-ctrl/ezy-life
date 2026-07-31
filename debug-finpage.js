const fs = require('fs');
const c = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');

// Check the showPage function (wrapper around _showPageInternal)
const idx = c.indexOf('function showPage(');
console.log('=== showPage ===');
console.log(c.substring(idx, idx + 500));

// Check if fin-budgets triggers renderFinPage
const p = c.indexOf("fin-budgets");
let pos = 0;
console.log('\n=== fin-budgets render calls ===');
while ((pos = c.indexOf('fin-budgets', pos)) !== -1) {
  const line = c.substring(Math.max(0,pos-40), pos+80).replace(/\n/g,'↵');
  console.log(pos + ': ' + line);
  pos += 11;
}
