const fs = require('fs');
const c = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');

// Find all remaining _captchaAns references
let pos = 0;
while (true) {
  const i = c.indexOf('_captchaAns', pos);
  if (i === -1) break;
  console.log(`[${i}]: ${JSON.stringify(c.substring(i - 60, i + 80))}`);
  pos = i + 1;
}

// Find the login submit function
const loginIdx = c.indexOf('function doLogin');
if (loginIdx !== -1) {
  console.log('\n=== doLogin ===');
  console.log(c.substring(loginIdx, loginIdx + 600));
}
// Also try other names
['submitLogin','handleLogin','tryLogin','signIn'].forEach(fn => {
  const i = c.indexOf('function ' + fn);
  if (i !== -1) console.log('\nFound: ' + fn, c.substring(i, i + 300));
});
