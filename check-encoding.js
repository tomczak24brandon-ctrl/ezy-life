const fs = require('fs');
const c = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');

// Find the sidebar groups definition and show raw char codes around icon fields
const idx = c.indexOf("id:'home'");
if (idx === -1) { console.log("id:'home' not found"); } else {
  const snippet = c.substring(idx, idx + 60);
  console.log('Found at', idx, ':');
  console.log('Text:', snippet);
  console.log('Char codes:', [...snippet].map(ch => ch.charCodeAt(0).toString(16)).join(' '));
}

// Also find icon: and show what follows
const iconIdx = c.indexOf("icon:'");
if (iconIdx !== -1) {
  const snippet2 = c.substring(iconIdx, iconIdx + 20);
  console.log('\nFirst icon snippet:', snippet2);
  console.log('Char codes:', [...snippet2].map(ch => ch.charCodeAt(0).toString(16)).join(' '));
}

// Count occurrences of replacement char U+FFFD and question marks
const fffd = (c.match(/\uFFFD/g) || []).length;
const qmarks = (c.match(/\?/g) || []).length;
console.log('\nReplacement chars (U+FFFD):', fffd);
console.log('Question marks (?):', qmarks);
