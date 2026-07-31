const fs = require('fs');
let txt = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', 'utf8');
const lines = txt.split('\n');

// Lines to remove (0-indexed): 4804-4809 — the orphaned DR fragment
// Verify content before removing
console.log('Lines to remove:');
for (let i = 4803; i <= 4809; i++) {
  console.log((i+1)+':', JSON.stringify(lines[i]));
}

// Remove lines 4803-4808 (0-indexed) = lines 4804-4809 (1-indexed)
// These are: blank indent, text div, dr-task-list div, dr-start-btn, </div>, </div>
const cleaned = lines.filter((_, i) => i < 4803 || i > 4808);

const out = cleaned.join('\n');
console.log('\n?? count:', (out.match(/\?\?/g)||[]).length);
console.log('Has Start My Day:', out.includes('Start My Day'));
console.log('Has dr-task-list:', out.includes('dr-task-list'));
console.log('Has Check off each:', out.includes('Check off each'));
console.log('Has 🎯:', out.includes('\uD83C\uDFAF'));
console.log('Has 🏠:', out.includes('\uD83C\uDFE0'));
console.log('Size:', Buffer.byteLength(out, 'utf8'), 'bytes');

fs.writeFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', out, { encoding: 'utf8' });
console.log('Saved.');
