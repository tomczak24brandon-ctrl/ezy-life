const fs = require('fs');
const c = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');

// Check the showCategoryMenu function - this is what fires when Financials is clicked
const idx = c.indexOf('function showCategoryMenu');
console.log('=== showCategoryMenu ===');
console.log(c.substring(idx, idx + 600));

// Check what the financials nav item actually calls
const finIdx = c.indexOf("'financials'");
console.log('\n=== financials references ===');
let p = 0;
while ((p = c.indexOf("financials", p)) !== -1) {
  const line = c.substring(Math.max(0,p-30), p+80).replace(/\n/g,'↵');
  console.log(p + ': ' + line);
  p += 10;
}
