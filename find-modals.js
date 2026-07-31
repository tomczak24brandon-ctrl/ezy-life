const fs = require('fs');
const c = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');
// Search for modal HTML elements - they all follow pattern id="modal-X"
const re = /id="modal-([^"]+)"/g;
let m;
while ((m = re.exec(c)) !== null) {
  console.log('Found modal:', m[1], 'at', m.index);
}
