const fs = require('fs');
const c = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');

// Find var _currentFinTab declaration
const idx = c.indexOf('var _currentFinTab');
console.log('_currentFinTab declared at:', idx);
console.log(c.substring(idx - 10, idx + 100));

// Find var _currentFinAccountId
const idx2 = c.indexOf('var _currentFinAccountId');
console.log('\n_currentFinAccountId declared at:', idx2);
console.log(c.substring(idx2 - 10, idx2 + 100));

// Find var _finAccounts declaration
const idx3 = c.indexOf('var _finAccounts');
console.log('\n_finAccounts declared at:', idx3);
console.log(c.substring(idx3 - 10, idx3 + 100));
