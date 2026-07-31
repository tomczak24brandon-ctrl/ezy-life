const fs = require('fs');
const html = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');

// Find all alerts with DEBUG
let pos = 0;
while (true) {
  const i = html.indexOf('alert(', pos);
  if (i === -1) break;
  const snippet = html.substring(i, i + 100);
  if (snippet.includes('DEBUG') || snippet.includes('debug')) {
    console.log(`[${i}]: ${snippet}`);
  }
  pos = i + 1;
}

// Find fin tabs area
const fp = html.indexOf('id="page-fin-budgets"');
console.log('\n=== page-fin-budgets start ===');
console.log(html.substring(fp, fp + 600));
