const https = require('https');
const fs = require('fs');

const token = 'vcp_0kEtvmApVQ4IWxG6Ko3BIAQTMF8GR6SgOhvGkerAZAQ30CRmlt3NYTs6';
const teamId = 'team_IGUGbCcmmIqBqrQz0zpvu1Zz';

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
  // Read current deployed HTML from workspace
  const html = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');
  console.log('Current size:', html.length);
  
  // Add a version timestamp comment at the top to force cache invalidation
  const ts = Date.now();
  const newHtml = html.replace('<!DOCTYPE html>', '<!DOCTYPE html>\n<!-- v' + ts + ' -->');
  
  // Also change the page title slightly so it's obvious it reloaded
  const finalHtml = newHtml.replace('<title>EZY Life</title>', '<title>EZY Life</title>');
  
  console.log('Deploying with cache bust timestamp:', ts);
  
  var dep = await post('https://api.vercel.com/v13/deployments?teamId='+teamId,
    { Authorization: 'Bearer '+token, 'Content-Type': 'application/json' },
    { name: 'ezy-life', target: 'production', files: [
      { file: 'index.html', data: finalHtml, encoding: 'utf-8' },
      { file: 'vercel.json', data: JSON.stringify({
        headers: [{
          source: '/(.*)',
          headers: [
            { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0' },
            { key: 'Pragma', value: 'no-cache' },
            { key: 'Expires', value: '0' },
            { key: 'Surrogate-Control', value: 'no-store' }
          ]
        }]
      }), encoding: 'utf-8' }
    ]}
  );
  
  console.log('Deploy ID:', dep.id);
  if (dep.error) { console.error(JSON.stringify(dep.error)); process.exit(1); }
  
  for (var i=0; i<20; i++) {
    await new Promise(r=>setTimeout(r,3000));
    var st = JSON.parse((await get('https://api.vercel.com/v13/deployments/'+dep.id+'?teamId='+teamId,{Authorization:'Bearer '+token})).toString());
    console.log('['+i+']', st.readyState);
    if (st.readyState==='READY') break;
    if (st.readyState==='ERROR') { console.error('FAILED'); process.exit(1); }
  }
  
  for (var alias of ['ezy-life.vercel.app','ezy-life-iron-eagle-truck-center.vercel.app']) {
    var ar = await post('https://api.vercel.com/v2/deployments/'+dep.id+'/aliases?teamId='+teamId,
      {Authorization:'Bearer '+token,'Content-Type':'application/json'},{alias});
    console.log('Alias:', alias, ar.uid?'OK':JSON.stringify(ar).substring(0,80));
  }
  
  fs.writeFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', finalHtml, 'utf8');
  console.log('Done!');
}

main().catch(console.error);
