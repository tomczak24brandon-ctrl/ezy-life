const fs = require('fs');
const c = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');

// Find where _finAccounts is first set/used
let pos = 0, count = 0;
while ((pos = c.indexOf('_finAccounts', pos)) !== -1 && count < 15) {
  console.log(pos + ': ' + c.substring(Math.max(0,pos-30), pos+80).replace(/\n/g,'↵'));
  pos += 12; count++;
}
