const fs = require('fs');
const t = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', 'utf8');
const lines = t.split('\n');
lines.forEach((l, i) => {
  if (/\.layout/.test(l)) {
    console.log((i+1)+': '+l.trim());
  }
});
