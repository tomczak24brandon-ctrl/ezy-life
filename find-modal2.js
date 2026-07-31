const fs = require('fs');
const c = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');
// Find all modals
const modals = [];
let idx = 0;
while ((idx = c.indexOf("showModal('", idx)) !== -1) {
  const end = c.indexOf("')", idx + 11);
  const name = c.substring(idx + 11, end);
  modals.push({ name, pos: idx });
  idx++;
}
console.log('Modals called via showModal:', modals.map(m => m.name));

// Find the addfin modal definition - look for it in HTML
const htmlIdx = c.indexOf("'addfin'");
console.log('\nAll addfin references:');
let p = 0;
while ((p = c.indexOf('addfin', p)) !== -1) {
  console.log(p + ': ' + c.substring(p-20, p+60).replace(/\n/g,'↵'));
  p++;
}
