const fs = require('fs');
const c = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');

// Check if nav-item has drag support
const idx = c.indexOf('nav-item');
console.log('nav-item render:', c.substring(idx - 20, idx + 200));

// Look for item-level drag functions
const funcs = ['sgItemDrag','itemDrag','navItemDrag','sgMoveItem','reorderItem'];
for (const fn of funcs) {
  const i = c.indexOf(fn);
  if (i !== -1) console.log(`Found ${fn} at ${i}`);
  else console.log(`No ${fn}`);
}

// Check the second renderSidebar (the full one)
const idx2 = c.lastIndexOf('function renderSidebar');
console.log('\n=== renderSidebar (full) ===');
console.log(c.substring(idx2, idx2 + 800));
