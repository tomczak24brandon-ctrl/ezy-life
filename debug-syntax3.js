const vm = require('vm');
const fs = require('fs');

const d = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');
const start = d.indexOf('<script>') + 8;
const end = d.indexOf('</script>', start);
const script = d.substring(start, end);

console.log('Script length:', script.length);

try {
  new vm.Script(script);
  console.log('✅ No syntax errors');
} catch(e) {
  console.log('❌ SYNTAX ERROR:', e.message, 'at line', e.lineNumber);
  const lines = script.split('\n');
  const errL = (e.lineNumber || 1) - 1;
  console.log('\nLines around error:');
  for (let x = Math.max(0, errL - 5); x < Math.min(lines.length, errL + 5); x++) {
    console.log(`  [${x+1}]: ${lines[x]}`);
  }
}
