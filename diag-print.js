const fs = require('fs');
const html = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');
const lines = html.split('\n');

// Show full current @media print block
console.log('=== @media print block ===');
var inPrint = false;
for (var i=0; i<lines.length; i++) {
  if (lines[i].includes('@media print')) inPrint = true;
  if (inPrint) {
    console.log('['+i+']: '+lines[i]);
    if (inPrint && lines[i].trim() === '}') { inPrint = false; break; }
  }
}

// Check what id page-home vs page-dashboard vs home is
console.log('\n=== page home / dashboard ids ===');
for (var i=0; i<lines.length; i++) {
  var l = lines[i];
  if (l.includes('id="page-home"') || l.includes("id='page-home'") || l.includes('id="page-dashboard"') || l.includes("id='page-dashboard'")) {
    console.log('['+i+']: '+l.trim().substring(0,120));
  }
}

// Check what showPage sets active on home
console.log('\n=== home active class logic ===');
for (var i=1580; i<1650; i++) {
  if (lines[i].includes('home') || lines[i].includes('active')) {
    console.log('['+i+']: '+lines[i].trim().substring(0,120));
  }
}

// Does timeblocking get .active class?
console.log('\n=== timeblocking active class ===');
for (var i=1560; i<1600; i++) {
  console.log('['+i+']: '+lines[i]);
}
