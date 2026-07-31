const fs = require('fs');
let txt = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', 'utf8');

// Find and replace the entire goalsEditTabs function by locating its boundaries
const startMarker = 'function goalsEditTabs() {';
const endMarker = '\nfunction goalsGoTab(idx) {';

const startIdx = txt.indexOf(startMarker);
const endIdx = txt.indexOf(endMarker);

if (startIdx < 0 || endIdx < 0) {
  console.error('Could not find markers. startIdx:', startIdx, 'endIdx:', endIdx);
  process.exit(1);
}

console.log('Replacing chars', startIdx, 'to', endIdx);
console.log('Old function:\n', txt.slice(startIdx, endIdx));

const newFn = `function goalsEditTabs() {
  var tabs = document.querySelectorAll('.goals-tab[data-tab-key]');
  if (!tabs || tabs.length < 3) { alert('Could not find all 3 tabs. Try again.'); return; }
  var t0 = tabs[0].textContent.trim();
  var t1 = tabs[1].textContent.trim();
  var t2 = tabs[2].textContent.trim();
  var raw = prompt('Edit all 3 tab names \u2014 separate with |\\n\\nFormat: Tab1 | Tab2 | Tab3\\n\\nCurrent:', t0 + ' | ' + t1 + ' | ' + t2);
  if (raw === null) return;
  var parts = raw.split('|');
  var vals = [
    (parts[0]||'').trim() || _goalsTabDefaults[0],
    (parts[1]||'').trim() || _goalsTabDefaults[1],
    (parts[2]||'').trim() || _goalsTabDefaults[2]
  ];
  tabs.forEach(function(tab, i) {
    localStorage.setItem('goalsTab' + i, vals[i]);
    tab.textContent = vals[i];
  });
}`;

txt = txt.slice(0, startIdx) + newFn + txt.slice(endIdx);

const qq = (txt.match(/\?\?/g)||[]).length;
console.log('?? count:', qq);
console.log('Has single-prompt:', txt.includes('separate with |'));
console.log('Has goalsGoTab after:', txt.includes('function goalsGoTab(idx)'));
console.log('Has \uD83C\uDFAF:', txt.includes('\uD83C\uDFAF'));
console.log('Size:', Buffer.byteLength(txt,'utf8'), 'bytes');

fs.writeFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', txt, {encoding:'utf8'});
console.log('Saved.');
