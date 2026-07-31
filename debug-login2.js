const fs = require('fs');
const c = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');

const idx = c.indexOf('function doLogin');
console.log(c.substring(idx, idx + 600));

// Any remaining captcha refs
let pos = 0;
while(true) {
  const i = c.indexOf('captcha', pos);
  if (i === -1) break;
  console.log(`\n[${i}]: ${c.substring(i-40, i+80)}`);
  pos = i + 1;
}
