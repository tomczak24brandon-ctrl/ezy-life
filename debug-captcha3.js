const fs = require('fs');
const c = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');

// Check the area around the bare refreshCaptcha() call
const idx = c.indexOf('}\nrefreshCaptcha();');
console.log('=== bare call context ===');
console.log(c.substring(idx - 50, idx + 200));

// Check what's around the login page HTML - is captcha-q inside a page div?
const qIdx = c.indexOf('id="captcha-q"');
console.log('\n=== captcha-q element context ===');
console.log(c.substring(qIdx - 300, qIdx + 100));

// Find the login page div
const loginPage = c.indexOf('id="page-login"');
console.log('\n=== page-login ===');
console.log(c.substring(loginPage, loginPage + 200));

// Check how pages are shown/hidden - are they display:none by default?
const pageStyle = c.indexOf('.page {');
console.log('\n=== .page CSS ===');
console.log(c.substring(pageStyle, pageStyle + 100));
