const fs = require('fs');
const html = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');
const lines = html.split('\n');

// 1. Find the sidebar item for financials - what id does it use?
console.log('\n=== SIDEBAR ITEM FOR FINANCIALS ===');
for (var i=1260; i<1330; i++) {
  if (lines[i].includes('fin') || lines[i].includes('Fin') || lines[i].includes('budget')) {
    console.log('['+i+']: '+lines[i].trim());
  }
}

// 2. Check what page id it routes to
console.log('\n=== showPage calls for fin ===');
for (var i=0; i<lines.length; i++) {
  if (lines[i].includes("showPage") && (lines[i].includes('fin') || lines[i].includes('budget'))) {
    console.log('['+i+']: '+lines[i].trim());
  }
}

// 3. Does page-fin-budgets exist in HTML?
console.log('\n=== page-fin-budgets HTML ===');
for (var i=0; i<lines.length; i++) {
  if (lines[i].includes('page-fin-budgets') || lines[i].includes('id="fin-budgets"') || lines[i].includes("id='fin-budgets'")) {
    console.log('['+i+']: '+lines[i].trim().substring(0,120));
  }
}

// 4. Check renderFinPage function
console.log('\n=== renderFinPage function ===');
for (var i=0; i<lines.length; i++) {
  if (lines[i].includes('function renderFinPage') || lines[i].includes('renderFinPage()')) {
    console.log('['+i+']: '+lines[i].trim().substring(0,120));
  }
}

// 5. Check _finAccounts and _currentFinTab - are they declared anywhere?
console.log('\n=== _finAccounts / _currentFinTab declarations ===');
for (var i=0; i<lines.length; i++) {
  var l = lines[i];
  if ((l.includes('_finAccounts') || l.includes('_currentFinTab')) && (l.includes('var ') || l.trim().startsWith('var '))) {
    console.log('['+i+']: '+l.trim().substring(0,120));
  }
}

// 6. Check fin-budgets in showPage handler
console.log('\n=== showPage fin-budgets block ===');
for (var i=1555; i<1570; i++) {
  console.log('['+i+']: '+lines[i]);
}

// 7. Check what renderFinPage actually does (first 30 lines)
console.log('\n=== renderFinPage body ===');
var inFn = false;
var count = 0;
for (var i=0; i<lines.length; i++) {
  if (lines[i].includes('function renderFinPage')) { inFn = true; }
  if (inFn) {
    console.log('['+i+']: '+lines[i]);
    count++;
    if (count > 30) break;
  }
}

// 8. Check fin tabs HTML
console.log('\n=== fin tabs HTML ===');
for (var i=806; i<830; i++) {
  console.log('['+i+']: '+lines[i]);
}
