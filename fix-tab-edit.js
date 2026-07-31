const fs = require('fs');
let txt = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', 'utf8');

const oldFn = `function goalsEditTabs() {
  var tabs = document.querySelectorAll('.goals-tab[data-tab-key]');
  if (!tabs || tabs.length < 3) { alert('Could not find all 3 tabs. Try again.'); return; }
  // Prompt each tab individually \u2014 sequential native prompts
  var v0 = prompt('Tab 1 name (emoji + text):', tabs[0].textContent.trim());
  if (v0 === null) return;
  var v1 = prompt('Tab 2 name (emoji + text):', tabs[1].textContent.trim());
  if (v1 === null) return;
  var v2 = prompt('Tab 2 name (emoji + text):', tabs[2].textContent.trim());
  if (v2 === null) return;
  // Apply \u2014 restore default if blank
  var vals = [v0.trim()||_goalsTabDefaults[0], v1.trim()||_goalsTabDefaults[1], v2.trim()||_goalsTabDefaults[2]];
  tabs.forEach(function(tab, i) {
    localStorage.setItem('goalsTab' + i, vals[i]);
    tab.textContent = vals[i];
  });
}`;

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

if (!txt.includes(oldFn)) {
  // Try to find the function and show what's there for debugging
  const idx = txt.indexOf('function goalsEditTabs()');
  if (idx >= 0) {
    console.log('Found function at char', idx, '— actual content:');
    console.log(JSON.stringify(txt.slice(idx, idx + 800)));
  } else {
    console.log('goalsEditTabs not found at all!');
  }
  process.exit(1);
}

txt = txt.replace(oldFn, newFn);

const qq = (txt.match(/\?\?/g)||[]).length;
console.log('?? count:', qq);
console.log('Has single-prompt:', txt.includes('separate with |'));
console.log('Has \uD83C\uDFAF:', txt.includes('\uD83C\uDFAF'));
console.log('Size:', Buffer.byteLength(txt,'utf8'), 'bytes');

fs.writeFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', txt, {encoding:'utf8'});
console.log('Saved.');
