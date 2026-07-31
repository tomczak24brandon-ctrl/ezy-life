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
  var scripts = [], sp = 0;
  while (true) { var si = html.indexOf('<script>', sp); if (si === -1) break; var se = html.indexOf('</script>', si); scripts.push({s:si+8,e:se,size:se-si}); sp = si+1; }
  var ms = scripts.sort(function(a,b){return b.size-a.size;})[0];
  var js = html.substring(ms.s, ms.e);
  try { new vm.Script('"use strict";\n' + js); return null; }
  catch(e) {
    var lines = js.split('\n'), lo=0, hi=lines.length;
    while(hi-lo>1){var mid=Math.floor((lo+hi)/2);try{new vm.Script('"use strict";\n'+lines.slice(0,mid).join('\n'));lo=mid;}catch(ex){hi=mid;}}
    var ctx='';
    for(var x=Math.max(0,hi-5);x<Math.min(lines.length,hi+3);x++) ctx+='  ['+x+']: '+lines[x]+'\n';
    return e.message+'\n'+ctx;
  }
}

async function main() {
  console.log('Fetching original clean HTML...');
  const fileResp = await get(
    'https://api.vercel.com/v7/deployments/dpl_AYcCTWpNBuigC8YxdcbWXTyp2uZK/files/8aa2b40d2879087b06f50b9de16c7b1f6632f514?teamId=' + teamId,
    { Authorization: 'Bearer ' + token }
  );
  let html = Buffer.from(JSON.parse(fileResp.toString()).data, 'base64').toString('utf8');
  console.log('Size:', html.length);

  function patch(from, to, label) {
    if (html.includes(from)) { html = html.split(from).join(to); console.log('OK ' + label); return true; }
    console.log('MISS ' + label); return false;
  }

  // 1. Password
  patch("pass: 'Gordon24@'", "pass: 'Gordon2448@@@'", 'password');

  // 2. Remove captcha box HTML
  var cbS = html.indexOf('<div class="captcha-box">');
  if (cbS !== -1) { var cbE = html.indexOf('</div>', cbS)+6; html = html.slice(0,cbS)+html.slice(cbE); console.log('OK captcha box'); }

  // 3. Fix doLogin - no captcha, case-insensitive email
  patch(
    "  var ans  = parseInt(document.getElementById('captcha-a').value, 10);\n  var err  = document.getElementById('login-err');\n  if (user === CREDS.user.toLowerCase() && pass === CREDS.pass && !isNaN(ans) && ans === _captchaAns) {",
    "  var err  = document.getElementById('login-err');\n  if (user.toLowerCase() === CREDS.user.toLowerCase() && pass === CREDS.pass) {",
    'doLogin fix'
  );

  // 4. Remove captcha var
  patch('var _captchaAns = 0;\n', '', 'captchaAns var');

  // 5. Remove refreshCaptcha function
  var rfS = html.indexOf('function refreshCaptcha()');
  if (rfS !== -1) { var rfE = html.indexOf('\n}', rfS)+2; html = html.slice(0,rfS)+html.slice(rfE+1); console.log('OK refreshCaptcha fn'); }

  // 6. Remove refreshCaptcha() call and fix loadSaved IIFE in one patch
  patch(
    "refreshCaptcha();\n\n// ===== REMEMBER ME =====\n(function loadSaved(){\n  var saved = localStorage.getItem('ezy_saved_creds');\n  if (saved) {\n    try {\n      var c = JSON.parse(atob(saved));\n      var u = document.getElementById('l-user'), p = document.getElementById('l-pass');\n      if (u && c.u) u.value = c.u;\n      if (p && c.p) p.value = c.p;\n      document.getElementById('remember-me').checked = true;\n    } catch(e){}\n  }\n})()",
    "// ===== REMEMBER ME =====\nfunction loadSaved(){\n  var saved = localStorage.getItem('ezy_saved_creds');\n  if (saved) {\n    try {\n      var c = JSON.parse(atob(saved));\n      var u = document.getElementById('l-user'), pw = document.getElementById('l-pass');\n      if (u && c.u) u.value = c.u.toLowerCase();\n      if (pw && c.p) pw.value = c.p;\n      document.getElementById('remember-me').checked = true;\n    } catch(e){}\n  }\n}\nloadSaved()",
    'captcha call + loadSaved fix'
  );

  // 7. Remove captcha else branch
  patch(
    "    refreshCaptcha();\n  }\n}\ndocument.addEventListener('keydown'",
    "  }\n}\ndocument.addEventListener('keydown'",
    'captcha else'
  );

  // 8. Error message
  patch('Incorrect email, password, or security answer.', 'Incorrect email or password.', 'error msg');

  // 9. No-cache meta
  patch('<meta charset="UTF-8">',
    '<meta charset="UTF-8"><meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate"><meta http-equiv="Pragma" content="no-cache">',
    'no-cache'
  );

  // 10. Debug alerts
  patch("alert('DEBUG: group not found for id=' + groupId); return; }", "return; }", 'debug1');
  patch("alert('DEBUG: going to ' + group.items[0].id); showPage(group.items[0].id); return; }", "showPage(group.items[0].id); return; }", 'debug2');
  patch("alert('DEBUG: showing submenu for ' + groupId + ' with ' + group.items.length + ' items');", "", 'debug3');

  // 11. Financials 4 tabs
  var tS = html.indexOf('<!-- Personal / Business tabs -->');
  if (tS !== -1) {
    var cS = html.indexOf('<div style="display:flex;gap:0;margin-bottom:20px', tS), depth = 0, pos = cS;
    while (pos < html.length) {
      var open = html.indexOf('<div', pos), close = html.indexOf('</div>', pos);
      if (close === -1) break;
      if (open !== -1 && open < close) { depth++; pos = open+4; }
      else { depth--; pos = close+6; if (depth === 0) break; }
    }
    // Write tab HTML to a temp var to avoid escaping issues
    var tab1 = '<div id="fin-tab-personal" class="biz-tab active" onclick="setFinTab(\'personal\')" style="font-size:13px;font-weight:800;padding:10px 16px">Personal</div>';
    var tab2 = '<div id="fin-tab-ietc" class="biz-tab" onclick="setFinTab(\'ietc\')" style="font-size:13px;font-weight:800;padding:10px 16px">Iron Eagle</div>';
    var tab3 = '<div id="fin-tab-bn1" class="biz-tab" onclick="setFinTab(\'bn1\')" style="font-size:13px;font-weight:800;padding:10px 16px">B&N #1</div>';
    var tab4 = '<div id="fin-tab-bn2" class="biz-tab" onclick="setFinTab(\'bn2\')" style="font-size:13px;font-weight:800;padding:10px 16px">B&N #2</div>';
    var nt = '<!-- Financials tabs -->\n        <div style="display:flex;gap:0;margin-bottom:20px;border-bottom:2px solid var(--border);overflow-x:auto">\n          ' + tab1 + '\n          ' + tab2 + '\n          ' + tab3 + '\n          ' + tab4 + '\n        </div>';
    html = html.slice(0,tS) + nt + html.slice(pos);
    console.log('OK fin 4 tabs');
  } else console.log('MISS fin tabs');

  // 12. setFinTab function for 4 tabs
  var sfS = html.indexOf('function setFinTab(tab)');
  if (sfS !== -1) {
    var sfE = html.indexOf('\n}', sfS)+2;
    var newFn = "function setFinTab(tab) {\n  _currentFinTab = tab;\n  _currentFinAccountId = null;\n  ['personal','ietc','bn1','bn2'].forEach(function(t) {\n    var el = document.getElementById('fin-tab-' + t);\n    if (el) el.classList.toggle('active', t === tab);\n  });\n  renderFinPage();\n}";
    html = html.slice(0,sfS) + newFn + html.slice(sfE);
    console.log('OK setFinTab 4 tabs');
  } else console.log('MISS setFinTab');

  // 13. modal-addfin - use a file to avoid escaping issues
  if (!html.includes('id="modal-addfin"')) {
    // Write modal HTML using array join to avoid escape issues
    var modalParts = [
      '<div class="modal-overlay" id="modal-addfin" style="display:none">',
      '<div class="modal">',
      '<button class="close-btn" onclick="closeModal(' + "'addfin'" + ')">X</button>',
      '<h2 class="modal-title">Add Account</h2>',
      '<div class="form-group"><label>Account Name</label>',
      '<input class="form-input" id="fin-acct-name" placeholder="e.g. Chase Checking"></div>',
      '<div class="form-group"><label>Account Type</label>',
      '<select class="form-input" id="fin-acct-type">',
      '<option value="checking">Checking</option>',
      '<option value="savings">Savings</option>',
      '<option value="credit">Credit Card</option>',
      '<option value="loan">Loan</option>',
      '<option value="investment">Investment</option>',
      '<option value="other">Other</option>',
      '</select></div>',
      '<button class="btn-primary" onclick="saveFinAccount()">Save Account</button>',
      '</div></div>'
    ];
    var modalHtml = '\n' + modalParts.join('') + '\n';
    var lastBody = html.lastIndexOf('</body>');
    html = html.slice(0, lastBody) + modalHtml + '</body>' + html.slice(lastBody + 7);
    console.log('OK modal-addfin');
  } else console.log('OK modal-addfin present');

  // 14. showPage closes sidebar
  patch(
    'function showPage(id) {',
    "function showPage(id) {\n  var sb=document.getElementById('sidebar');if(sb&&sb.classList.contains('open')){sb.classList.remove('open');var ov=document.getElementById('sidebar-overlay');if(ov)ov.style.display='none';}",
    'showPage sidebar'
  );

  // FINAL SYNTAX CHECK
  var syntaxErr = checkSyntax(html);
  if (syntaxErr) { console.log('\nSYNTAX ERROR:\n' + syntaxErr); process.exit(1); }
  console.log('OK syntax clean');

  fs.writeFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', html, 'utf8');
  console.log('Saved:', html.length);

  console.log('\nDeploying...');
  var dep = await post('https://api.vercel.com/v13/deployments?teamId='+teamId,
    { Authorization: 'Bearer '+token, 'Content-Type': 'application/json' },
    { name: 'ezy-life', target: 'production', files: [
      { file: 'index.html', data: html, encoding: 'utf-8' },
      { file: 'vercel.json', data: '{"headers":[{"source":"/(.*)","headers":[{"key":"Cache-Control","value":"no-store, no-cache, must-revalidate, max-age=0"}]}]}', encoding: 'utf-8' }
    ]}
  );
  console.log('ID:', dep.id);
  if (dep.error) { console.error(JSON.stringify(dep.error)); process.exit(1); }

  for (var i=0; i<20; i++) {
    await new Promise(function(r){setTimeout(r,3000);});
    var st = JSON.parse((await get('https://api.vercel.com/v13/deployments/'+dep.id+'?teamId='+teamId,{Authorization:'Bearer '+token})).toString());
    console.log('['+i+'] '+st.readyState);
    if (st.readyState==='READY') break;
    if (st.readyState==='ERROR') { console.error('FAILED'); process.exit(1); }
  }

  for (var alias of ['ezy-life.vercel.app','ezy-life-iron-eagle-truck-center.vercel.app']) {
    var ar = await post('https://api.vercel.com/v2/deployments/'+dep.id+'/aliases?teamId='+teamId,
      {Authorization:'Bearer '+token,'Content-Type':'application/json'},{alias:alias});
    console.log('Alias:', alias, ar.uid ? 'OK' : JSON.stringify(ar).substring(0,80));
  }

  console.log('\nDone! https://ezy-life.vercel.app');
}

main().catch(console.error);
