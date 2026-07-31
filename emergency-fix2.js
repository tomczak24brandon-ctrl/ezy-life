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
  try {
    new vm.Script('"use strict";\n' + script);
    return null;
  } catch(err) {
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
  // Fetch the original clean HTML from the very first good deployment
  console.log('Fetching original clean HTML...');
  const raw = await get(
    `https://api.vercel.com/v7/deployments/dpl_AYcCTWpNBuigC8YxdcbWXTyp2uZK/files/8aa2b40d2879087b06f50b9de16c7b1f6632f514?teamId=${teamId}`,
    { Authorization: `Bearer ${token}` }
  );
  const parsed = JSON.parse(raw.toString());
  let html = Buffer.from(parsed.data, 'base64').toString('utf8');
  console.log('✅ Original. Size:', html.length);

  const syntaxCheck = checkSyntax(html);
  if (syntaxCheck) { console.log('❌ Original has syntax error:', syntaxCheck); process.exit(1); }
  else console.log('✅ Original JS parses clean');

  function patch(label, from, to) {
    if (html.includes(from)) { html = html.split(from).join(to); console.log('✅ ' + label); }
    else { console.log('❌ ' + label + ' — not found'); }
  }

  // 1. Fix password
  patch('creds',
    "var CREDS = { user: 'tomczak24brandon@gmail.com', pass: 'Gordon24@' };",
    "var CREDS = { user: 'tomczak24brandon@gmail.com', pass: 'Gordon2448@@@' };"
  );

  // 2. Remove captcha box from HTML
  const cbStart = html.indexOf('<div class="captcha-box">');
  if (cbStart !== -1) {
    const cbEnd = html.indexOf('</div>', cbStart) + 6;
    html = html.slice(0, cbStart) + html.slice(cbEnd);
    console.log('✅ captcha-box HTML removed');
  } else console.log('❌ captcha-box HTML not found');

  // 3. Remove captcha from doLogin — rewrite the condition
  patch('captcha-login',
    "  var ans  = parseInt(document.getElementById('captcha-a').value, 10);\n  var err  = document.getElementById('login-err');\n  if (user === CREDS.user.toLowerCase() && pass === CREDS.pass && !isNaN(ans) && ans === _captchaAns) {",
    "  var err  = document.getElementById('login-err');\n  if (user === CREDS.user.toLowerCase() && pass === CREDS.pass) {"
  );

  // 4. Remove _captchaAns var
  patch('captchaAns', 'var _captchaAns = 0;\n', '');

  // 5. Remove refreshCaptcha function
  {
    const rfStart = html.indexOf('function refreshCaptcha()');
    if (rfStart !== -1) {
      const rfEnd = html.indexOf('\n}', rfStart) + 2;
      html = html.slice(0, rfStart) + html.slice(rfEnd + 1);
      console.log('✅ refreshCaptcha fn removed');
    } else console.log('❌ refreshCaptcha fn not found');
  }

  // 6. Remove bare refreshCaptcha() call and captcha reset in else
  patch('captcha-bare-call', 'refreshCaptcha();\n\n// ===== REMEMBER ME =====', '// ===== REMEMBER ME =====');
  patch('captcha-else-call',
    "    refreshCaptcha();\n  }\n}\ndocument.addEventListener('keydown'",
    "  }\n}\ndocument.addEventListener('keydown'"
  );

  // 7. Fix error message
  patch('err-msg', 'Incorrect email, password, or security answer.', 'Incorrect email or password.');

  // 8. Clear stale saved creds on load
  patch('stale-creds',
    '// ===== REMEMBER ME =====',
    "// ===== REMEMBER ME =====\ntry{var _sc=localStorage.getItem('ezy_saved_creds');if(_sc){var _scp=JSON.parse(atob(_sc));if(_scp.p!==CREDS.pass)localStorage.removeItem('ezy_saved_creds');}}catch(e){localStorage.removeItem('ezy_saved_creds');}"
  );

  // 9. No-cache meta
  patch('no-cache', '<meta charset="UTF-8">',
    '<meta charset="UTF-8">\n<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">\n<meta http-equiv="Pragma" content="no-cache">\n<meta http-equiv="Expires" content="0">'
  );

  // Verify JS syntax
  const err2 = checkSyntax(html);
  if (err2) { console.log('\n❌ SYNTAX ERROR:\n', err2); process.exit(1); }
  else console.log('✅ Final JS parses clean');

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
