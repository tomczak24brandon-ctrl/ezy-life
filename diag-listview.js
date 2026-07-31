const fs = require('fs');
const html = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');
const lines = html.split('\n');

// Find daily list view header
console.log('=== Daily list view header / Print / list-header ===');
for (var i=0; i<lines.length; i++) {
  var l = lines[i];
  if (l.includes('list-view') || l.includes('listview') || l.includes('daily-list') || l.includes('list-header') || l.includes('tb-list') || l.includes('renderList') || l.includes('Print') || l.includes('print')) {
    console.log('['+i+']: '+l.trim().substring(0,120));
  }
}

// Find @media print if exists
console.log('\n=== existing @media print ===');
for (var i=0; i<lines.length; i++) {
  if (lines[i].includes('@media print')) console.log('['+i+']: '+lines[i].trim());
}

// Find the timeblocking page header area
console.log('\n=== page-timeblocking header area ===');
for (var i=0; i<lines.length; i++) {
  if (lines[i].includes('page-timeblocking') || lines[i].includes('id="timeblocking')) {
    console.log('['+i+']: '+lines[i].trim().substring(0,120));
  }
}
