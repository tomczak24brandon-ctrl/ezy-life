const fs = require('fs');
const html = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');
const lines = html.split('\n');

// Find hour/time gutter rendering
console.log('=== gcal-time-gutter / hour rendering ===');
var inFn = false, count = 0;
for (var i=0; i<lines.length; i++) {
  if (lines[i].includes('function renderGCal') || lines[i].includes('gcal-hour') || lines[i].includes('time-gutter') || lines[i].includes('gcal-row')) {
    console.log('['+i+']: '+lines[i].trim().substring(0,120));
  }
}

// Find the renderGCal function body
console.log('\n=== renderGCal function ===');
inFn = false; count = 0;
for (var i=0; i<lines.length; i++) {
  if (lines[i].includes('function renderGCal(')) { inFn = true; count = 0; }
  if (inFn) { console.log('['+i+']: '+lines[i]); count++; if(count>80) break; }
}
