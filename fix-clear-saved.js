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

  // The loadSaved() function auto-fills the password field from localStorage.
  // If the stored password doesn't match current CREDS, clear it so user types fresh.
  // Replace the loadSaved IIFE to validate before auto-filling.
  const OLD_LOADSAVED = `(function loadSaved(){
  var saved = localStorage.getItem('ezy_saved_creds');
  if (saved) {
    try {
      var c = JSON.parse(atob(saved));`;

  const NEW_LOADSAVED = `(function loadSaved(){
  // Clear any saved creds that don't match current password (stale saved creds)
  var saved = localStorage.getItem('ezy_saved_creds');
  if (saved) {
    try {
      var test = JSON.parse(atob(saved));
      if (test.p !== CREDS.pass) { localStorage.removeItem('ezy_saved_creds'); saved = null; }
    } catch(e) { localStorage.removeItem('ezy_saved_creds'); saved = null; }
  }
  if (saved) {
    try {
      var c = JSON.parse(atob(saved));`;

  if (html.includes(OLD_LOADSAVED)) {
    html = html.split(OLD_LOADSAVED).join(NEW_LOADSAVED);
    console.log('✅ loadSaved patched — stale creds auto-cleared');
  } else {
    console.log('❌ loadSaved not matched, trying fallback');
    // Fallback: just nuke the saved creds key on every load before loadSaved runs
    const OLD_COMMENT = '// ===== REMEMBER ME =====';
    const NEW_COMMENT = '// ===== REMEMBER ME =====\n// Clear stale saved creds if password changed\ntry { var _sc = localStorage.getItem(\'ezy_saved_creds\'); if (_sc) { var _scp = JSON.parse(atob(_sc)); if (_scp.p !== CREDS.pass) localStorage.removeItem(\'ezy_saved_creds\'); } } catch(e) { localStorage.removeItem(\'ezy_saved_creds\'); }';
    if (html.includes(OLD_COMMENT)) {
      html = html.split(OLD_COMMENT).join(NEW_COMMENT);
      console.log('✅ Fallback stale-creds clear added');
    } else {
      console.log('❌ Neither approach matched');
      process.exit(1);
    }
  }

  fs.writeFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', html, 'utf8');

  console.log('Deploying...');
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

  console.log('\n🚀 Live — open in incognito to bypass cache');
}

main().catch(console.error);
