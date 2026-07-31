const https = require('https');
const fs = require('fs');

const token = 'vcp_0kEtvmApVQ4IWxG6Ko3BIAQTMF8GR6SgOhvGkerAZAQ30CRmlt3NYTs6';
const teamId = 'team_IGUGbCcmmIqBqrQz0zpvu1Zz';

function get(url, headers) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}
function post(url, headers, bodyObj) {
  return new Promise((resolve, reject) => {
    const data = Buffer.from(JSON.stringify(bodyObj), 'utf8');
    const u = new URL(url);
    const req = https.request({ hostname: u.hostname, path: u.pathname + u.search, method: 'POST',
      headers: { ...headers, 'Content-Length': data.length } }, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(JSON.parse(Buffer.concat(chunks).toString())));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  // Fresh from Vercel original
  const raw = await get(
    `https://api.vercel.com/v7/deployments/dpl_AYcCTWpNBuigC8YxdcbWXTyp2uZK/files/8aa2b40d2879087b06f50b9de16c7b1f6632f514?teamId=${teamId}`,
    { Authorization: `Bearer ${token}` }
  );
  let html = Buffer.from(JSON.parse(raw.toString()).data, 'base64').toString('utf8');
  console.log('✅ Fetched original. Size:', html.length);

  // ── FIX 1: Remove 3 debug alerts ─────────────────────────────────────────
  const alertFixes = [
    ["if (!group) { alert('DEBUG: group not found for id=' + groupId); return; }", "if (!group) { return; }"],
    ["if (group.items.length === 1) { alert('DEBUG: going to ' + group.items[0].id); showPage(group.items[0].id); return; }", "if (group.items.length === 1) { showPage(group.items[0].id); return; }"],
    ["alert('DEBUG: showing submenu for ' + groupId + ' with ' + group.items.length + ' items');", ""],
  ];
  for (const [from, to] of alertFixes) {
    if (html.includes(from)) { html = html.split(from).join(to); console.log('✅ Alert removed'); }
    else console.log('❌ Alert not found');
  }

  // ── FIX 2: Replace Personal/Business tabs with 4 entity tabs ─────────────
  const OLD_TABS = `        <!-- Personal / Business tabs -->
        <div style="display:flex;gap:0;margin-bottom:20px;border-bottom:2px solid var(--border)">
          <div id="fin-tab-personal" class="biz-tab active" onclick="setFinTab('personal')" style="font-size:15px;font-weight:800;padding:10px 24px">👤 Personal</div>
          <div id="fin-tab-business" class="biz-tab" onclick="setFinTab('business')" style="font-size:15px;font-weight:800;padding:10px 24px">🏢 Business</div>
        </div>`;
  const NEW_TABS = `        <!-- Financials entity tabs -->
        <div style="display:flex;flex-wrap:wrap;gap:0;margin-bottom:20px;border-bottom:2px solid var(--border)">
          <div id="fin-tab-personal" class="biz-tab active" onclick="setFinTab('personal')" style="font-size:14px;font-weight:700;padding:10px 16px">👤 Personal</div>
          <div id="fin-tab-ietc" class="biz-tab" onclick="setFinTab('ietc')" style="font-size:14px;font-weight:700;padding:10px 16px">🦅 Iron Eagle Truck Center</div>
          <div id="fin-tab-bn1" class="biz-tab" onclick="setFinTab('bn1')" style="font-size:14px;font-weight:700;padding:10px 16px">🏢 B&amp;N Properties #1</div>
          <div id="fin-tab-bn2" class="biz-tab" onclick="setFinTab('bn2')" style="font-size:14px;font-weight:700;padding:10px 16px">🏢 B&amp;N Properties #2</div>
        </div>`;
  if (html.includes(OLD_TABS)) { html = html.split(OLD_TABS).join(NEW_TABS); console.log('✅ Tabs replaced'); }
  else console.log('❌ Tabs not found');

  // ── FIX 3: Declare fin vars + fix setFinTab ───────────────────────────────
  const OLD_SETTAB = `function setFinTab(tab) {
  _currentFinTab = tab;
  _currentFinAccountId = null;
  document.getElementById('fin-tab-personal').classList.toggle('active', tab === 'personal');
  document.getElementById('fin-tab-business').classList.toggle('active', tab === 'business');
  renderFinPage();
}`;
  const NEW_SETTAB = `// Financials state
var _finAccounts = {};
var _currentFinTab = 'personal';
var _currentFinAccountId = null;
var _currentBudgetMonth = null;
var _budgetItemEdit = null;

function setFinTab(tab) {
  _currentFinTab = tab;
  _currentFinAccountId = null;
  ['personal','ietc','bn1','bn2'].forEach(function(id) {
    var el = document.getElementById('fin-tab-' + id);
    if (el) el.classList.toggle('active', tab === id);
  });
  renderFinPage();
}`;
  if (html.includes(OLD_SETTAB)) { html = html.split(OLD_SETTAB).join(NEW_SETTAB); console.log('✅ setFinTab + vars declared'); }
  else console.log('❌ setFinTab not matched');

  // ── FIX 4: Add modal-addfin ───────────────────────────────────────────────
  const MODAL_ADDFIN = `
<!-- ADD FIN ACCOUNT MODAL -->
<div id="modal-addfin" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999;align-items:center;justify-content:center">
  <div class="modal-box" style="min-width:320px;max-width:440px;width:90%">
    <div class="modal-header"><span style="font-size:17px;font-weight:800">Add Account</span></div>
    <div class="modal-body">
      <div class="form-group form-full">
        <label class="form-label">Account Name</label>
        <input id="fin-acct-name" class="form-input" type="text" placeholder="e.g. Chase Checking" autocomplete="off">
      </div>
      <div class="form-group form-full">
        <label class="form-label">Account Type</label>
        <select id="fin-acct-type" class="form-input">
          <option value="budget">💰 Budget</option>
          <option value="checkbook">📒 Checkbook Ledger</option>
          <option value="credit">💳 Credit Card Ledger</option>
        </select>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal('addfin')">Cancel</button>
      <button class="btn btn-primary" onclick="saveFinAccount()">Add Account ✓</button>
    </div>
  </div>
</div>
`;

  // ── FIX 5: Add Quick Links section to dashboard + pin modal ──────────────
  // Insert Quick Links section right before the tax-banner
  const DASHBOARD_ANCHOR = '<div class="tax-banner">';
  const QUICK_LINKS_HTML = `<div id="dash-quicklinks-section" style="margin-bottom:20px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
            <div style="font-size:15px;font-weight:800;color:var(--text2)">⚡ Quick Links</div>
            <button class="btn btn-outline" onclick="openPinModal()" style="font-size:12px;padding:5px 12px">+ Pin Account</button>
          </div>
          <div id="dash-quicklinks" style="display:flex;flex-wrap:wrap;gap:10px"></div>
        </div>
        `;
  if (html.includes(DASHBOARD_ANCHOR)) {
    html = html.split(DASHBOARD_ANCHOR).join(QUICK_LINKS_HTML + DASHBOARD_ANCHOR);
    console.log('✅ Quick Links section added to dashboard');
  } else {
    console.log('❌ tax-banner anchor not found');
  }

  // ── FIX 6: Add Pin Account modal HTML ─────────────────────────────────────
  const PIN_MODAL = `
<!-- PIN ACCOUNT MODAL -->
<div id="modal-pinaccount" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999;align-items:center;justify-content:center">
  <div class="modal-box" style="min-width:320px;max-width:480px;width:92%">
    <div class="modal-header"><span style="font-size:17px;font-weight:800">📌 Pin Account to Dashboard</span></div>
    <div class="modal-body">
      <div class="form-group form-full">
        <label class="form-label">Entity</label>
        <select id="pin-tab" class="form-input" onchange="updatePinAccounts()">
          <option value="personal">👤 Personal</option>
          <option value="ietc">🦅 Iron Eagle Truck Center</option>
          <option value="bn1">🏢 B&amp;N Properties #1</option>
          <option value="bn2">🏢 B&amp;N Properties #2</option>
        </select>
      </div>
      <div class="form-group form-full">
        <label class="form-label">Account</label>
        <select id="pin-account" class="form-input"></select>
      </div>
      <div id="pin-no-accounts" style="display:none;color:var(--text2);font-size:13px;margin-top:8px">No accounts yet for this entity. Go to Financials to add one first.</div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal('pinaccount')">Cancel</button>
      <button class="btn btn-primary" onclick="savePinAccount()">Pin to Dashboard ✓</button>
    </div>
  </div>
</div>
`;

  // Insert both modals before </body>
  const bodyEnd = html.lastIndexOf('</body>');
  if (bodyEnd !== -1) {
    html = html.slice(0, bodyEnd) + MODAL_ADDFIN + PIN_MODAL + html.slice(bodyEnd);
    console.log('✅ modal-addfin + modal-pinaccount inserted');
  } else {
    console.log('❌ </body> not found');
  }

  // ── FIX 7: Add Quick Links JS logic ──────────────────────────────────────
  // Insert JS right before setFinTab
  const JS_ANCHOR = '// Financials state\nvar _finAccounts = {};';
  const QUICKLINKS_JS = `// ============================================================
// ===== DASHBOARD QUICK LINKS =====
// ============================================================
var _pinnedAccounts = []; // [{tab, accountId, label, icon, type}]

function loadPinnedAccounts() {
  try {
    var p = localStorage.getItem('ezy_pinned_accounts_v1');
    if (p) _pinnedAccounts = JSON.parse(p);
  } catch(e) {}
}

function savePinnedAccounts() {
  try { localStorage.setItem('ezy_pinned_accounts_v1', JSON.stringify(_pinnedAccounts)); } catch(e) {}
}

function renderDashboardQuickLinks() {
  var el = document.getElementById('dash-quicklinks');
  if (!el) return;
  if (_pinnedAccounts.length === 0) {
    el.innerHTML = '<div style="color:var(--text2);font-size:13px;padding:6px 0">No pinned accounts yet — click <b>+ Pin Account</b> to add one.</div>';
    return;
  }
  el.innerHTML = _pinnedAccounts.map(function(p, i) {
    return '<div style="display:flex;align-items:center;gap:8px;background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:10px 16px;cursor:pointer;transition:background 0.15s" onclick="openPinnedAccount('+i+')" onmouseover="this.style.background=\'var(--hover)\'" onmouseout="this.style.background=\'var(--surface)\'">'
      + '<span style="font-size:22px">'+p.icon+'</span>'
      + '<div><div style="font-size:13px;font-weight:700">'+esc(p.label)+'</div><div style="font-size:11px;color:var(--text2)">'+esc(p.entityLabel)+' · '+esc(p.typeName)+'</div></div>'
      + '<button onclick="event.stopPropagation();unpinAccount('+i+')" style="margin-left:10px;background:none;border:none;color:var(--text2);cursor:pointer;font-size:14px" title="Unpin">✕</button>'
      + '</div>';
  }).join('');
}

function openPinnedAccount(idx) {
  var p = _pinnedAccounts[idx];
  if (!p) return;
  setFinTab(p.tab);
  _currentFinAccountId = p.accountId;
  showPage('fin-budgets');
  renderFinPage();
}

function unpinAccount(idx) {
  _pinnedAccounts.splice(idx, 1);
  savePinnedAccounts();
  renderDashboardQuickLinks();
}

var _TAB_LABELS = { personal:'👤 Personal', ietc:'🦅 Iron Eagle Truck Center', bn1:'🏢 B&N Properties #1', bn2:'🏢 B&N Properties #2' };

function openPinModal() {
  updatePinAccounts();
  showModal('pinaccount');
}

function updatePinAccounts() {
  var tab = document.getElementById('pin-tab').value;
  var sel = document.getElementById('pin-account');
  var noAccts = document.getElementById('pin-no-accounts');
  var accounts = (_finAccounts && _finAccounts[tab]) ? _finAccounts[tab] : [];
  if (accounts.length === 0) {
    sel.innerHTML = '';
    sel.style.display = 'none';
    noAccts.style.display = 'block';
  } else {
    sel.style.display = 'block';
    noAccts.style.display = 'none';
    sel.innerHTML = accounts.map(function(a) {
      return '<option value="'+a.id+'">'+a.icon+' '+esc(a.name)+'</option>';
    }).join('');
  }
}

function savePinAccount() {
  var tab = document.getElementById('pin-tab').value;
  var sel = document.getElementById('pin-account');
  if (!sel.value) { alert('No account selected.'); return; }
  var accounts = (_finAccounts && _finAccounts[tab]) ? _finAccounts[tab] : [];
  var acct = accounts.find(function(a){ return a.id === sel.value; });
  if (!acct) { alert('Account not found.'); return; }
  var typeNames = { budget:'Budget', checkbook:'Checkbook Ledger', credit:'Credit Card Ledger' };
  // Don't duplicate
  var exists = _pinnedAccounts.find(function(p){ return p.tab === tab && p.accountId === acct.id; });
  if (exists) { closeModal('pinaccount'); return; }
  _pinnedAccounts.push({
    tab: tab,
    accountId: acct.id,
    label: acct.name,
    icon: acct.icon,
    typeName: typeNames[acct.type] || acct.type,
    entityLabel: _TAB_LABELS[tab] || tab
  });
  savePinnedAccounts();
  closeModal('pinaccount');
  renderDashboardQuickLinks();
}

`;

  if (html.includes(JS_ANCHOR)) {
    html = html.split(JS_ANCHOR).join(QUICKLINKS_JS + JS_ANCHOR);
    console.log('✅ Quick Links JS added');
  } else {
    console.log('❌ JS anchor not found');
  }

  // ── FIX 8: Hook renderDashboardQuickLinks into page init ─────────────────
  // Find where showPage calls renderFinPage and also call renderDashboardQuickLinks on dashboard
  const OLD_SHOWPAGE_FIN = "  if (id === 'fin-budgets') { renderFinPage(); }";
  const NEW_SHOWPAGE_FIN = "  if (id === 'fin-budgets') { renderFinPage(); }\n  if (id === 'dashboard') { loadPinnedAccounts(); renderDashboardQuickLinks(); }";
  if (html.includes(OLD_SHOWPAGE_FIN)) {
    html = html.split(OLD_SHOWPAGE_FIN).join(NEW_SHOWPAGE_FIN);
    console.log('✅ Dashboard render hook added');
  } else {
    console.log('❌ showPage fin hook not found');
  }

  // Also call it on initial load - find the loadData() call or init
  const OLD_LOAD = "  loadData();";
  const NEW_LOAD = "  loadData();\n  loadPinnedAccounts();\n  setTimeout(renderDashboardQuickLinks, 50);";
  // Only replace first occurrence
  const loadIdx = html.indexOf(OLD_LOAD);
  if (loadIdx !== -1) {
    html = html.slice(0, loadIdx) + NEW_LOAD + html.slice(loadIdx + OLD_LOAD.length);
    console.log('✅ loadPinnedAccounts hooked into init');
  } else {
    console.log('❌ loadData hook not found');
  }

  // ── VERIFY ────────────────────────────────────────────────────────────────
  const checks = {
    'modal-addfin': html.includes('modal-addfin'),
    'modal-pinaccount': html.includes('modal-pinaccount'),
    'dash-quicklinks': html.includes('dash-quicklinks'),
    'fin-tab-ietc': html.includes('fin-tab-ietc'),
    'var _finAccounts': html.includes('var _finAccounts'),
    'var _currentFinTab': html.includes("var _currentFinTab = 'personal'"),
    'no-debug-alerts': !html.includes("alert('DEBUG"),
    'has-emojis': /[\u{1F000}-\u{1FFFF}]/u.test(html),
    '_pinnedAccounts': html.includes('var _pinnedAccounts'),
  };
  console.log('\nVerification:');
  let allGood = true;
  Object.entries(checks).forEach(([k,v]) => { console.log(`  ${v?'✅':'❌'} ${k}`); if(!v) allGood=false; });
  if (!allGood) { console.log('\n❌ Aborting.'); process.exit(1); }

  fs.writeFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', html, 'utf8');
  console.log('\nSaved. Size:', html.length);

  // ── DEPLOY ────────────────────────────────────────────────────────────────
  console.log('\nDeploying...');
  const dep = await post(
    `https://api.vercel.com/v13/deployments?teamId=${teamId}`,
    { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    { name: 'ezy-life', target: 'production', files: [{ file: 'index.html', data: html, encoding: 'utf-8' }] }
  );
  console.log('ID:', dep.id, '| State:', dep.readyState);

  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 3000));
    const r = JSON.parse((await get(`https://api.vercel.com/v13/deployments/${dep.id}?teamId=${teamId}`, { Authorization: `Bearer ${token}` })).toString());
    console.log(`[${i}] ${r.readyState}`);
    if (r.readyState === 'READY') break;
    if (r.readyState === 'ERROR') { console.error('Deploy failed!'); process.exit(1); }
  }

  for (const alias of ['ezy-life.vercel.app', 'ezy-life-iron-eagle-truck-center.vercel.app']) {
    const r = await post(`https://api.vercel.com/v2/deployments/${dep.id}/aliases?teamId=${teamId}`,
      { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, { alias });
    console.log('Alias:', alias, r.uid ? '✅' : JSON.stringify(r).substring(0,80));
  }

  console.log('\n🚀 Live at https://ezy-life.vercel.app');
}

main().catch(console.error);
