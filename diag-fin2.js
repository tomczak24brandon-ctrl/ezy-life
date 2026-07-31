const fs = require('fs');
const html = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');
const lines = html.split('\n');

// 1. Confirm _finAccounts / _currentFinTab var declarations - exact search
var found = false;
for (var i=0; i<lines.length; i++) {
  var l = lines[i].trim();
  if (l === 'var _currentFinTab = \'personal\';' || l === "var _currentFinTab = 'personal';") {
    console.log('FOUND _currentFinTab at line '+i+': '+l);
    found = true;
  }
  if (l === 'var _finAccounts = {};') {
    console.log('FOUND _finAccounts at line '+i+': '+l);
    found = true;
  }
}
if (!found) console.log('NOT FOUND - neither var declaration exists in file');

// 2. Check setFinTab function
console.log('\n=== setFinTab function ===');
var inFn = false, count = 0;
for (var i=0; i<lines.length; i++) {
  if (lines[i].includes('function setFinTab')) inFn = true;
  if (inFn) { console.log('['+i+']: '+lines[i]); count++; if(count>15) break; }
}

// 3. Check loadData for _finAccounts
console.log('\n=== loadData for finaccounts ===');
for (var i=0; i<lines.length; i++) {
  if (lines[i].includes('finaccounts') || lines[i].includes('ezy_fin')) {
    console.log('['+i+']: '+lines[i].trim().substring(0,120));
  }
}

// 3b. Check _currentFinAccountId declaration
console.log('\n=== _currentFinAccountId ===');
for (var i=0; i<lines.length; i++) {
  if (lines[i].includes('_currentFinAccountId') && lines[i].includes('var ')) {
    console.log('['+i+']: '+lines[i].trim());
  }
}

// 4. Check sidebar SECTION comment area for var decls
console.log('\n=== Lines around sidebar section (1370-1385) ===');
for (var i=1370; i<1386; i++) {
  console.log('['+i+']: '+lines[i]);
}
