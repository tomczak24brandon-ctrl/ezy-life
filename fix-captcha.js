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
  // Work from current production file (has all previous patches)
  let html = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');
  console.log('✅ Loaded workspace file. Size:', html.length);

  function patch(label, from, to) {
    if (html.includes(from)) { html = html.split(from).join(to); console.log('✅ ' + label); }
    else { console.log('❌ ' + label + ' — NOT FOUND'); }
  }

  // FIX: The bare refreshCaptcha() after the function def fires before the DOM element exists.
  // Change it to only run when DOM is ready.
  patch('captcha-dom-ready',
    '}\nrefreshCaptcha();\n\n// ===== REMEMBER ME =====',
    '}\n// Call after DOM is ready so captcha-q element exists\ndocument.addEventListener(\'DOMContentLoaded\', function() { refreshCaptcha(); });\n\n// ===== REMEMBER ME ====='
  );

  // Verify
  const checks = {
    'DOMContentLoaded-captcha': html.includes("DOMContentLoaded") && html.includes("refreshCaptcha"),
    'no-bare-refreshCaptcha': !html.includes('}\nrefreshCaptcha();\n\n// ===== REMEMBER ME'),
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
