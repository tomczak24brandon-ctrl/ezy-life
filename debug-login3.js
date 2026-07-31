const fs = require('fs');
const c = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');

// Show the entire login screen HTML
const start = c.indexOf('class="login-screen"');
const end = c.indexOf('</div>', c.indexOf('id="login-err"')) + 6;
console.log('=== LOGIN SCREEN HTML ===');
console.log(c.substring(start - 5, end + 50));

// Show CREDS
const ci = c.indexOf('var CREDS');
console.log('\n=== CREDS ===');
console.log(c.substring(ci, ci + 80));

// Show full doLogin
const di = c.indexOf('function doLogin');
console.log('\n=== doLogin ===');
console.log(c.substring(di, di + 500));
