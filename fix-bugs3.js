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

  function patch(label, from, to) {
    if (html.includes(from)) { html = html.split(from).join(to); console.log('✅ ' + label); return true; }
    console.log('⚠️  ' + label + ' — not found'); return false;
  }

  // 1. Remove the 3 specific DEBUG alerts in showCategoryMenu
  patch('debug alert 1',
    "alert('DEBUG: group not found for id=' + groupId); return; }",
    "return; }"
  );
  patch('debug alert 2',
    "alert('DEBUG: going to ' + group.items[0].id); showPage(group.items[0].id); return; }",
    "showPage(group.items[0].id); return; }"
  );
  patch('debug alert 3',
    "alert('DEBUG: showing submenu for ' + groupId + ' with ' + group.items.length + ' items');",
    ""
  );

  // 2. Fix the fin tabs — they use div.biz-tab, find and replace the whole tabs block
  const FIN_TABS_OLD = `<!-- Personal / Business tabs -->
        <div style="display:flex;gap:0;margin-bottom:20px;border-bottom:2px solid var(--border)">
          <div id="fin-tab-personal" class="biz-tab active" onclick="setFinTab('personal')" style="font-size:15px;font-weight:800;padding:10px 24px">👤 Personal</div>
          <div`;

  // Find the whole tabs block dynamically
  const tabsStart = html.indexOf('<!-- Personal / Business tabs -->');
  if (tabsStart !== -1) {
    // Find the closing </div> of the container div
    const containerStart = html.indexOf('<div style="display:flex;gap:0;margin-bottom:20px', tabsStart);
    // Count divs to find closing
    let depth = 0, pos = containerStart;
    while (pos < html.length) {
      const open = html.indexOf('<div', pos);
      const close = html.indexOf('</div>', pos);
      if (close === -1) break;
      if (open !== -1 && open < close) { depth++; pos = open + 4; }
      else { depth--; pos = close + 6; if (depth === 0) break; }
    }
    const tabsEnd = pos;
    const oldBlock = html.substring(tabsStart, tabsEnd);
    console.log('Found tabs block (' + oldBlock.length + ' chars)');

    const newBlock = `<!-- Financials tabs -->
        <div style="display:flex;gap:0;margin-bottom:20px;border-bottom:2px solid var(--border);overflow-x:auto">
          <div id="fin-tab-personal" class="biz-tab active" onclick="setFinTab('personal')" style="font-size:13px;font-weight:800;padding:10px 16px;white-space:nowrap">👤 Personal</div>
          <div id="fin-tab-ietc" class="biz-tab" onclick="setFinTab('ietc')" style="font-size:13px;font-weight:800;padding:10px 16px;white-space:nowrap">🦅 Iron Eagle</div>
          <div id="fin-tab-bn1" class="biz-tab" onclick="setFinTab('bn1')" style="font-size:13px;font-weight:800;padding:10px 16px;white-space:nowrap">🏠 B&amp;N #1</div>
          <div id="fin-tab-bn2" class="biz-tab" onclick="setFinTab('bn2')" style="font-size:13px;font-weight:800;padding:10px 16px;white-space:nowrap">🏠 B&amp;N #2</div>
        </div>`;

    html = html.slice(0, tabsStart) + newBlock + html.slice(tabsEnd);
    console.log('✅ Fin tabs updated to 4 tabs');
  } else {
    console.log('⚠️  Fin tabs comment not found');
  }

  // 3. Fix setFinTab to toggle biz-tab active class (not fin-tab)
  const OLD_SETTAB = `function setFinTab(tab) {
  _currentFinTab = tab;
  _currentFinAccountId = null;
  ['personal','ietc','bn1','bn2'].forEach(function(t) {
    var el = document.getElementById('fin-tab-' + t);
    if (el) el.classList.toggle('active', t === tab);
  });
  renderFinPage();
}`;
  // Already patched from last run — just verify it's there
  if (html.includes("['personal','ietc','bn1','bn2']")) {
    console.log('✅ setFinTab already has 4 tabs');
  } else {
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
      console.log('✅ setFinTab updated');
    }
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
