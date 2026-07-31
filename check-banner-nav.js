const fs = require('fs');
const t = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', 'utf8');

// Check current banner HTML
const tbIdx = t.indexOf('<div id="gcal-overdue-banner"');
console.log('=== Banner HTML ===');
console.log(t.substring(tbIdx, tbIdx + 200));

// Check goalsGoTab
const ggtIdx = t.indexOf('function goalsGoTab');
console.log('\n=== goalsGoTab ===');
console.log(t.substring(ggtIdx, ggtIdx + 400));

// Check if there's a highlight/scroll function for goals
['scrollToGoal','highlightGoal','focusGoal','goalsScroll'].forEach(fn => {
  const i = t.indexOf('function ' + fn);
  if (i >= 0) { console.log('\n=== ' + fn + ' ==='); console.log(t.substring(i, i + 200)); }
});

// Check how goals tabs are indexed
const tabsIdx = t.indexOf('_goalsTabIdx');
console.log('\n=== _goalsTabIdx ===');
console.log(t.substring(tabsIdx - 50, tabsIdx + 200));
