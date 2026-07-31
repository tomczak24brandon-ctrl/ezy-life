const fs = require('fs');
const c = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');

// Search for fin-related variable declarations
const patterns = ['_finAccounts', '_currentFinTab', '_currentFinAccountId', '_currentBudgetMonth', '_budgetItemEdit'];
for (const p of patterns) {
  // Find all var declarations
  let pos = 0;
  while ((pos = c.indexOf(p, pos)) !== -1) {
    const before = c.substring(Math.max(0, pos-10), pos);
    if (before.includes('var ') || before.trim() === '') {
      console.log(p + ' at ' + pos + ':', c.substring(pos-10, pos+60).replace(/\n/g,'↵'));
    }
    pos += p.length;
  }
}

// Also look for the FINANCIALS section comment
const fIdx = c.indexOf('FINANCIALS');
console.log('\nFINANCIALS section:', fIdx);
if (fIdx !== -1) console.log(c.substring(fIdx - 20, fIdx + 300));
