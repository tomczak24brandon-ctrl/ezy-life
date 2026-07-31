const https = require('https');
const fs = require('fs');
const vm = require('vm');

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

function checkSyntax(html) {
  const s = html.indexOf('<script>') + 8;
  const e = html.indexOf('</script>', s);
  const script = html.substring(s, e);
  try { new vm.Script('"use strict";\n' + script); return null; }
  catch(err) {
    const lines = script.split('\n');
    let lo = 0, hi = lines.length;
    while (hi - lo > 1) {
      const mid = Math.floor((lo + hi) / 2);
      try { new vm.Script('"use strict";\n' + lines.slice(0, mid).join('\n')); lo = mid; }
      catch(e2) { hi = mid; }
    }
    let ctx = '';
    for (let x = Math.max(0, hi-5); x < Math.min(lines.length, hi+3); x++) ctx += `  [${x+1}]: ${lines[x]}\n`;
    return `${err.message} at line ~${hi}\n${ctx}`;
  }
}

async function main() {
  let html = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');
  console.log('Loaded. Size:', html.length);

  function patch(label, from, to) {
    if (html.includes(from)) { html = html.split(from).join(to); console.log('✅ ' + label); }
    else { console.log('⚠️  ' + label + ' — not found (may already be fixed)'); }
  }

  // 1. Remove ALL debug alerts
  let alertCount = 0;
  html = html.replace(/alert\(['"]DEBUG:[^'"]*['"]\);?\s*/g, () => { alertCount++; return ''; });
  console.log(`✅ Removed ${alertCount} debug alert(s)`);

  // 2. Fix Financials page — ensure _finAccounts and related vars are declared
  patch('fin vars',
    "// ===== FINANCIALS =====",
    "// ===== FINANCIALS =====\nvar _finAccounts = {}; var _currentFinTab = 'personal'; var _currentFinAccountId = null; var _currentBudgetMonth = null; var _budgetItemEdit = null;"
  );

  // 3. Fix setFinTab to handle 4 tabs
  const OLD_SETTAB = `function setFinTab(tab) {
  _currentFinTab = tab;
  ['personal','business'].forEach(function(t) {`;
  const NEW_SETTAB = `function setFinTab(tab) {
  _currentFinTab = tab;
  ['personal','ietc','bn1','bn2'].forEach(function(t) {`;
  patch('setFinTab 4 tabs', OLD_SETTAB, NEW_SETTAB);

  // 4. Fix Financials tab HTML — replace 2-tab with 4-tab
  const OLD_TABS = `<div class="fin-tabs">
        <button class="fin-tab active" id="fin-tab-personal" onclick="setFinTab('personal')">👤 Personal</button>
        <button class="fin-tab" id="fin-tab-business" onclick="setFinTab('business')">🏢 Business</button>
      </div>`;
  const NEW_TABS = `<div class="fin-tabs">
        <button class="fin-tab active" id="fin-tab-personal" onclick="setFinTab('personal')">👤 Personal</button>
        <button class="fin-tab" id="fin-tab-ietc" onclick="setFinTab('ietc')">🦅 Iron Eagle Truck Center</button>
        <button class="fin-tab" id="fin-tab-bn1" onclick="setFinTab('bn1')">🏠 B&amp;N Properties #1</button>
        <button class="fin-tab" id="fin-tab-bn2" onclick="setFinTab('bn2')">🏠 B&amp;N Properties #2</button>
      </div>`;
  patch('fin 4 tabs HTML', OLD_TABS, NEW_TABS);

  // 5. Fix home button closing sidebar — ensure showPage('home') works when sidebar open
  // Find showPage and make sure it closes sidebar first
  const OLD_SHOWPAGE = `function showPage(id) {`;
  const NEW_SHOWPAGE = `function showPage(id) {
  // Close sidebar if open
  var sb = document.getElementById('sidebar');
  if (sb && sb.classList.contains('open')) { sb.classList.remove('open'); var ov = document.getElementById('sidebar-overlay'); if(ov) ov.style.display='none'; }`;
  patch('showPage closes sidebar', OLD_SHOWPAGE, NEW_SHOWPAGE);

  // 6. Ensure modal-addfin exists
  if (!html.includes('id="modal-addfin"')) {
    const MODAL_HTML = `
<div class="modal-overlay" id="modal-addfin" style="display:none">
  <div class="modal">
    <button class="close-btn" onclick="closeModal('addfin')">✕</button>
    <h2 class="modal-title">Add Account</h2>
    <div class="form-group"><label>Account Name</label><input class="form-input" id="fin-acct-name" placeholder="e.g. Chase Checking"></div>
    <div class="form-group"><label>Account Type</label>
      <select class="form-input" id="fin-acct-type">
        <option value="checking">Checking</option>
        <option value="savings">Savings</option>
        <option value="credit">Credit Card</option>
        <option value="loan">Loan</option>
        <option value="investment">Investment</option>
        <option value="other">Other</option>
      </select>
    </div>
    <button class="btn-primary" onclick="saveFinAccount()">Save Account</button>
  </div>
</div>`;
    html = html.replace('</body>', MODAL_HTML + '\n</body>');
    console.log('✅ modal-addfin added');
  } else {
    console.log('✅ modal-addfin already present');
  }

  // Verify syntax
  const syntaxErr = checkSyntax(html);
  if (syntaxErr) { console.log('\n❌ SYNTAX ERROR:\n', syntaxErr); process.exit(1); }
  console.log('✅ JS syntax clean');

  fs.writeFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', html, 'utf8');
  console.log('Saved. Size:', html.length);

  console.log('\nDeploying...');
  const dep = await post(
    `https://api.vercel.com/v13/deployments?teamId=${teamId}`,
    { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    { name: 'ezy-life', target: 'production', files: [{ file: 'index.html', data: html, encoding: 'utf-8' }] }
  );
  console.log('ID:', dep.id);

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
    console.log('Alias:', alias, r.uid ? '✅' : JSON.stringify(r).substring(0, 80));
  }

  console.log('\n🚀 Done — https://ezy-life.vercel.app');
}

main().catch(console.error);
