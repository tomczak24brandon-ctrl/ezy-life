const fs = require('fs');
const c = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');

// Find the login HTML structure - look for the login box/form
const lbIdx = c.indexOf('class="login-box"');
console.log('login-box at:', lbIdx);
console.log(c.substring(lbIdx - 30, lbIdx + 100));

// Find login screen HTML div
const lsIdx = c.indexOf('<div class="login-screen"');
console.log('\nlogin-screen div at:', lsIdx);
console.log(c.substring(lsIdx, lsIdx + 200));

// Find where refreshCaptcha is called on login show
const idx87 = c.indexOf('refreshCaptcha();\n  }');
console.log('\n=== refreshCaptcha in show logic ===');
console.log(c.substring(idx87 - 200, idx87 + 100));

// What controls showing the login screen vs the app?
const authIdx = c.indexOf('isLoggedIn') !== -1 ? c.indexOf('isLoggedIn') : c.indexOf('checkLogin');
console.log('\n=== auth check ===', authIdx);
console.log(c.substring(authIdx, authIdx + 400));
