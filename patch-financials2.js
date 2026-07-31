const fs = require('fs');
let html = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');

// ── 1. Add the missing modal-addfin HTML before the closing </body> ──────────
// Insert it right before modal-addvehicle (which we know exists at 201949)
const MODAL_ANCHOR = '<div id="modal-addvehicle"';

const NEW_MODAL = `<!-- ADD FIN ACCOUNT MODAL -->
<div id="modal-addfin" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999;align-items:center;justify-content:center">
  <div style="background:var(--bg2);border-radius:16px;padding:28px 32px;min-width:320px;max-width:440px;width:90%">
    <div style="font-size:18px;font-weight:800;margin-bottom:20px">Add Account</div>
    <div style="margin-bottom:14px">
      <label style="font-size:13px;color:var(--text2);display:block;margin-bottom:6px">Account Name</label>
      <input id="fin-acct-name" class="form-input" type="text" placeholder="e.g. Chase Checking" style="width:100%">
    </div>
    <div style="margin-bottom:20px">
      <label style="font-size:13px;color:var(--text2);display:block;margin-bottom:6px">Account Type</label>
      <select id="fin-acct-type" class="form-input" style="width:100%">
        <option value="budget">💰 Budget</option>
        <option value="checkbook">📒 Checkbook Ledger</option>
        <option value="credit">💳 Credit Card Ledger</option>
      </select>
    </div>
    <div style="display:flex;gap:10px;justify-content:flex-end">
      <button class="btn btn-outline" onclick="closeModal('addfin')">Cancel</button>
      <button class="btn btn-primary" onclick="saveFinAccount()">Add Account</button>
    </div>
  </div>
</div>

`;

if (html.includes(MODAL_ANCHOR)) {
  html = html.replace(MODAL_ANCHOR, NEW_MODAL + MODAL_ANCHOR);
  console.log('✅ modal-addfin inserted');
} else {
  console.log('❌ modal-addvehicle anchor not found');
}

// ── 2. Fix the tab HTML (in case not already done) ───────────────────────────
const OLD_TAB_HTML = `          <div id="fin-tab-personal" class="biz-tab active" onclick="setFinTab('personal')" style="font-size:15px;font-weight:800;padding:10px 24px">👤 Personal</div>
          <div id="fin-tab-business" class="biz-tab" onclick="setFinTab('business')" style="font-size:15px;font-weight:800;padding:10px 24px">🏢 Business</div>`;

// Check if already replaced
if (html.includes('fin-tab-ietc')) {
  console.log('✅ Tab HTML already updated (fin-tab-ietc found)');
} else if (html.includes(OLD_TAB_HTML)) {
  const NEW_TAB_HTML = `          <div id="fin-tab-personal"  class="biz-tab active" onclick="setFinTab('personal')"  style="font-size:14px;font-weight:800;padding:10px 18px">👤 Personal</div>
          <div id="fin-tab-ietc"      class="biz-tab"        onclick="setFinTab('ietc')"       style="font-size:14px;font-weight:800;padding:10px 18px">🦅 Iron Eagle Truck Center</div>
          <div id="fin-tab-bn1"       class="biz-tab"        onclick="setFinTab('bn1')"        style="font-size:14px;font-weight:800;padding:10px 18px">🏢 B&amp;N Properties #1</div>
          <div id="fin-tab-bn2"       class="biz-tab"        onclick="setFinTab('bn2')"        style="font-size:14px;font-weight:800;padding:10px 18px">🏢 B&amp;N Properties #2</div>`;
  html = html.replace(OLD_TAB_HTML, NEW_TAB_HTML);
  console.log('✅ Tab HTML replaced');
} else {
  console.log('❌ Old tab HTML not found either — checking current state');
  const idx = html.indexOf('fin-tab-');
  console.log('fin-tab- at:', idx, html.substring(idx, idx + 200));
}

// ── 3. Fix setFinTab if not already patched ──────────────────────────────────
if (html.includes("['personal','ietc','bn1','bn2']")) {
  console.log('✅ setFinTab already patched');
} else {
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
    console.log('❌ setFinTab not found');
    const idx2 = html.indexOf('function setFinTab');
    if (idx2 !== -1) console.log('Current setFinTab:', html.substring(idx2, idx2+300));
  }
}

// ── 4. Save ───────────────────────────────────────────────────────────────────
fs.writeFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', html, 'utf8');
console.log('✅ File saved. Size:', html.length);
