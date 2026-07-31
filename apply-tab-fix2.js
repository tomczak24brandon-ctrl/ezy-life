const fs = require('fs');
let txt = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', 'utf8');

// ── 1. Fix outer wrapper to span full width, tabs flex:1 already set ──
txt = txt.replace(
  '<div style="display:flex;align-items:center;gap:6px"><div class="goals-tabs" id="goals-tabs">',
  '<div style="display:flex;align-items:center;gap:0;width:100%;border-bottom:1px solid var(--border)"><div class="goals-tabs" id="goals-tabs" style="flex:1;border-bottom:none;overflow:visible">'
);

// ── 2. Fix goals-tabs CSS so tabs actually span full width (remove overflow-x:auto that shrinks them) ──
txt = txt.replace(
  '.goals-tabs { display:flex; gap:0; border-bottom:1px solid var(--border); flex-shrink:0; overflow-x:auto; scrollbar-width:none; }',
  '.goals-tabs { display:flex; gap:0; flex-shrink:0; overflow:visible; }'
);

// ── 3. Replace goalsEditTabs with one-prompt-per-tab using separate prompts but guard against null properly ──
// Also fix: on mobile, multiple prompts work fine but textContent may include whitespace — trim it
txt = txt.replace(
  `function goalsEditTabs() {
  var tabs = document.querySelectorAll('.goals-tab[data-tab-key]');
  var labels = ['Tab 1 (Active Goals)', 'Tab 2 (All Goals)', 'Tab 3 (Complete goals)'];
  for (var i = 0; i < tabs.length; i++) {
    var current = tabs[i].textContent;
    var val = prompt('Enter new name for ' + labels[i] + ':', current);
    if (val === null) return; // user cancelled — abort all
    val = val.trim();
    if (!val) val = _goalsTabDefaults[i]; // restore default if blank
    localStorage.setItem('goalsTab' + i, val);
    tabs[i].textContent = val;
  }
}`,
  `function goalsEditTabs() {
  var tabs = document.querySelectorAll('.goals-tab[data-tab-key]');
  if (!tabs || tabs.length < 3) { alert('Could not find all 3 tabs. Try again.'); return; }
  // Prompt each tab individually — sequential native prompts
  var v0 = prompt('Tab 1 name (emoji + text):', tabs[0].textContent.trim());
  if (v0 === null) return;
  var v1 = prompt('Tab 2 name (emoji + text):', tabs[1].textContent.trim());
  if (v1 === null) return;
  var v2 = prompt('Tab 3 name (emoji + text):', tabs[2].textContent.trim());
  if (v2 === null) return;
  // Apply — restore default if blank
  var vals = [v0.trim()||_goalsTabDefaults[0], v1.trim()||_goalsTabDefaults[1], v2.trim()||_goalsTabDefaults[2]];
  tabs.forEach(function(tab, i) {
    localStorage.setItem('goalsTab' + i, vals[i]);
    tab.textContent = vals[i];
  });
}`
);

// ── Verify ──
const qq = (txt.match(/\?\?/g)||[]).length;
console.log('?? count:', qq);
console.log('Has goalsEditTabs:', txt.includes('goalsEditTabs'));
console.log('Has width:100%:', txt.includes('width:100%;border-bottom'));
console.log('Has \uD83C\uDFAF:', txt.includes('\uD83C\uDFAF'));
console.log('Has \u2705 Complete:', txt.includes('\u2705 Complete goals'));
console.log('Size:', Buffer.byteLength(txt,'utf8'), 'bytes');

fs.writeFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', txt, {encoding:'utf8'});
console.log('Saved.');
