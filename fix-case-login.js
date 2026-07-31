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

async function main() {
  console.log('Fetching original clean HTML...');
  const fileResp = await get(
    'https://api.vercel.com/v7/deployments/dpl_AYcCTWpNBuigC8YxdcbWXTyp2uZK/files/8aa2b40d2879087b06f50b9de16c7b1f6632f514?teamId=' + teamId,
    { Authorization: 'Bearer ' + token }
  );
  let html = Buffer.from(JSON.parse(fileResp.toString()).data, 'base64').toString('utf8');
  console.log('Original size:', html.length);

  function patch(label, from, to) {
    if (html.includes(from)) { html = html.split(from).join(to); console.log('OK ' + label); return true; }
    console.log('MISS ' + label); return false;
  }

  // 1. Password
  patch('password', "pass: 'Gordon24@'", "pass: 'Gordon2448@@@'");

  // 2. Remove captcha box
  var cbStart = html.indexOf('<div class="captcha-box">');
  if (cbStart !== -1) {
    var cbEnd = html.indexOf('</div>', cbStart) + 6;
    html = html.slice(0, cbStart) + html.slice(cbEnd);
    console.log('OK captcha-box removed');
  }

  // 3. Fix doLogin - remove captcha, make email case-insensitive
  patch('doLogin fix',
    "  var ans  = parseInt(document.getElementById('captcha-a').value, 10);\n  var err  = document.getElementById('login-err');\n  if (user === CREDS.user.toLowerCase() && pass === CREDS.pass && !isNaN(ans) && ans === _captchaAns) {",
    "  var err  = document.getElementById('login-err');\n  if (user.toLowerCase() === CREDS.user.toLowerCase() && pass === CREDS.pass) {"
  );

  // 4. Remove _captchaAns
  patch('captchaAns var', 'var _captchaAns = 0;\n', '');

  // 5. Remove refreshCaptcha function
  var rfStart = html.indexOf('function refreshCaptcha()');
  if (rfStart !== -1) {
    var rfEnd = html.indexOf('\n}', rfStart) + 2;
    html = html.slice(0, rfStart) + html.slice(rfEnd + 1);
    console.log('OK refreshCaptcha removed');
  }

  // 6. Remove calls to refreshCaptcha
  patch('captcha bare call', 'refreshCaptcha();\n\n// ===== REMEMBER ME =====', '// ===== REMEMBER ME =====');
  patch('captcha else call',
    "    refreshCaptcha();\n  }\n}\ndocument.addEventListener('keydown'",
    "  }\n}\ndocument.addEventListener('keydown'"
  );

  // 7. Error message
  patch('error msg', 'Incorrect email, password, or security answer.', 'Incorrect email or password.');

  // 8. No-cache meta
  patch('no-cache', '<meta charset="UTF-8">',
    '<meta charset="UTF-8"><meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate"><meta http-equiv="Pragma" content="no-cache"><meta http-equiv="Expires" content="0">'
  );

  // 9. Remove debug alerts
  patch('debug1', "alert('DEBUG: group not found for id=' + groupId); return; }", "return; }");
  patch('debug2', "alert('DEBUG: going to ' + group.items[0].id); showPage(group.items[0].id); return; }", "showPage(group.items[0].id); return; }");
  patch('debug3', "alert('DEBUG: showing submenu for ' + groupId + ' with ' + group.items.length + ' items');", "");

  // 10. Financials 4 tabs
  var tabsStart = html.indexOf('<!-- Personal / Business tabs -->');
  if (tabsStart !== -1) {
    var contStart = html.indexOf('<div style="display:flex;gap:0;margin-bottom:20px', tabsStart);
    var depth = 0, pos = contStart;
    while (pos < html.length) {
      var open = html.indexOf('<div', pos);
      var close = html.indexOf('</div>', pos);
      if (close === -1) break;
      if (open !== -1 && open < close) { depth++; pos = open + 4; }
      else { depth--; pos = close + 6; if (depth === 0) break; }
    }
    var newTabs = '<!-- Financials tabs -->\n        <div style="display:flex;gap:0;margin-bottom:20px;border-bottom:2px solid var(--border);overflow-x:auto">\n          <div id="fin-tab-personal" class="biz-tab active" onclick="setFinTab(\'personal\')" style="font-size:13px;font-weight:800;padding:10px 16px;white-space:nowrap">\u{1F464} Personal</div>\n          <div id="fin-tab-ietc" class="biz-tab" onclick="setFinTab(\'ietc\')" style="font-size:13px;font-weight:800;padding:10px 16px;white-space:nowrap">\u{1F985} Iron Eagle</div>\n          <div id="fin-tab-bn1" class="biz-tab" onclick="setFinTab(\'bn1\')" style="font-size:13px;font-weight:800;padding:10px 16px;white-space:nowrap">\u{1F3E0} B&amp;N #1</div>\n          <div id="fin-tab-bn2" class="biz-tab" onclick="setFinTab(\'bn2\')" style="font-size:13px;font-weight:800;padding:10px 16px;white-space:nowrap">\u{1F3E0} B&amp;N #2</div>\n        </div>';
    html = html.slice(0, tabsStart) + newTabs + html.slice(pos);
    console.log('OK fin 4 tabs');
  }

  // 11. setFinTab 4 tabs
  var sfStart = html.indexOf('function setFinTab(tab)');
  if (sfStart !== -1) {
    var sfEnd = html.indexOf('\n}', sfStart) + 2;
    html = html.slice(0, sfStart) +
      "function setFinTab(tab) {\n  _currentFinTab = tab;\n  _currentFinAccountId = null;\n  ['personal','ietc','bn1','bn2'].forEach(function(t) {\n    var el = document.getElementById('fin-tab-' + t);\n    if (el) el.classList.toggle('active', t === tab);\n  });\n  renderFinPage();\n}" +
      html.slice(sfEnd);
    console.log('OK setFinTab 4 tabs');
  }

  // 12. modal-addfin
  if (!html.includes('id="modal-addfin"')) {
    var modalHtml = '\n<div class="modal-overlay" id="modal-addfin" style="display:none"><div class="modal"><button class="close-btn" onclick="closeModal(\'addfin\')">X</button><h2 class="modal-title">Add Account</h2><div class="form-group"><label>Account Name</label><input class="form-input" id="fin-acct-name" placeholder="e.g. Chase Checking"></div><div class="form-group"><label>Account Type</label><select class="form-input" id="fin-acct-type"><option value="checking">Checking</option><option value="savings">Savings</option><option value="credit">Credit Card</option><option value="loan">Loan</option><option value="investment">Investment</option><option value="other">Other</option></select></div><button class="btn-primary" onclick="saveFinAccount()">Save Account</button></div></div>\n';
    html = html.replace('</body>', modalHtml + '</body>');
    console.log('OK modal-addfin added');
  }

  // 13. showPage closes sidebar
  patch('showPage sidebar',
    'function showPage(id) {',
    "function showPage(id) {\n  var sb=document.getElementById('sidebar');if(sb&&sb.classList.contains('open')){sb.classList.remove('open');var ov=document.getElementById('sidebar-overlay');if(ov)ov.style.display='none';}"
  );

  // Syntax check on largest script
  var scripts = [], sp = 0;
  while (true) {
    var si = html.indexOf('<script>', sp); if (si === -1) break;
    var se = html.indexOf('</script>', si);
    scripts.push({ s: si+8, e: se, size: se-si });
    sp = si + 1;
  }
  var mainS = scripts.sort(function(a,b){return b.size-a.size;})[0];
  var js = html.substring(mainS.s, mainS.e);
  try {
    new vm.Script('"use strict";\n' + js);
    console.log('OK JS syntax clean');
  } catch(err) {
    console.log('SYNTAX ERROR:', err.message);
    process.exit(1);
  }

  fs.writeFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', html, 'utf8');
  console.log('Saved. Size:', html.length);

  console.log('\nDeploying...');
  var dep = await post(
    'https://api.vercel.com/v13/deployments?teamId=' + teamId,
    { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    { name: 'ezy-life', target: 'production', files: [
      { file: 'index.html', data: html, encoding: 'utf-8' },
      { file: 'vercel.json', data: '{"headers":[{"source":"/(.*)","headers":[{"key":"Cache-Control","value":"no-store, no-cache, must-revalidate, max-age=0"}]}]}', encoding: 'utf-8' }
    ]}
  );
  console.log('Deploy ID:', dep.id);
  if (dep.error) { console.error('Error:', JSON.stringify(dep.error)); process.exit(1); }

  for (var i = 0; i < 20; i++) {
    await new Promise(function(r){setTimeout(r,3000);});
    var st = JSON.parse((await get('https://api.vercel.com/v13/deployments/'+dep.id+'?teamId='+teamId, { Authorization: 'Bearer '+token })).toString());
    console.log('['+i+'] '+st.readyState);
    if (st.readyState === 'READY') break;
    if (st.readyState === 'ERROR') { console.error('Deploy error'); process.exit(1); }
  }

  var aliases = ['ezy-life.vercel.app','ezy-life-iron-eagle-truck-center.vercel.app'];
  for (var a of aliases) {
    var ar = await post('https://api.vercel.com/v2/deployments/'+dep.id+'/aliases?teamId='+teamId,
      { Authorization: 'Bearer '+token, 'Content-Type': 'application/json' }, { alias: a });
    console.log('Alias:', a, ar.uid ? 'OK' : JSON.stringify(ar).substring(0,80));
  }

  console.log('\nDone! https://ezy-life.vercel.app');
}

main().catch(console.error);
