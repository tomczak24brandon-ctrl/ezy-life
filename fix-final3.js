const fs = require('fs');
let txt = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html','utf8');
const lines = txt.split('\n');

// Line 1636 (0-idx 1635): nav-home icon
lines[1635] = lines[1635].replace('<span class="icon">??</span>', '<span class="icon">🏠</span>');

// Line 3845 (0-idx 3844): receipt tag in biz table
lines[3844] = lines[3844].replace('"receipt-tag"', '"receipt-tag"').replace(
  '>??</span>',
  '>🧾</span>'
);

// Line 3907 (0-idx 3906): print mileage report button
lines[3906] = lines[3906].replace('>?? Print Report</button>', '>🖨️ Print Report</button>');

const out = lines.join('\n');
const remaining = (out.match(/\?\?/g)||[]).length;
console.log('Remaining ?? count:', remaining);
console.log('Has Daily Review:', out.includes('Daily Review'));
console.log('Has checkDailyCheckin:', out.includes('checkDailyCheckin'));
console.log('Has 🎯:', out.includes('\uD83C\uDFAF'));
console.log('Has 🏠:', out.includes('\uD83C\uDFE0'));

fs.writeFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', out, {encoding:'utf8'});
console.log('Saved:', Buffer.byteLength(out,'utf8'), 'bytes');
