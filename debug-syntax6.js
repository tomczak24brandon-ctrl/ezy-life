const vm = require('vm');
const fs = require('fs');

const d = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');
const start = d.indexOf('<script>') + 8;
const end = d.indexOf('</script>', start);
const script = d.substring(start, end);
const lines = script.split('\n');

// Narrow to exact line within 890-902
for (let i = 890; i <= 902; i++) {
  const portion = lines.slice(0, i).join('\n');
  try {
    new vm.Script('"use strict";\n' + portion);
  } catch(e) {
    console.log('First error at line', i, ':', e.message);
    for (let x = Math.max(0, i - 15); x < Math.min(lines.length, i + 5); x++) {
      console.log(`  [${x+1}]: ${JSON.stringify(lines[x])}`);
    }
    break;
  }
}
