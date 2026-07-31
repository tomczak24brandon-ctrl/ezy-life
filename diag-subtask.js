const fs = require('fs');
const html = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');
const lines = html.split('\n');

// Find saveTask / addTask functions
console.log('=== saveTask / addTask functions ===');
var inFn = false, count = 0, startLine = -1;
for (var i=0; i<lines.length; i++) {
  if (lines[i].includes('function saveTask') || lines[i].includes('function addTask')) {
    inFn = true; startLine = i; count = 0;
    console.log('\n--- Found at line '+i+' ---');
  }
  if (inFn) {
    console.log('['+i+']: '+lines[i]);
    count++;
    if (count > 40) { inFn = false; }
  }
}

// Find sub-task input element id
console.log('\n=== sub-task input elements ===');
for (var i=0; i<lines.length; i++) {
  var l = lines[i];
  if (l.includes('sub') && (l.includes('input') || l.includes('Input') || l.includes('step') || l.includes('Step')) && (l.includes('id=') || l.includes('.value'))) {
    console.log('['+i+']: '+l.trim().substring(0,120));
  }
}

// Find _newSubs usage
console.log('\n=== _newSubs resets ===');
for (var i=0; i<lines.length; i++) {
  if (lines[i].includes('_newSubs') && (lines[i].includes('= []') || lines[i].includes('=[]'))) {
    console.log('['+i+']: '+lines[i].trim().substring(0,120));
  }
}
