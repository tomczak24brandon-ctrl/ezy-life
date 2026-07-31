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
  // Always fetch fresh from Vercel original
  const raw = await get(
    `https://api.vercel.com/v7/deployments/dpl_AYcCTWpNBuigC8YxdcbWXTyp2uZK/files/8aa2b40d2879087b06f50b9de16c7b1f6632f514?teamId=${teamId}`,
    { Authorization: `Bearer ${token}` }
  );
  let html = Buffer.from(JSON.parse(raw.toString()).data, 'base64').toString('utf8');
  console.log('✅ Fresh original fetched. Size:', html.length);

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

  // ── FIX 3: Add missing variable declarations + fix setFinTab ─────────────
  const OLD_SETTAB = `function setFinTab(tab) {
  _currentFinTab = tab;
  _currentFinAccountId = null;
  document.getElementById('fin-tab-personal').classList.toggle('active', tab === 'personal');
  document.getElementById('fin-tab-business').classList.toggle('active', tab === 'business');
  renderFinPage();
}`;
  const NEW_SETTAB = `// Financials state variables
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
  if (html.includes(OLD_SETTAB)) { html = html.split(OLD_SETTAB).join(NEW_SETTAB); console.log('✅ setFinTab + var declarations added'); }
  else { console.log('❌ setFinTab not matched'); const i = html.indexOf('function setFinTab'); console.log('Current:', html.substring(i, i+300)); }

  // ── FIX 4: Add modal-addfin HTML ─────────────────────────────────────────
  const MODAL = `
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
  const bodyEnd = html.lastIndexOf('</body>');
  if (bodyEnd !== -1) { html = html.slice(0, bodyEnd) + MODAL + html.slice(bodyEnd); console.log('✅ modal-addfin inserted'); }
  else console.log('❌ </body> not found');

  // ── VERIFY ────────────────────────────────────────────────────────────────
  const checks = {
    'modal-addfin': html.includes('modal-addfin'),
    'fin-tab-ietc': html.includes('fin-tab-ietc'),
    'fin-tab-bn1': html.includes('fin-tab-bn1'),
    'var _finAccounts': html.includes('var _finAccounts'),
    'var _currentFinTab': html.includes("var _currentFinTab = 'personal'"),
    'no-debug-alerts': !html.includes("alert('DEBUG"),
    'has-emojis': /[\u{1F000}-\u{1FFFF}]/u.test(html),
  };
  console.log('\nVerification:');
  let allGood = true;
  Object.entries(checks).forEach(([k,v]) => { console.log(`  ${v?'✅':'❌'} ${k}`); if(!v) allGood=false; });
  if (!allGood) { console.log('\n❌ Aborting.'); process.exit(1); }

  // Save
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
