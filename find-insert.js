const fs = require('fs');
const c = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');
const bodyEnd = c.indexOf('</body>');
console.log('</body> at:', bodyEnd, 'of', c.length);
console.log('Context around </body>:');
console.log(c.substring(bodyEnd - 300, bodyEnd + 20));

// Find last modal
const re = /id="modal-[^"]+"/g;
let m, last;
while ((m = re.exec(c)) !== null) last = { name: m[0], pos: m.index };
console.log('\nLast modal:', last);
