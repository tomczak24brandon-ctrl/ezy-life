const fs = require('fs');
const c = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');

// Find all sidebar drag/reorder functions
const funcs = ['sgDragStart','sgDragOver','sgDrop','sgDragEnd','sgRename','sgAddItem','saveSidebar','loadSidebar'];
for (const fn of funcs) {
  const idx = c.indexOf('function ' + fn);
  if (idx !== -1) {
    console.log(`\n=== ${fn} ===`);
    console.log(c.substring(idx, idx + 300));
  } else {
    console.log(`\n❌ ${fn} NOT FOUND`);
  }
}
