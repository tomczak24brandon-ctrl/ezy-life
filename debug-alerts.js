const fs = require('fs');
const html = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');

// Find all alerts
let pos = 0;
while (true) {
  const i = html.indexOf('alert(', pos);
  if (i === -1) break;
  console.log(`[${i}]: ${html.substring(i, i + 80)}`);
  pos = i + 1;
}

// Find setFinTab
const fi = html.indexOf('function setFinTab');
console.log('\n=== setFinTab ===');
console.log(html.substring(fi, fi + 200));

// Find fin-budgets reference
let pos2 = 0;
while (true) {
  const i = html.indexOf('fin-budgets', pos2);
  if (i === -1) break;
  console.log(`\n[fin-budgets at ${i}]: ${html.substring(i-60, i+80)}`);
  pos2 = i + 1;
}
