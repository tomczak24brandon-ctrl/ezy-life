const fs = require('fs');
const t = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', 'utf8');

// Get .main CSS
const mainCSS = t.match(/^\.main\s*\{[^}]+\}/gm) || [];
console.log('=== .main CSS ===');
mainCSS.forEach(r => console.log(r));

// Also find all .main { blocks
const lines = t.split('\n');
lines.forEach((l, i) => {
  if (/^\.main\s*\{/.test(l.trim()) || (l.includes('.main') && l.includes('{'))) {
    if (!l.includes('.main-')) console.log((i+1)+': '+l.trim().substring(0,120));
  }
});

// Check page-timeblocking as sibling of main-content
const mainDiv = t.indexOf('<div class="main">');
const mc = t.indexOf('<div id="main-content">', mainDiv);
const tb = t.indexOf('<div id="page-timeblocking">', mainDiv);
console.log('\nmain div at:', mainDiv, '  main-content at:', mc, '  timeblocking at:', tb);
console.log('Both inside .main?', mc > mainDiv && tb > mainDiv);
// Check what comes between main-content end and timeblocking start
const mcEnd = t.lastIndexOf('</div>', tb);
console.log('Content between end of main-content and timeblocking:');
console.log(JSON.stringify(t.substring(mcEnd - 50, tb + 50)));
