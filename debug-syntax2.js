const https = require('https');
const vm = require('vm');

https.get('https://ezy-life.vercel.app', r => {
  let d = '';
  r.on('data', c => d += c);
  r.on('end', () => {
    const start = d.indexOf('<script>') + 8;
    const end = d.indexOf('</script>', start);
    const script = d.substring(start, end);

    // Binary search for the exact line with the syntax error
    const lines = script.split('\n');
    console.log('Total lines:', lines.length);

    // Try chunks of lines to narrow it down
    for (let chunk = 0; chunk < lines.length; chunk += 500) {
      const portion = lines.slice(0, chunk + 500).join('\n');
      try {
        new vm.Script(portion);
      } catch(e) {
        console.log(`Error appears before line ${chunk + 500}: ${e.message} at line ${e.lineNumber}`);
        // Narrow further
        for (let sub = chunk; sub < Math.min(chunk + 500, lines.length); sub += 50) {
          const sub_portion = lines.slice(0, sub + 50).join('\n');
          try { new vm.Script(sub_portion); }
          catch(e2) {
            console.log(`  Error before line ${sub + 50}: ${e2.message} at ${e2.lineNumber}`);
            // Show the exact lines
            const errL = (e2.lineNumber || 1) - 1;
            console.log('\nLines around error:');
            for (let x = Math.max(0, errL - 5); x < Math.min(lines.length, errL + 5); x++) {
              console.log(`  [${x+1}]: ${lines[x]}`);
            }
            break;
          }
        }
        break;
      }
    }
  });
});
