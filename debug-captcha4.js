const fs = require('fs');
const c = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');

// Find page-login div properly
const idx = c.indexOf('id="page-login"');
console.log('page-login at:', idx);
console.log(c.substring(idx - 20, idx + 100));

// The login form - is it inside a .page div?
const loginFormIdx = c.indexOf('id="login-form"');
if (loginFormIdx !== -1) {
  console.log('\nlogin-form at:', loginFormIdx);
  console.log(c.substring(loginFormIdx - 200, loginFormIdx + 50));
}

// Find the login screen div
const loginScreen = c.indexOf('login-screen');
console.log('\nlogin-screen at:', loginScreen);
console.log(c.substring(loginScreen - 20, loginScreen + 200));

// Find showPage function - what does it do with login?
const showPageIdx = c.lastIndexOf('function showPage');
console.log('\n=== showPage ===');
console.log(c.substring(showPageIdx, showPageIdx + 600));
