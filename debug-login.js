const fs = require('fs');
const c = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');

// Show full doLogin function
const idx = c.indexOf('function doLogin');
console.log('=== doLogin ===');
console.log(c.substring(idx, idx + 800));

// Show area around captcha-a input
const caIdx = c.indexOf('captcha-a');
console.log('\n=== captcha-a references ===');
let pos = 0;
while(true) {
  const i = c.indexOf('captcha-a', pos);
  if (i === -1) break;
  console.log(`[${i}]: ${c.substring(i-80, i+80)}`);
  pos = i + 1;
}

// Show captcha-box area
const cbIdx = c.indexOf('captcha-box');
console.log('\n=== captcha-box ===');
let pos2 = 0;
while(true) {
  const i = c.indexOf('captcha-box', pos2);
  if (i === -1) break;
  console.log(`[${i}]: ${c.substring(i-20, i+100)}`);
  pos2 = i + 1;
}
