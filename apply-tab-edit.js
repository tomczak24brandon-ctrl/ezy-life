const fs = require('fs');
let txt = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', 'utf8');

// ── 1. Fix the Complete goals tab (has a ?? from corruption) and add data-tab-key attrs ──
txt = txt.replace(
  '<div class="goals-tab active" data-panel="0" onclick="goalsGoTab(0)">\uD83C\uDFAF Active Goals</div>\n          <div class="goals-tab" data-panel="1" onclick="goalsGoTab(1)">\uD83D\uDCCB All Goals</div>\n          <div class="goals-tab" data-panel="2" onclick="goalsGoTab(2)">? Complete goals</div>',
  '<div class="goals-tab active" data-panel="0" data-tab-key="tab0" onclick="goalsGoTab(0)">\uD83C\uDFAF Active Goals</div>\n          <div class="goals-tab" data-panel="1" data-tab-key="tab1" onclick="goalsGoTab(1)">\uD83D\uDCCB All Goals</div>\n          <div class="goals-tab" data-panel="2" data-tab-key="tab2" onclick="goalsGoTab(2)">\u2705 Complete goals</div>'
);

// ── 2. Add edit pencil button after closing </div> of goals-tabs container ──
txt = txt.replace(
  '<div class="goals-tabs" id="goals-tabs">',
  '<div style="display:flex;align-items:center;gap:6px"><div class="goals-tabs" id="goals-tabs">'
);
txt = txt.replace(
  '        </div>\n        <!-- Carousel track -->',
  '        </div><button onclick="goalsEditTabs()" title="Edit tab names" style="background:none;border:none;cursor:pointer;font-size:15px;color:var(--text3);padding:2px 4px;flex-shrink:0;" onmouseover="this.style.color=\'var(--accent)\'" onmouseout="this.style.color=\'var(--text3)\'">&#x270F;&#xFE0F;</button></div>\n        <!-- Carousel track -->'
);

// ── 3. Add CSS for goals-tabs flex wrapper (already inline above, no extra CSS needed) ──

// ── 4. Add goalsTabDefaults, goalsLoadTabs, goalsEditTabs functions before goalsGoTab ──
const newFunctions = `
// ===== GOALS TAB CUSTOMIZATION =====
var _goalsTabDefaults = ['\uD83C\uDFAF Active Goals', '\uD83D\uDCCB All Goals', '\u2705 Complete goals'];
function goalsLoadTabs() {
  var tabs = document.querySelectorAll('.goals-tab[data-tab-key]');
  tabs.forEach(function(tab, i) {
    var key = 'goalsTab' + i;
    var saved = localStorage.getItem(key);
    if (saved) tab.textContent = saved;
  });
}
function goalsEditTabs() {
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
}
`;

txt = txt.replace(
  'function goalsGoTab(idx) {',
  newFunctions + 'function goalsGoTab(idx) {'
);

// ── 5. Call goalsLoadTabs() when Goals page is opened ──
txt = txt.replace(
  "if (id === 'goals') { renderKanban(); goalsGoTab(_goalsTabIdx); goalsCarouselInit(); }",
  "if (id === 'goals') { renderKanban(); goalsGoTab(_goalsTabIdx); goalsCarouselInit(); goalsLoadTabs(); }"
);

// ── 6. Also call goalsLoadTabs on DOMContentLoaded so tabs persist on first paint ──
// Find the DOMContentLoaded or window.onload call
txt = txt.replace(
  'document.addEventListener(\'DOMContentLoaded\', function() {',
  'document.addEventListener(\'DOMContentLoaded\', function() {\n  goalsLoadTabs();'
);

// ── Verify ──
const qqCount = (txt.match(/\?\?/g) || []).length;
console.log('?? count:', qqCount);
console.log('Has goalsEditTabs:', txt.includes('goalsEditTabs'));
console.log('Has goalsLoadTabs:', txt.includes('goalsLoadTabs'));
console.log('Has data-tab-key:', txt.includes('data-tab-key'));
console.log('Has \u2705 Complete goals:', txt.includes('\u2705 Complete goals'));
console.log('Has \uD83C\uDFAF:', txt.includes('\uD83C\uDFAF'));
console.log('Has \uD83C\uDFE0:', txt.includes('\uD83C\uDFE0'));
console.log('Size:', Buffer.byteLength(txt, 'utf8'), 'bytes');

fs.writeFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', txt, { encoding: 'utf8' });
console.log('Saved.');
