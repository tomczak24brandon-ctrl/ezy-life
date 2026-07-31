const https = require('https');
const vm = require('vm');

https.get('https://ezy-life.vercel.app', r => {
  let d = '';
  r.on('data', c => d += c);
  r.on('end', () => {
    // Extract all script content
    let scripts = [];
    let pos = 0;
    while (true) {
      const start = d.indexOf('<script>', pos);
      if (start === -1) break;
      const end = d.indexOf('</script>', start);
      scripts.push({ start, content: d.substring(start + 8, end) });
      pos = end + 1;
    }
    console.log('Found', scripts.length, 'script blocks');

    // Try to parse each one
    scripts.forEach((s, i) => {
      try {
        new vm.Script(s.content);
        console.log(`Script ${i} (at ${s.start}): ✅ OK (${s.content.length} chars)`);
      } catch(e) {
        console.log(`Script ${i} (at ${s.start}): ❌ SYNTAX ERROR: ${e.message}`);
        // Show context around error
        const lines = s.content.split('\n');
        const errLine = e.lineNumber || 0;
        console.log('Near line', errLine, ':');
        for (let l = Math.max(0, errLine-3); l < Math.min(lines.length, errLine+3); l++) {
          console.log(`  [${l+1}]: ${lines[l]}`);
        }
      }
    });
  });
});
