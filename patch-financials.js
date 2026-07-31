const fs = require('fs');
let html = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');

// ── 1. Replace the tab HTML inside page-fin-budgets ──────────────────────────
const OLD_TABS = `        <!-- Personal / Business tabs -->
        <div style="display:flex;gap:0;margin-bottom:20px;border-bottom:2px solid var(--border)">
          <div id="fin-tab-personal" class="biz-tab active" onclick="setFinTab('personal')" style="font-size:15px;font-weight:800;padding:10px 24px">👤 Personal</div>
          <div id="fin-tab-business" class="biz-tab" onclick="setFinTab('business')" style="font-size:15px;font-weight:800;padding:10px 24px">🏢 Business</div>
        </div>`;

const NEW_TABS = `        <!-- Financials tabs: Personal + 3 business entities -->
        <div style="display:flex;flex-wrap:wrap;gap:0;margin-bottom:20px;border-bottom:2px solid var(--border)">
          <div id="fin-tab-personal"  class="biz-tab active" onclick="setFinTab('personal')"  style="font-size:14px;font-weight:800;padding:10px 20px">👤 Personal</div>
          <div id="fin-tab-ietc"      class="biz-tab"        onclick="setFinTab('ietc')"       style="font-size:14px;font-weight:800;padding:10px 20px">🦅 Iron Eagle Truck Center</div>
          <div id="fin-tab-bn1"       class="biz-tab"        onclick="setFinTab('bn1')"        style="font-size:14px;font-weight:800;padding:10px 20px">🏢 B&amp;N Properties #1</div>
          <div id="fin-tab-bn2"       class="biz-tab"        onclick="setFinTab('bn2')"        style="font-size:14px;font-weight:800;padding:10px 20px">🏢 B&amp;N Properties #2</div>
        </div>`;

if (html.includes(OLD_TABS)) {
  html = html.replace(OLD_TABS, NEW_TABS);
  console.log('✅ Tab HTML replaced');
} else {
  console.log('❌ Tab HTML NOT FOUND — trying partial match');
  // Try to find it differently
  const idx = html.indexOf('fin-tab-personal');
  console.log('fin-tab-personal at index:', idx);
  console.log('Context:', html.substring(idx - 100, idx + 300));
}

// ── 2. Replace setFinTab function ─────────────────────────────────────────────
const OLD_SETTAB = `function setFinTab(tab) {
  _currentFinTab = tab;
  _currentFinAccountId = null;
  document.getElementById('fin-tab-personal').classList.toggle('active', tab === 'personal');
  document.getElementById('fin-tab-business').classList.toggle('active', tab === 'business');
  renderFinPage();
}`;

const NEW_SETTAB = `function setFinTab(tab) {
  _currentFinTab = tab;
  _currentFinAccountId = null;
  ['personal','ietc','bn1','bn2'].forEach(function(id) {
    var el = document.getElementById('fin-tab-' + id);
    if (el) el.classList.toggle('active', tab === id);
  });
  renderFinPage();
}`;

if (html.includes(OLD_SETTAB)) {
  html = html.replace(OLD_SETTAB, NEW_SETTAB);
  console.log('✅ setFinTab replaced');
} else {
  console.log('❌ setFinTab NOT FOUND');
  const idx = html.indexOf('function setFinTab');
  console.log('setFinTab at index:', idx);
  if (idx !== -1) console.log('Context:', html.substring(idx, idx + 400));
}

// ── 3. Update "Add Account" modal to show all 3 types as default options ──────
// Find the openAddFinAccountModal and check if it already has type selection
const hasTypeSelect = html.includes('openAddFinAccountModal') && html.includes('type="checkbook"');
console.log('Has type select in modal:', hasTypeSelect);

// ── 4. Save ───────────────────────────────────────────────────────────────────
fs.writeFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', html, 'utf8');
console.log('File saved. Size:', html.length);
