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
  // Start clean from original every time
  console.log('Fetching original clean HTML...');
  const fileResp = await get(
    `https://api.vercel.com/v7/deployments/dpl_AYcCTWpNBuigC8YxdcbWXTyp2uZK/files/8aa2b40d2879087b06f50b9de16c7b1f6632f514?teamId=${teamId}`,
    { Authorization: `Bearer ${token}` }
  );
  let html = Buffer.from(JSON.parse(fileResp.toString()).data, 'base64').toString('utf8');
  console.log('✅ Original. Size:', html.length);

  let syntaxErr = checkSyntax(html);
  if (syntaxErr) { console.log('❌ Original broken:', syntaxErr); process.exit(1); }
  console.log('✅ Original JS clean');

  function patch(label, from, to) {
    if (html.includes(from)) { html = html.split(from).join(to); console.log('✅ ' + label); return true; }
    console.log('⚠️  ' + label + ' — not found'); return false;
  }

  // === ALL PATCHES IN ORDER ===

  // 1. Fix password
  patch('password', "pass: 'Gordon24@'", "pass: 'Gordon2448@@@'");

  // 2. Remove captcha box HTML
  const cbStart = html.indexOf('<div class="captcha-box">');
  if (cbStart !== -1) {
    const cbEnd = html.indexOf('</div>', cbStart) + 6;
    html = html.slice(0, cbStart) + html.slice(cbEnd);
    console.log('✅ captcha-box removed');
  }

  // 3. Remove captcha from doLogin
  patch('doLogin captcha check',
    "  var ans  = parseInt(document.getElementById('captcha-a').value, 10);\n  var err  = document.getElementById('login-err');\n  if (user === CREDS.user.toLowerCase() && pass === CREDS.pass && !isNaN(ans) && ans === _captchaAns) {",
    "  var err  = document.getElementById('login-err');\n  if (user === CREDS.user.toLowerCase() && pass === CREDS.pass) {"
  );

  // 4. Remove _captchaAns var
  patch('_captchaAns var', 'var _captchaAns = 0;\n', '');

  // 5. Remove refreshCaptcha function
  {
    const rfStart = html.indexOf('function refreshCaptcha()');
    if (rfStart !== -1) {
      const rfEnd = html.indexOf('\n}', rfStart) + 2;
      html = html.slice(0, rfStart) + html.slice(rfEnd + 1);
      console.log('✅ refreshCaptcha fn removed');
    }
  }

  // 6. Remove bare refreshCaptcha() calls
  patch('captcha bare call', 'refreshCaptcha();\n\n// ===== REMEMBER ME =====', '// ===== REMEMBER ME =====');
  patch('captcha else call',
    "    refreshCaptcha();\n  }\n}\ndocument.addEventListener('keydown'",
    "  }\n}\ndocument.addEventListener('keydown'"
  );

  // 7. Fix error message
  patch('error message', 'Incorrect email, password, or security answer.', 'Incorrect email or password.');

  // 8. Clear stale saved creds
  patch('stale creds',
    "// ===== REMEMBER ME =====",
    "// ===== REMEMBER ME =====\ntry{var _sc=localStorage.getItem('ezy_saved_creds');if(_sc){var _scp=JSON.parse(atob(_sc));if(_scp.p!==CREDS.pass)localStorage.removeItem('ezy_saved_creds');}}catch(e){localStorage.removeItem('ezy_saved_creds');}"
  );

  // 9. No-cache meta tags
  patch('no-cache', '<meta charset="UTF-8">',
    '<meta charset="UTF-8">\n<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">\n<meta http-equiv="Pragma" content="no-cache">\n<meta http-equiv="Expires" content="0">'
  );

  // 10. Remove DEBUG alerts
  patch('debug alert 1', "alert('DEBUG: group not found for id=' + groupId); return; }", "return; }");
  patch('debug alert 2', "alert('DEBUG: going to ' + group.items[0].id); showPage(group.items[0].id); return; }", "showPage(group.items[0].id); return; }");
  patch('debug alert 3', "alert('DEBUG: showing submenu for ' + groupId + ' with ' + group.items.length + ' items');", "");

  // 11. Fix Financials tabs (they use div.biz-tab)
  const tabsStart = html.indexOf('<!-- Personal / Business tabs -->');
  if (tabsStart !== -1) {
    const containerStart = html.indexOf('<div style="display:flex;gap:0;margin-bottom:20px', tabsStart);
    let depth = 0, pos = containerStart;
    while (pos < html.length) {
      const open = html.indexOf('<div', pos);
      const close = html.indexOf('</div>', pos);
      if (close === -1) break;
      if (open !== -1 && open < close) { depth++; pos = open + 4; }
      else { depth--; pos = close + 6; if (depth === 0) break; }
    }
    const newBlock = `<!-- Financials tabs -->
        <div style="display:flex;gap:0;margin-bottom:20px;border-bottom:2px solid var(--border);overflow-x:auto">
          <div id="fin-tab-personal" class="biz-tab active" onclick="setFinTab('personal')" style="font-size:13px;font-weight:800;padding:10px 16px;white-space:nowrap">👤 Personal</div>
          <div id="fin-tab-ietc" class="biz-tab" onclick="setFinTab('ietc')" style="font-size:13px;font-weight:800;padding:10px 16px;white-space:nowrap">🦅 Iron Eagle</div>
          <div id="fin-tab-bn1" class="biz-tab" onclick="setFinTab('bn1')" style="font-size:13px;font-weight:800;padding:10px 16px;white-space:nowrap">🏠 B&amp;N #1</div>
          <div id="fin-tab-bn2" class="biz-tab" onclick="setFinTab('bn2')" style="font-size:13px;font-weight:800;padding:10px 16px;white-space:nowrap">🏠 B&amp;N #2</div>
        </div>`;
    html = html.slice(0, tabsStart) + newBlock + html.slice(pos);
    console.log('✅ Fin tabs → 4 tabs');
  } else console.log('⚠️  Fin tabs not found');

  // 12. Fix setFinTab for 4 tabs
  {
    const sfStart = html.indexOf('function setFinTab(tab)');
    if (sfStart !== -1) {
      const sfEnd = html.indexOf('\n}', sfStart) + 2;
      html = html.slice(0, sfStart) + `function setFinTab(tab) {
  _currentFinTab = tab;
  _currentFinAccountId = null;
  ['personal','ietc','bn1','bn2'].forEach(function(t) {
    var el = document.getElementById('fin-tab-' + t);
    if (el) el.classList.toggle('active', t === tab);
  });
  renderFinPage();
}` + html.slice(sfEnd);
      console.log('✅ setFinTab → 4 tabs');
    }
  }

  // 13. Ensure fin state vars declared
  if (!html.includes('var _finAccounts')) {
    const fi = html.indexOf('// ===== FINANCIALS =====');
    if (fi !== -1) {
      html = html.slice(0, fi) + "var _finAccounts = {}; var _currentFinTab = 'personal'; var _currentFinAccountId = null; var _currentBudgetMonth = null; var _budgetItemEdit = null;\n\n" + html.slice(fi);
      console.log('✅ fin state vars added');
    }
  } else console.log('✅ fin state vars present');

  // 14. Add modal-addfin if missing
  if (!html.includes('id="modal-addfin"')) {
    const MODAL = `\n<div class="modal-overlay" id="modal-addfin" style="display:none">
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
    html = html.replace('</body>', MODAL + '\n</body>');
    console.log('✅ modal-addfin added');
  } else console.log('✅ modal-addfin present');

  // 15. showPage closes sidebar
  if (!html.includes('// Close sidebar if open')) {
    patch('showPage closes sidebar',
      'function showPage(id) {',
      `function showPage(id) {\n  var sb = document.getElementById('sidebar'); if (sb && sb.classList.contains('open')) { sb.classList.remove('open'); var ov = document.getElementById('sidebar-overlay'); if(ov) ov.style.display='none'; }`
    );
  } else console.log('✅ showPage sidebar close present');

  // 16. Service worker killer
  if (!html.includes('serviceWorker')) {
    const SW = `<script>\nif ('serviceWorker' in navigator) {\n  navigator.serviceWorker.getRegistrations().then(function(r){r.forEach(function(sw){sw.unregister();});});\n  caches.keys().then(function(n){n.forEach(function(k){caches.delete(k);});});\n}\n</script>\n`;
    html = html.replace('<div id="login-screen"', SW + '<div id="login-screen"');
    console.log('✅ SW killer added');
  } else console.log('✅ SW killer present');

  // FINAL SYNTAX CHECK
  syntaxErr = checkSyntax(html);
  if (syntaxErr) { console.log('\n❌ SYNTAX ERROR:\n', syntaxErr); process.exit(1); }
  console.log('✅ Final JS syntax clean');

  fs.writeFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', html, 'utf8');
  console.log('Saved. Size:', html.length);

  // Deploy
  console.log('\nDeploying...');
  const dep = await post(
    `https://api.vercel.com/v13/deployments?teamId=${teamId}`,
    { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    { name: 'ezy-life', target: 'production', files: [{ file: 'index.html', data: html, encoding: 'utf-8' }] }
  );
  console.log('Deploy ID:', dep.id);

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
