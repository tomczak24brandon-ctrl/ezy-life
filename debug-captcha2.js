const fs = require('fs');
const c = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');

// Find refreshCaptcha function
const idx = c.indexOf('function refreshCaptcha');
console.log('=== refreshCaptcha ===');
console.log(c.substring(idx, idx + 400));

// Find where it's called on init
const calls = [];
let pos = 0;
while (true) {
  const i = c.indexOf('refreshCaptcha', pos);
  if (i === -1) break;
  calls.push(i);
  pos = i + 1;
}
console.log('\nAll refreshCaptcha calls at:', calls);
calls.forEach(i => console.log(`  [${i}]: ${c.substring(i - 30, i + 60)}`));

// Find the login page init / showPage login
const loginIdx = c.indexOf("'login'");
console.log('\n=== showPage login area ===');
console.log(c.substring(loginIdx - 100, loginIdx + 200));
