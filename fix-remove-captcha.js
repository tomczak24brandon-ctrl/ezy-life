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
  let html = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');
  console.log('Loaded. Size:', html.length);

  function patch(label, from, to) {
    if (html.includes(from)) { html = html.split(from).join(to); console.log('✅ ' + label); }
    else { console.log('❌ ' + label + ' — NOT FOUND'); }
  }

  // 1. Remove the captcha-box HTML from the login form
  // It looks like: <div class="captcha-box">...(refresh button)</div>
  const captchaBoxStart = html.indexOf('<div class="captcha-box">');
  const captchaBoxEnd = html.indexOf('</div>', captchaBoxStart) + '</div>'.length;
  if (captchaBoxStart !== -1) {
    html = html.slice(0, captchaBoxStart) + html.slice(captchaBoxEnd);
    console.log('✅ captcha-box HTML removed');
  } else {
    console.log('❌ captcha-box not found');
  }

  // 2. Remove the captcha validation from doLogin — rewrite the condition
  patch('captcha-check-remove',
    "  var ans  = parseInt(document.getElementById('captcha-a').value, 10);\n  var err  = document.getElementById('login-err');\n  if (user === CREDS.user.toLowerCase() && pass === CREDS.pass && !isNaN(ans) && ans === _captchaAns) {",
    "  var err  = document.getElementById('login-err');\n  if (user === CREDS.user.toLowerCase() && pass === CREDS.pass) {"
  );

  // 3. Remove _captchaAns var declaration
  patch('captchaAns-var', 'var _captchaAns = 0;\n', '');

  // 4. Remove refreshCaptcha function + its DOMContentLoaded call
  // Find and remove the entire refreshCaptcha function
  const rfStart = html.indexOf('function refreshCaptcha()');
  if (rfStart !== -1) {
    const rfEnd = html.indexOf('\n}', rfStart) + '\n}'.length;
    html = html.slice(0, rfStart) + html.slice(rfEnd + 1);
    console.log('✅ refreshCaptcha function removed');
  } else {
    console.log('❌ refreshCaptcha function not found');
  }

  // 5. Remove the DOMContentLoaded captcha call
  patch('captcha-domready-call',
    "document.addEventListener('DOMContentLoaded', function() { refreshCaptcha(); });\n",
    ''
  );

  // 6. Remove wrong-answer captcha reset in else branch
  patch('captcha-reset-else',
    "    refreshCaptcha();\n  }\n}\ndocument.addEventListener('keydown'",
    "  }\n}\ndocument.addEventListener('keydown'"
  );

  // 7. Remove .captcha-box and .captcha-* CSS (optional cleanup)
  patch('captcha-css',
    '.captcha-box { background:var(--surface2); border:1px solid var(--border); border-radius:8px; padding:10px 14px; display:flex; align-items:center; gap:10px; }',
    ''
  );

  // Verify
  const checks = {
    'no-captcha-box-html': !html.includes('<div class="captcha-box">'),
    'no-captcha-ans-var': !html.includes('_captchaAns'),
    'no-refreshCaptcha': !html.includes('refreshCaptcha'),
    'no-loading-text': !html.includes('>Loading...</'),
    'has-emojis': /[\u{1F000}-\u{1FFFF}]/u.test(html),
  };
  console.log('\nVerification:');
  let allGood = true;
  Object.entries(checks).forEach(([k,v]) => { console.log(`  ${v?'✅':'❌'} ${k}`); if(!v) allGood=false; });
  if (!allGood) { console.log('\n❌ Aborting.'); process.exit(1); }

  fs.writeFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', html, 'utf8');
  console.log('\nSaved. Size:', html.length);

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
