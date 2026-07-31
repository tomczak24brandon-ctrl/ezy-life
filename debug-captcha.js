const fs = require('fs');
const c = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');

// Find captcha/recaptcha references
const terms = ['captcha', 'recaptcha', 'hcaptcha', 'turnstile', 'Loading...', 'robot', 'verify'];
for (const t of terms) {
  const idx = c.toLowerCase().indexOf(t.toLowerCase());
  if (idx !== -1) {
    console.log(`\n=== "${t}" at ${idx} ===`);
    console.log(c.substring(Math.max(0, idx - 100), idx + 300));
  } else {
    console.log(`No: ${t}`);
  }
}
