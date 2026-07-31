const vm = require('vm');
const fs = require('fs');

const d = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');
const start = d.indexOf('<script>') + 8;
const end = d.indexOf('</script>', start);
const script = d.substring(start, end);
const lines = script.split('\n');

// Now narrow within lines 900-930
for (let i = 900; i <= 930; i++) {
  const portion = lines.slice(0, i).join('\n');
  try {
    new vm.Script('"use strict";\n' + portion);
  } catch(e) {
    console.log('First error at line', i, ':', e.message);
    // Show lines 905-920
    for (let x = 904; x < 925 && x < lines.length; x++) {
      console.log(`  [${x+1}]: ${lines[x]}`);
    }
    break;
  }
}
