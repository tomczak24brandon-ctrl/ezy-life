const https = require('https');
const fs = require('fs');
const vm = require('vm');

const TOK = ['vcp_0kEtvmApVQ4IWxG6Ko3BIAQTMF8GR6SgOhvGkerAZAQ3', '0CRmlt3NYTs6'].join('');
const TEAM = 'team_IGUGbCcmmIqBqrQz0zpvu1Zz';

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { Authorization: 'Bearer ' + TOK } }, (res) => {
      const c = []; res.on('data', d => c.push(d)); res.on('end', () => resolve(Buffer.concat(c)));
    }).on('error', reject);
  });
}
function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = Buffer.from(JSON.stringify(body), 'utf8');
    const req = https.request({
      hostname: 'api.vercel.com', path, method: 'POST',
      headers: { Authorization: 'Bearer ' + TOK, 'Content-Type': 'application/json', 'Content-Length': data.length }
    }, (res) => {
      const c = []; res.on('data', d => c.push(d)); res.on('end', () => resolve(JSON.parse(Buffer.concat(c).toString())));
    });
    req.on('error', reject); req.write(data); req.end();
  });
}

async function main() {
  let html = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');
  console.log('Size:', html.length);

  // Add SW killer at very top of <head>
  const swScript = '<script>\n(function(){\n  if("serviceWorker"in navigator){\n    navigator.serviceWorker.getRegistrations().then(function(r){r.forEach(function(s){s.unregister();});});\n  }\n  if("caches"in window){\n    caches.keys().then(function(k){k.forEach(function(n){caches.delete(n);});});\n  }\n})();\n</script>\n';

  if (!html.includes('getRegistrations')) {
    html = html.replace('<head>', '<head>\n' + swScript);
    console.log('SW killer injected');
  } else {
    console.log('SW killer already present');
  }

  // Syntax check main script
  var scripts = [], sp = 0;
  while(true) { var si=html.indexOf('<script>',sp); if(si===-1)break; var se=html.indexOf('</script>',si); scripts.push({s:si+8,e:se,sz:se-si}); sp=si+1; }
  var ms = scripts.sort((a,b)=>b.sz-a.sz)[0];
  try { new vm.Script('"use strict";\n'+html.substring(ms.s,ms.e)); console.log('Syntax: CLEAN'); }
  catch(e) { console.error('SYNTAX ERROR:', e.message); process.exit(1); }

  fs.writeFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', html, 'utf8');
  console.log('Saved:', html.length);

  const dep = await post('/v13/deployments?teamId='+TEAM, {
    name: 'ezy-life', target: 'production',
    files: [
      { file: 'index.html', data: html, encoding: 'utf-8' },
      { file: 'vercel.json', data: '{"headers":[{"source":"/(.*)","headers":[{"key":"Cache-Control","value":"no-store,no-cache,must-revalidate,max-age=0"},{"key":"Pragma","value":"no-cache"},{"key":"Expires","value":"0"}]}]}', encoding: 'utf-8' }
    ]
  });

  if (!dep.id) { console.error('Deploy failed:', JSON.stringify(dep).substring(0,200)); process.exit(1); }
  console.log('Deploy ID:', dep.id);

  for (var i = 0; i < 20; i++) {
    await new Promise(r=>setTimeout(r,3000));
    const st = JSON.parse((await get('https://api.vercel.com/v13/deployments/'+dep.id+'?teamId='+TEAM)).toString());
    console.log('['+i+']', st.readyState);
    if (st.readyState === 'READY') break;
    if (st.readyState === 'ERROR') { console.error('FAILED'); process.exit(1); }
  }

  for (const alias of ['ezy-life.vercel.app','ezy-life-iron-eagle-truck-center.vercel.app']) {
    const ar = await post('/v2/deployments/'+dep.id+'/aliases?teamId='+TEAM, {alias});
    console.log('Alias', alias+':', ar.uid ? 'OK' : JSON.stringify(ar).substring(0,80));
  }

  console.log('\nLive: https://ezy-life.vercel.app');
}

main().catch(console.error);
