const https = require('https');
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

async function main() {
  const fileResp = await get(
    'https://api.vercel.com/v7/deployments/dpl_AYcCTWpNBuigC8YxdcbWXTyp2uZK/files/8aa2b40d2879087b06f50b9de16c7b1f6632f514?teamId=' + teamId,
    { Authorization: 'Bearer ' + token }
  );
  let html = Buffer.from(JSON.parse(fileResp.toString()).data, 'base64').toString('utf8');

  function patch(from, to) {
    if (html.includes(from)) { html = html.split(from).join(to); return true; }
    return false;
  }

  patch("pass: 'Gordon24@'", "pass: 'Gordon2448@@@'");

  var cbStart = html.indexOf('<div class="captcha-box">');
  if (cbStart !== -1) { var cbEnd = html.indexOf('</div>', cbStart) + 6; html = html.slice(0, cbStart) + html.slice(cbEnd); }

  patch(
    "  var ans  = parseInt(document.getElementById('captcha-a').value, 10);\n  var err  = document.getElementById('login-err');\n  if (user === CREDS.user.toLowerCase() && pass === CREDS.pass && !isNaN(ans) && ans === _captchaAns) {",
    "  var err  = document.getElementById('login-err');\n  if (user.toLowerCase() === CREDS.user.toLowerCase() && pass === CREDS.pass) {"
  );

  patch('var _captchaAns = 0;\n', '');

  var rfStart = html.indexOf('function refreshCaptcha()');
  if (rfStart !== -1) { var rfEnd = html.indexOf('\n}', rfStart) + 2; html = html.slice(0, rfStart) + html.slice(rfEnd + 1); }

  patch('refreshCaptcha();\n\n// ===== REMEMBER ME =====', '// ===== REMEMBER ME =====');
  patch("    refreshCaptcha();\n  }\n}\ndocument.addEventListener('keydown'", "  }\n}\ndocument.addEventListener('keydown'");
  patch('Incorrect email, password, or security answer.', 'Incorrect email or password.');
  patch('<meta charset="UTF-8">', '<meta charset="UTF-8"><meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">');
  patch("alert('DEBUG: group not found for id=' + groupId); return; }", "return; }");
  patch("alert('DEBUG: going to ' + group.items[0].id); showPage(group.items[0].id); return; }", "showPage(group.items[0].id); return; }");
  patch("alert('DEBUG: showing submenu for ' + groupId + ' with ' + group.items.length + ' items');", "");

  // Verify syntax is clean before 4-tab patches
  var scripts = [], sp = 0;
  while (true) {
    var si = html.indexOf('<script>', sp); if (si === -1) break;
    var se = html.indexOf('</script>', si);
    scripts.push({ s: si+8, e: se, size: se-si });
    sp = si + 1;
  }
  var mainS = scripts.sort(function(a,b){return b.size-a.size;})[0];
  var js = html.substring(mainS.s, mainS.e);
  try { new vm.Script('"use strict";\n' + js); console.log('After base patches: CLEAN'); }
  catch(e) { console.log('After base patches: ERROR:', e.message); }

  // Now do fin tabs
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
    // Simple replacement - no template literals
    var newTabs = '<!-- Financials tabs -->\n        <div style="display:flex;gap:0;margin-bottom:20px;border-bottom:2px solid var(--border)">\n          <div id="fin-tab-personal" class="biz-tab active" onclick="setFinTab(\'personal\')" style="font-size:13px;font-weight:800;padding:10px 16px">Personal</div>\n          <div id="fin-tab-ietc" class="biz-tab" onclick="setFinTab(\'ietc\')" style="font-size:13px;font-weight:800;padding:10px 16px">Iron Eagle</div>\n          <div id="fin-tab-bn1" class="biz-tab" onclick="setFinTab(\'bn1\')" style="font-size:13px;font-weight:800;padding:10px 16px">B&amp;N #1</div>\n          <div id="fin-tab-bn2" class="biz-tab" onclick="setFinTab(\'bn2\')" style="font-size:13px;font-weight:800;padding:10px 16px">B&amp;N #2</div>\n        </div>';
    html = html.slice(0, tabsStart) + newTabs + html.slice(pos);
    console.log('fin tabs replaced');
  }

  // setFinTab
  var sfStart = html.indexOf('function setFinTab(tab)');
  if (sfStart !== -1) {
    var sfEnd = html.indexOf('\n}', sfStart) + 2;
    var newFn = "function setFinTab(tab) {\n  _currentFinTab = tab;\n  _currentFinAccountId = null;\n  ['personal','ietc','bn1','bn2'].forEach(function(t) {\n    var el = document.getElementById('fin-tab-' + t);\n    if (el) el.classList.toggle('active', t === tab);\n  });\n  renderFinPage();\n}";
    html = html.slice(0, sfStart) + newFn + html.slice(sfEnd);
    console.log('setFinTab replaced');
  }

  // Check syntax again
  scripts = []; sp = 0;
  while (true) {
    var si2 = html.indexOf('<script>', sp); if (si2 === -1) break;
    var se2 = html.indexOf('</script>', si2);
    scripts.push({ s: si2+8, e: se2, size: se2-si2 });
    sp = si2 + 1;
  }
  var mainS2 = scripts.sort(function(a,b){return b.size-a.size;})[0];
  var js2 = html.substring(mainS2.s, mainS2.e);
  try { new vm.Script('"use strict";\n' + js2); console.log('After fin patches: CLEAN'); }
  catch(e2) {
    console.log('After fin patches: ERROR:', e2.message);
    // Find location
    var lines = js2.split('\n');
    var lo = 0, hi = lines.length;
    while (hi - lo > 1) {
      var mid = Math.floor((lo+hi)/2);
      try { new vm.Script('"use strict";\n' + lines.slice(0,mid).join('\n')); lo = mid; }
      catch(ex) { hi = mid; }
    }
    for (var x = Math.max(0,hi-5); x < Math.min(lines.length,hi+3); x++) console.log('  ['+x+']: '+lines[x]);
  }
}

main().catch(console.error);
