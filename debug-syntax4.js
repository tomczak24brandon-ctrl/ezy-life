const vm = require('vm');
const fs = require('fs');

const d = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');
const start = d.indexOf('<script>') + 8;
const end = d.indexOf('</script>', start);
const script = d.substring(start, end);

const lines = script.split('\n');
console.log('Total lines:', lines.length);

// Binary search - find the exact line
let lo = 0, hi = lines.length;
while (hi - lo > 1) {
  const mid = Math.floor((lo + hi) / 2);
  const portion = lines.slice(0, mid).join('\n');
  try {
    new vm.Script('"use strict";\n' + portion);
    lo = mid;
  } catch(e) {
    hi = mid;
  }
}

console.log('Error first appears at line:', hi);
console.log('\nLines around error:');
for (let x = Math.max(0, hi - 8); x < Math.min(lines.length, hi + 5); x++) {
  console.log(`  [${x+1}]: ${lines[x]}`);
}
