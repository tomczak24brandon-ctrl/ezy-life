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

// String building helper to avoid quoting hell
function q(s) { return s; }

async function main() {
  const raw = await get(
    `https://api.vercel.com/v7/deployments/dpl_AYcCTWpNBuigC8YxdcbWXTyp2uZK/files/8aa2b40d2879087b06f50b9de16c7b1f6632f514?teamId=${teamId}`,
    { Authorization: `Bearer ${token}` }
  );
  let html = Buffer.from(JSON.parse(raw.toString()).data, 'base64').toString('utf8');
  console.log('✅ Fresh original. Size:', html.length);

  function patch(label, from, to) {
    if (html.includes(from)) { html = html.split(from).join(to); console.log('✅ ' + label); }
    else { console.log('❌ ' + label + ' — not found'); }
  }

  // 1. Remove debug alerts
  patch('alert1', "if (!group) { alert('DEBUG: group not found for id=' + groupId); return; }", "if (!group) { return; }");
  patch('alert2', "if (group.items.length === 1) { alert('DEBUG: going to ' + group.items[0].id); showPage(group.items[0].id); return; }", "if (group.items.length === 1) { showPage(group.items[0].id); return; }");
  patch('alert3', "alert('DEBUG: showing submenu for ' + groupId + ' with ' + group.items.length + ' items');", "");

  // 2. Four financials tabs
  patch('fin-tabs',
    "        <!-- Personal / Business tabs -->\n        <div style=\"display:flex;gap:0;margin-bottom:20px;border-bottom:2px solid var(--border)\">\n          <div id=\"fin-tab-personal\" class=\"biz-tab active\" onclick=\"setFinTab('personal')\" style=\"font-size:15px;font-weight:800;padding:10px 24px\">\uD83D\uDC64 Personal</div>\n          <div id=\"fin-tab-business\" class=\"biz-tab\" onclick=\"setFinTab('business')\" style=\"font-size:15px;font-weight:800;padding:10px 24px\">\uD83C\uDFE2 Business</div>\n        </div>",
    "        <!-- Financials entity tabs -->\n        <div style=\"display:flex;flex-wrap:wrap;gap:0;margin-bottom:20px;border-bottom:2px solid var(--border)\">\n          <div id=\"fin-tab-personal\" class=\"biz-tab active\" onclick=\"setFinTab('personal')\" style=\"font-size:14px;font-weight:700;padding:10px 16px\">\uD83D\uDC64 Personal</div>\n          <div id=\"fin-tab-ietc\" class=\"biz-tab\" onclick=\"setFinTab('ietc')\" style=\"font-size:14px;font-weight:700;padding:10px 16px\">\uD83E\uDAC5 Iron Eagle Truck Center</div>\n          <div id=\"fin-tab-bn1\" class=\"biz-tab\" onclick=\"setFinTab('bn1')\" style=\"font-size:14px;font-weight:700;padding:10px 16px\">\uD83C\uDFE2 B&amp;N Properties #1</div>\n          <div id=\"fin-tab-bn2\" class=\"biz-tab\" onclick=\"setFinTab('bn2')\" style=\"font-size:14px;font-weight:700;padding:10px 16px\">\uD83C\uDFE2 B&amp;N Properties #2</div>\n        </div>"
  );

  // 3. Fin state vars + setFinTab
  patch('setFinTab',
    "function setFinTab(tab) {\n  _currentFinTab = tab;\n  _currentFinAccountId = null;\n  document.getElementById('fin-tab-personal').classList.toggle('active', tab === 'personal');\n  document.getElementById('fin-tab-business').classList.toggle('active', tab === 'business');\n  renderFinPage();\n}",
    "// Financials state\nvar _finAccounts = {};\nvar _currentFinTab = 'personal';\nvar _currentFinAccountId = null;\nvar _currentBudgetMonth = null;\nvar _budgetItemEdit = null;\n\nfunction setFinTab(tab) {\n  _currentFinTab = tab;\n  _currentFinAccountId = null;\n  ['personal','ietc','bn1','bn2'].forEach(function(id) {\n    var el = document.getElementById('fin-tab-' + id);\n    if (el) el.classList.toggle('active', tab === id);\n  });\n  renderFinPage();\n}"
  );

  // 4. Dashboard quick links section
  patch('ql-section',
    '<div class="tax-banner">',
    '<div id="dash-quicklinks-section" style="margin-bottom:20px">\n          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">\n            <div style="font-size:15px;font-weight:800;color:var(--text2)">\u26A1 Quick Links</div>\n            <button class="btn btn-outline" onclick="openPinModal()" style="font-size:12px;padding:5px 12px">+ Pin Account</button>\n          </div>\n          <div id="dash-quicklinks" style="display:flex;flex-wrap:wrap;gap:10px"></div>\n        </div>\n        <div class="tax-banner">'
  );

  // 5. Wire nav item drag — find exact snippet from file output above and replace
  // Exact string from file: html += '<div class="nav-item" id="nav-'+item.id+'" onclick="showPage(\''+item.id+'\')"><span class="icon">'+item.icon+'</span>'+esc(item.label)+badge+'</div>';
  {
    const NAV_OLD = `html += '<div class="nav-item" id="nav-'+item.id+'" onclick="showPage(\\''+item.id+'\\')"><span class="icon">'+item.icon+'</span>'+esc(item.label)+badge+'</div>';`;
    const NAV_NEW = `html += '<div class="nav-item" id="nav-'+item.id+'" draggable="true" ondragstart="sgItemDragStart(event,'+gi+','+ii+')" ondragover="sgItemDragOver(event,'+gi+','+ii+')" ondrop="sgItemDrop(event,'+gi+','+ii+')" ondragend="sgItemDragEnd(event,'+gi+','+ii+')" onclick="showPage(\\''+item.id+'\\')"><span class="icon">'+item.icon+'</span>'+esc(item.label)+badge+'</div>';`;
    patch('nav-item-drag', NAV_OLD, NAV_NEW);
  }

  // 6. Remove debug console.log in renderSidebar
  {
    const idx = html.indexOf("console.log('SIDEBAR GROUPS'");
    if (idx !== -1) {
      const ls = html.lastIndexOf('\n', idx);
      const le = html.indexOf('\n', idx);
      html = html.slice(0, ls) + html.slice(le);
      console.log('✅ debug console.log removed');
    } else {
      console.log('⚠️  no debug log (ok)');
    }
  }

  // 7. Wire group drag to header
  patch('grp-drag',
    `html += '<div class="sg-grp-header" onclick="sgToggleCollapse('+gi+')">';`,
    `html += '<div class="sg-grp-header" draggable="true" ondragstart="sgDragStart(event,'+gi+')" ondragover="sgDragOver(event,'+gi+')" ondrop="sgDrop(event,'+gi+')" ondragend="sgDragEnd(event)" onclick="sgToggleCollapse('+gi+')">';`
  );

  // 8. Quick Links + Pin Modal JS
  const QUICKLINKS_JS = `
// ===== DASHBOARD QUICK LINKS =====
var _pinnedAccounts = [];
function loadPinnedAccounts() {
  try { var p = localStorage.getItem('ezy_pinned_accounts_v1'); if (p) _pinnedAccounts = JSON.parse(p); } catch(e) {}
}
function savePinnedAccounts() {
  try { localStorage.setItem('ezy_pinned_accounts_v1', JSON.stringify(_pinnedAccounts)); } catch(e) {}
}
function renderDashboardQuickLinks() {
  var el = document.getElementById('dash-quicklinks');
  if (!el) return;
  if (_pinnedAccounts.length === 0) {
    el.innerHTML = '<div style="color:var(--text2);font-size:13px;padding:6px 0">No pinned accounts yet \u2014 click <b>+ Pin Account</b> to add one.</div>';
    return;
  }
  el.innerHTML = _pinnedAccounts.map(function(p, i) {
    return '<div style="display:flex;align-items:center;gap:8px;background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:10px 16px;cursor:pointer;transition:background 0.15s" onclick="openPinnedAccount('+i+')" onmouseover="this.style.background=\'var(--hover)\'" onmouseout="this.style.background=\'var(--surface)\'">'
      + '<span style="font-size:22px">'+p.icon+'</span>'
      + '<div><div style="font-size:13px;font-weight:700">'+esc(p.label)+'</div><div style="font-size:11px;color:var(--text2)">'+esc(p.entityLabel)+' \xb7 '+esc(p.typeName)+'</div></div>'
      + '<button onclick="event.stopPropagation();unpinAccount('+i+')" style="margin-left:12px;background:none;border:none;color:var(--text2);cursor:pointer;font-size:16px" title="Unpin">\u00d7</button>'
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
var _TAB_LABELS = { personal:'\uD83D\uDC64 Personal', ietc:'\uD83E\uDAC5 Iron Eagle', bn1:'\uD83C\uDFE2 B&N Prop #1', bn2:'\uD83C\uDFE2 B&N Prop #2' };
function openPinModal() { updatePinAccounts(); showModal('pinaccount'); }
function updatePinAccounts() {
  var tab = document.getElementById('pin-tab').value;
  var sel = document.getElementById('pin-account');
  var noAccts = document.getElementById('pin-no-accounts');
  var accounts = (_finAccounts && _finAccounts[tab]) ? _finAccounts[tab] : [];
  if (accounts.length === 0) {
    sel.innerHTML = ''; sel.style.display = 'none'; noAccts.style.display = 'block';
  } else {
    sel.style.display = 'block'; noAccts.style.display = 'none';
    sel.innerHTML = accounts.map(function(a){ return '<option value="'+a.id+'">'+a.icon+' '+esc(a.name)+'</option>'; }).join('');
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
  if (_pinnedAccounts.find(function(p){ return p.tab===tab && p.accountId===acct.id; })) { closeModal('pinaccount'); return; }
  _pinnedAccounts.push({ tab:tab, accountId:acct.id, label:acct.name, icon:acct.icon, typeName:typeNames[acct.type]||acct.type, entityLabel:_TAB_LABELS[tab]||tab });
  savePinnedAccounts(); closeModal('pinaccount'); renderDashboardQuickLinks();
}
`;

  patch('ql-js', '// Financials state\nvar _finAccounts = {};', QUICKLINKS_JS + '// Financials state\nvar _finAccounts = {};');

  // 9. Hook showPage + init
  patch('showpage-hook',
    "  if (id === 'fin-budgets') { renderFinPage(); }",
    "  if (id === 'fin-budgets') { renderFinPage(); }\n  if (id === 'dashboard') { loadPinnedAccounts(); renderDashboardQuickLinks(); }"
  );

  const loadIdx = html.indexOf('  loadData();');
  if (loadIdx !== -1) {
    const after = '  loadData();';
    html = html.slice(0, loadIdx + after.length) + '\n  loadPinnedAccounts();\n  setTimeout(renderDashboardQuickLinks, 50);' + html.slice(loadIdx + after.length);
    console.log('✅ init hook');
  } else console.log('❌ loadData not found');

  // 10. Modals
  const MODALS = `
<!-- ADD FIN ACCOUNT MODAL -->
<div id="modal-addfin" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999;align-items:center;justify-content:center">
  <div class="modal-box" style="min-width:320px;max-width:440px;width:90%">
    <div class="modal-header"><span style="font-size:17px;font-weight:800">Add Account</span></div>
    <div class="modal-body">
      <div class="form-group form-full"><label class="form-label">Account Name</label><input id="fin-acct-name" class="form-input" type="text" placeholder="e.g. Chase Checking" autocomplete="off"></div>
      <div class="form-group form-full"><label class="form-label">Account Type</label>
        <select id="fin-acct-type" class="form-input">
          <option value="budget">\uD83D\uDCB0 Budget</option>
          <option value="checkbook">\uD83D\uDCD2 Checkbook Ledger</option>
          <option value="credit">\uD83D\uDCB3 Credit Card Ledger</option>
        </select>
      </div>
    </div>
    <div class="modal-footer"><button class="btn btn-outline" onclick="closeModal('addfin')">Cancel</button><button class="btn btn-primary" onclick="saveFinAccount()">Add Account \u2713</button></div>
  </div>
</div>
<!-- PIN ACCOUNT MODAL -->
<div id="modal-pinaccount" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999;align-items:center;justify-content:center">
  <div class="modal-box" style="min-width:320px;max-width:480px;width:92%">
    <div class="modal-header"><span style="font-size:17px;font-weight:800">\uD83D\uDCCC Pin Account to Dashboard</span></div>
    <div class="modal-body">
      <div class="form-group form-full"><label class="form-label">Entity</label>
        <select id="pin-tab" class="form-input" onchange="updatePinAccounts()">
          <option value="personal">\uD83D\uDC64 Personal</option>
          <option value="ietc">\uD83E\uDAC5 Iron Eagle Truck Center</option>
          <option value="bn1">\uD83C\uDFE2 B&amp;N Properties #1</option>
          <option value="bn2">\uD83C\uDFE2 B&amp;N Properties #2</option>
        </select>
      </div>
      <div class="form-group form-full"><label class="form-label">Account</label><select id="pin-account" class="form-input"></select></div>
      <div id="pin-no-accounts" style="display:none;color:var(--text2);font-size:13px;margin-top:8px">No accounts yet. Go to Financials first to create one.</div>
    </div>
    <div class="modal-footer"><button class="btn btn-outline" onclick="closeModal('pinaccount')">Cancel</button><button class="btn btn-primary" onclick="savePinAccount()">Pin to Dashboard \u2713</button></div>
  </div>
</div>
`;
  const bodyEnd = html.lastIndexOf('</body>');
  if (bodyEnd !== -1) { html = html.slice(0, bodyEnd) + MODALS + html.slice(bodyEnd); console.log('✅ modals inserted'); }
  else console.log('❌ </body> not found');

  // ── VERIFY ────────────────────────────────────────────────────────────────
  const checks = {
    'modal-addfin': html.includes('modal-addfin'),
    'modal-pinaccount': html.includes('modal-pinaccount'),
    'dash-quicklinks': html.includes('dash-quicklinks'),
    'fin-tab-ietc': html.includes('fin-tab-ietc'),
    'var _finAccounts': html.includes('var _finAccounts'),
    '_pinnedAccounts': html.includes('var _pinnedAccounts'),
    'item-drag-wired': html.includes('sgItemDragStart(event,'),
    'no-debug-alerts': !html.includes("alert('DEBUG"),
    'no-debug-log': !html.includes("console.log('SIDEBAR GROUPS'"),
    'has-emojis': /[\u{1F000}-\u{1FFFF}]/u.test(html),
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
