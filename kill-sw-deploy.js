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
    const req = https.request({
      hostname: u.hostname, path: u.pathname + u.search, method: 'POST',
      headers: { ...headers, 'Content-Length': data.length }
    }, (res) => {
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
  // Read the current workspace HTML (which has all our patches)
  let html = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');
  console.log('Current size:', html.length);

  // The SW killer script - kills all service workers and clears ALL caches
  const swKiller = `<script>
// Aggressively kill all service workers and caches
(function() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(regs) {
      regs.forEach(function(r) { r.unregister(); console.log('SW unregistered:', r.scope); });
    });
  }
  if ('caches' in window) {
    caches.keys().then(function(keys) {
      keys.forEach(function(k) { caches.delete(k); console.log('Cache deleted:', k); });
    });
  }
  // If this page was loaded from SW cache, reload from network
  if (navigator.serviceWorker && navigator.serviceWorker.controller) {
    console.log('SW controller active - hard reloading');
    window.location.reload(true);
  }
})();
</script>`;

  // Insert SW killer right after <head> tag
  if (!html.includes('SW unregistered')) {
    html = html.replace('<head>', '<head>\n' + swKiller);
    console.log('OK SW killer added');
  } else {
    console.log('SW killer already present');
  }

  // Verify syntax still good
  var scripts = [], sp = 0;
  while (true) { var si = html.indexOf('<script>', sp); if (si === -1) break; var se = html.indexOf('</script>', si); scripts.push({s:si+8,e:se,size:se-si}); sp=si+1; }
  var ms = scripts.sort(function(a,b){return b.size-a.size;})[0];
  var js = html.substring(ms.s, ms.e);
  try { new vm.Script('"use strict";\n'+js); console.log('OK syntax clean'); }
  catch(e) { console.log('SYNTAX ERROR:', e.message); process.exit(1); }

  fs.writeFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', html, 'utf8');
  console.log('Saved:', html.length);

  console.log('\nDeploying...');
  var dep = await post('https://api.vercel.com/v13/deployments?teamId='+teamId,
    { Authorization: '***'+token, 'Content-Type': 'application/json' },
    { name: 'ezy-life', target: 'production', files: [
      { file: 'index.html', data: html, encoding: 'utf-8' },
      { file: 'vercel.json', data: JSON.stringify({
        headers: [{
          source: '/(.*)',
          headers: [
            { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, max-age=0' },
            { key: 'Pragma', value: 'no-cache' },
            { key: 'Expires', value: '0' }
          ]
        }]
      }), encoding: 'utf-8' }
    ]}
  );

  console.log('ID:', dep.id);
  if (dep.error) { console.error(JSON.stringify(dep.error)); process.exit(1); }

  for (var i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 3000));
    var st = JSON.parse((await get('https://api.vercel.com/v13/deployments/'+dep.id+'?teamId='+teamId, {Authorization:'***'+token})).toString());
    console.log('['+i+']', st.readyState);
    if (st.readyState === 'READY') break;
    if (st.readyState === 'ERROR') { console.error('Deploy failed'); process.exit(1); }
  }

  for (var alias of ['ezy-life.vercel.app', 'ezy-life-iron-eagle-truck-center.vercel.app']) {
    var ar = await post('https://api.vercel.com/v2/deployments/'+dep.id+'/aliases?teamId='+teamId,
      {Authorization:'***'+token,'Content-Type':'application/json'}, {alias});
    console.log('Alias:', alias, ar.uid ? 'OK' : JSON.stringify(ar).substring(0,80));
  }

  console.log('\nDone! https://ezy-life.vercel.app');
}

main().catch(console.error);
