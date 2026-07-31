const fs = require('fs');
const c = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');
// Find modal HTML by searching for modal divs with id
const idx = c.indexOf("id=\"modal-addfin\"");
const idx2 = c.indexOf("id='modal-addfin'");
console.log('modal-addfin (double):', idx);
console.log('modal-addfin (single):', idx2);
// Try just looking for fin-acct-type in HTML
const idx3 = c.indexOf('fin-acct-type');
console.log('fin-acct-type at:', idx3);
console.log(c.substring(idx3 - 400, idx3 + 300));
