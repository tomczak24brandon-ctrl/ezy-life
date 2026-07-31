const https = require('https');
const fs = require('fs');

const token = 'vcp_0kEtvmApVQ4IWxG6Ko3BIAQTMF8GR6SgOhvGkerAZAQ30CRmlt3NYTs6';
const teamId = 'team_IGUGbCcmmIqBqrQz0zpvu1Zz';

// ── Step 1: Get original from Vercel ─────────────────────────────────────────
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
    const urlObj = new URL(url);
    const req = https.request({
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: { ...headers, 'Content-Length': data.length }
    }, (res) => {
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
  // Fetch original from Vercel (the clean pre-my-changes version)
  const ORIG_DPL = 'dpl_AYcCTWpNBuigC8YxdcbWXTyp2uZK';
  const ORIG_UID = '8aa2b40d2879087b06f50b9de16c7b1f6632f514';
  
  const raw = await get(
    `https://api.vercel.com/v7/deployments/${ORIG_DPL}/files/${ORIG_UID}?teamId=${teamId}`,
    { Authorization: `Bearer ${token}` }
  );
  const parsed = JSON.parse(raw.toString());
  let html = Buffer.from(parsed.data, 'base64').toString('utf8');
  console.log('✅ Fetched original. Size:', html.length);

  // ── Step 2: Apply all patches ──────────────────────────────────────────────

  // Fix 1: Remove debug alerts
  const alertFixes = [
    ["if (!group) { alert('DEBUG: group not found for id=' + groupId); return; }", "if (!group) { return; }"],
    ["if (group.items.length === 1) { alert('DEBUG: going to ' + group.items[0].id); showPage(group.items[0].id); return; }", "if (group.items.length === 1) { showPage(group.items[0].id); return; }"],
    ["alert('DEBUG: showing submenu for ' + groupId + ' with ' + group.items.length + ' items');", ""],
  ];
  for (const [from, to] of alertFixes) {
    if (html.includes(from)) { html = html.split(from).join(to); console.log('✅ Alert removed'); }
    else console.log('❌ Alert not found:', from.substring(0, 50));
  }

  // Fix 2: Replace tab HTML (Personal + Business → 4 tabs)
  const OLD_TABS = "          <div id=\"fin-tab-personal\" class=\"biz-tab active\" onclick=\"setFinTab('personal')\" style=\"font-size:15px;font-weight:800;padding:10px 24px\">👤 Personal</div>\n          <div id=\"fin-tab-business\" class=\"biz-tab\" onclick=\"setFinTab('business')\" style=\"font-size:15px;font-weight:800;padding:10px 24px\">🏢 Business</div>";
  const NEW_TABS = "          <div id=\"fin-tab-personal\" class=\"biz-tab active\" onclick=\"setFinTab('personal')\" style=\"font-size:14px;font-weight:800;padding:10px 16px\">👤 Personal</div>\n          <div id=\"fin-tab-ietc\" class=\"biz-tab\" onclick=\"setFinTab('ietc')\" style=\"font-size:14px;font-weight:800;padding:10px 16px\">🦅 Iron Eagle Truck Center</div>\n          <div id=\"fin-tab-bn1\" class=\"biz-tab\" onclick=\"setFinTab('bn1')\" style=\"font-size:14px;font-weight:800;padding:10px 16px\">🏢 B&amp;N Properties #1</div>\n          <div id=\"fin-tab-bn2\" class=\"biz-tab\" onclick=\"setFinTab('bn2')\" style=\"font-size:14px;font-weight:800;padding:10px 16px\">🏢 B&amp;N Properties #2</div>";
  
  if (html.includes(OLD_TABS)) {
    html = html.split(OLD_TABS).join(NEW_TABS);
    console.log('✅ Tab HTML replaced');
  } else {
    // Try to find it more loosely
    const idx = html.indexOf('fin-tab-personal');
    console.log('❌ Tab HTML exact match failed. fin-tab-personal at:', idx);
    if (idx !== -1) {
      // Show surrounding context to debug
      console.log('Context:', JSON.stringify(html.substring(idx - 10, idx + 200)));
    }
  }

  // Fix 3: Update setFinTab
  const OLD_SETTAB = "function setFinTab(tab) {\n  _currentFinTab = tab;\n  _currentFinAccountId = null;\n  document.getElementById('fin-tab-personal').classList.toggle('active', tab === 'personal');\n  document.getElementById('fin-tab-business').classList.toggle('active', tab === 'business');\n  renderFinPage();\n}";
  const NEW_SETTAB = "function setFinTab(tab) {\n  _currentFinTab = tab;\n  _currentFinAccountId = null;\n  ['personal','ietc','bn1','bn2'].forEach(function(id) {\n    var el = document.getElementById('fin-tab-' + id);\n    if (el) el.classList.toggle('active', tab === id);\n  });\n  renderFinPage();\n}";
  if (html.includes(OLD_SETTAB)) {
    html = html.split(OLD_SETTAB).join(NEW_SETTAB);
    console.log('✅ setFinTab updated');
  } else {
    console.log('❌ setFinTab not matched exactly');
    const idx = html.indexOf('function setFinTab');
    if (idx !== -1) console.log('Current:', JSON.stringify(html.substring(idx, idx + 250)));
  }

  // Fix 4: Add modal-addfin before </body>
  const MODAL = "\n<!-- ADD FIN ACCOUNT MODAL -->\n<div id=\"modal-addfin\" style=\"display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999;align-items:center;justify-content:center\">\n  <div class=\"modal-box\" style=\"min-width:320px;max-width:440px;width:90%\">\n    <div class=\"modal-header\"><span style=\"font-size:17px;font-weight:800\">Add Account</span></div>\n    <div class=\"modal-body\">\n      <div class=\"form-group form-full\">\n        <label class=\"form-label\">Account Name</label>\n        <input id=\"fin-acct-name\" class=\"form-input\" type=\"text\" placeholder=\"e.g. Chase Checking\" autocomplete=\"off\">\n      </div>\n      <div class=\"form-group form-full\">\n        <label class=\"form-label\">Account Type</label>\n        <select id=\"fin-acct-type\" class=\"form-input\">\n          <option value=\"budget\">\uD83D\uDCB0 Budget</option>\n          <option value=\"checkbook\">\uD83D\uDCD2 Checkbook Ledger</option>\n          <option value=\"credit\">\uD83D\uDCB3 Credit Card Ledger</option>\n        </select>\n      </div>\n    </div>\n    <div class=\"modal-footer\">\n      <button class=\"btn btn-outline\" onclick=\"closeModal('addfin')\">Cancel</button>\n      <button class=\"btn btn-primary\" onclick=\"saveFinAccount()\">Add Account \u2713</button>\n    </div>\n  </div>\n</div>\n";

  if (html.includes('\n</body>\n</html>')) {
    html = html.replace('\n</body>\n</html>', MODAL + '\n</body>\n</html>');
    console.log('✅ modal-addfin inserted');
  } else if (html.endsWith('</body>\n</html>')) {
    html = html.slice(0, -'</body>\n</html>'.length) + MODAL + '</body>\n</html>';
    console.log('✅ modal-addfin inserted (alt)');
  } else {
    const bodyIdx = html.lastIndexOf('</body>');
    if (bodyIdx !== -1) {
      html = html.slice(0, bodyIdx) + MODAL + html.slice(bodyIdx);
      console.log('✅ modal-addfin inserted (lastIndexOf)');
    } else {
      console.log('❌ Could not insert modal');
    }
  }

  // ── Step 3: Verify ────────────────────────────────────────────────────────
  const checks = {
    'modal-addfin': html.includes('modal-addfin'),
    'fin-tab-ietc': html.includes('fin-tab-ietc'),
    'fin-tab-bn1': html.includes('fin-tab-bn1'),
    'fin-tab-bn2': html.includes('fin-tab-bn2'),
    'setFinTab-ietc': html.includes("'ietc'"),
    'fin-acct-type': html.includes('fin-acct-type'),
    'no-debug-alerts': !html.includes("alert('DEBUG"),
    'has-emojis': /[\u{1F000}-\u{1FFFF}]/u.test(html),
  };
  console.log('\nVerification:');
  Object.entries(checks).forEach(([k, v]) => console.log(`  ${v ? '✅' : '❌'} ${k}`));
  const allGood = Object.values(checks).every(Boolean);
  if (!allGood) { console.log('❌ Some checks failed — aborting deploy'); process.exit(1); }

  // Save
  fs.writeFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', html, 'utf8');
  console.log('\nFile saved. Size:', html.length);

  // ── Step 4: Deploy ────────────────────────────────────────────────────────
  console.log('\nDeploying...');
  const dep = await post(
    `https://api.vercel.com/v13/deployments?teamId=${teamId}`,
    { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    { name: 'ezy-life', target: 'production', files: [{ file: 'index.html', data: html, encoding: 'utf-8' }] }
  );
  console.log('Deploy ID:', dep.id, '| State:', dep.readyState);

  // Poll
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 3000));
    const r = await get(
      `https://api.vercel.com/v13/deployments/${dep.id}?teamId=${teamId}`,
      { Authorization: `Bearer ${token}` }
    );
    const rr = JSON.parse(r.toString());
    console.log(`[${i}] ${rr.readyState}`);
    if (rr.readyState === 'READY') break;
    if (rr.readyState === 'ERROR') { console.error('Deploy failed!'); process.exit(1); }
  }

  // Alias
  for (const alias of ['ezy-life.vercel.app', 'ezy-life-iron-eagle-truck-center.vercel.app']) {
    const r = await post(
      `https://api.vercel.com/v2/deployments/${dep.id}/aliases?teamId=${teamId}`,
      { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      { alias }
    );
    console.log('Aliased:', alias, r.uid ? '✅' : JSON.stringify(r).substring(0, 60));
  }

  console.log('\n🚀 Done! https://ezy-life.vercel.app');
}

main().catch(console.error);
