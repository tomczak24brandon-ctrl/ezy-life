const fs = require('fs');
const html = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');
const lines = html.split('\n');

// Find ALL renderSidebar definitions
console.log('=== ALL renderSidebar definitions ===');
for (var i=0; i<lines.length; i++) {
  if (lines[i].includes('function renderSidebar')) console.log('['+i+']: '+lines[i].trim());
}

// Show the LAST renderSidebar - does it have drag handle code?
var lastIdx = -1;
for (var i=0; i<lines.length; i++) {
  if (lines[i].includes('function renderSidebar')) lastIdx = i;
}
console.log('\n=== LAST renderSidebar (lines '+lastIdx+' to '+(lastIdx+50)+') ===');
for (var i=lastIdx; i<lastIdx+55; i++) {
  console.log('['+i+']: '+lines[i]);
}

// Check loadData around line 2801
console.log('\n=== loadData fin section ===');
for (var i=2795; i<2815; i++) {
  console.log('['+i+']: '+lines[i]);
}
