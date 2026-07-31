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
  let html = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');
  console.log('Loaded. Size:', html.length);

  // 1. Remove all DEBUG alerts
  let count = 0;
  html = html.replace(/alert\('DEBUG:[^']*'\);?\s*/g, () => { count++; return ''; });
  console.log(`✅ Removed ${count} DEBUG alert(s)`);

  // 2. Fix setFinTab — find the full function and replace it
  const OLD_FIN_TAB = `function setFinTab(tab) {
  _currentFinTab = tab;
  _currentFinAccountId = null;
  document.getElementById('fin-tab-personal').classList.toggle('active', tab === 'personal');
  document.getElementById`;

  // Find the full setFinTab function
  const sfStart = html.indexOf('function setFinTab(tab)');
  if (sfStart !== -1) {
    const sfEnd = html.indexOf('\n}', sfStart) + 2;
    const oldFn = html.substring(sfStart, sfEnd);
    console.log('Found setFinTab:\n' + oldFn.substring(0, 300));

    const newFn = `function setFinTab(tab) {
  _currentFinTab = tab;
  _currentFinAccountId = null;
  ['personal','ietc','bn1','bn2'].forEach(function(t) {
    var el = document.getElementById('fin-tab-' + t);
    if (el) el.classList.toggle('active', t === tab);
  });
  renderFinPage();
}`;
    html = html.slice(0, sfStart) + newFn + html.slice(sfEnd);
    console.log('✅ setFinTab rewritten for 4 tabs');
  } else {
    console.log('❌ setFinTab not found');
  }

  // 3. Fix fin tab HTML — find and replace whatever tabs exist
  // Find the fin-tabs div
  const ftStart = html.indexOf('<div class="fin-tabs">');
  if (ftStart !== -1) {
    const ftEnd = html.indexOf('</div>', ftStart) + 6;
    const oldTabs = html.substring(ftStart, ftEnd);
    console.log('Found fin-tabs:\n' + oldTabs);
    const newTabs = `<div class="fin-tabs">
        <button class="fin-tab active" id="fin-tab-personal" onclick="setFinTab('personal')">👤 Personal</button>
        <button class="fin-tab" id="fin-tab-ietc" onclick="setFinTab('ietc')">🦅 Iron Eagle</button>
        <button class="fin-tab" id="fin-tab-bn1" onclick="setFinTab('bn1')">🏠 B&amp;N #1</button>
        <button class="fin-tab" id="fin-tab-bn2" onclick="setFinTab('bn2')">🏠 B&amp;N #2</button>
      </div>`;
    html = html.slice(0, ftStart) + newTabs + html.slice(ftEnd);
    console.log('✅ Fin tabs HTML updated to 4 tabs');
  } else {
    console.log('❌ fin-tabs div not found');
  }

  // 4. Ensure fin vars declared
  if (!html.includes('var _finAccounts')) {
    const finSection = html.indexOf('// ===== FINANCIALS =====');
    if (finSection !== -1) {
      html = html.slice(0, finSection) +
        "var _finAccounts = {}; var _currentFinTab = 'personal'; var _currentFinAccountId = null; var _currentBudgetMonth = null; var _budgetItemEdit = null;\n\n" +
        html.slice(finSection);
      console.log('✅ fin vars declared');
    }
  } else {
    console.log('✅ fin vars already present');
  }

  // Syntax check
  const err = checkSyntax(html);
  if (err) { console.log('\n❌ SYNTAX ERROR:\n', err); process.exit(1); }
  console.log('✅ JS syntax clean');

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
