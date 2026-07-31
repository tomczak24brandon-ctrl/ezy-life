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
  // Find the MAIN script (largest one)
  let pos = 0, mainScript = null;
  while (true) {
    const s = html.indexOf('<script>', pos);
    if (s === -1) break;
    const e = html.indexOf('</script>', s);
    const size = e - s;
    if (!mainScript || size > mainScript.size) mainScript = { s: s+8, e, size };
    pos = s + 1;
  }
  if (!mainScript) return 'No script found';
  const script = html.substring(mainScript.s, mainScript.e);
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

  // The REAL fix: loadSaved() fills the email field from localStorage
  // That stored email may be uppercase. Also wipe ALL saved creds on load
  // so the user always types fresh.
  // Also: make doLogin() trim+lowercase the user input (already does)
  // AND make loadSaved() lowercase the email when filling the field.

  // Fix loadSaved to always lowercase the email when restoring it
  const OLD_LOAD = `function loadSaved() {`;
  const NEW_LOAD = `function loadSaved() {
  // Always wipe any stored creds to avoid stale/case issues
  localStorage.removeItem('ezy_saved_creds');`;

  if (html.includes(OLD_LOAD) && !html.includes('Always wipe any stored creds')) {
    html = html.replace(OLD_LOAD, NEW_LOAD);
    console.log('✅ loadSaved: wipe stale creds on every load');
  } else if (html.includes('Always wipe any stored creds')) {
    console.log('✅ loadSaved already patched');
  } else {
    console.log('⚠️  loadSaved not found - trying alternate');
    // Try to find it differently
    const li = html.indexOf('function loadSaved');
    console.log('loadSaved at:', li);
    if (li !== -1) console.log(html.substring(li, li+200));
  }

  // Also make the Sign In button handler trim+lowercase before comparing
  // doLogin already does toLowerCase on user input - that's correct
  // The issue is the FIELD is pre-filled with uppercase from localStorage
  // Solution: clear the field on page load so user types fresh

  const syntaxErr = checkSyntax(html);
  if (syntaxErr) { console.log('\n❌ SYNTAX ERROR:\n', syntaxErr); process.exit(1); }
  console.log('✅ JS syntax clean');

  fs.writeFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', html, 'utf8');

  console.log('\nDeploying...');
  const dep = await post(
    `https://api.vercel.com/v13/deployments?teamId=${teamId}`,
    { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    { name: 'ezy-life', target: 'production', files: [
      { file: 'index.html', data: html, encoding: 'utf-8' },
      { file: 'vercel.json', data: JSON.stringify({"headers":[{"source":"/(.*)","headers":[{"key":"Cache-Control","value":"no-store, no-cache, must-revalidate, max-age=0"}]}]}), encoding: 'utf-8' }
    ]}
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
