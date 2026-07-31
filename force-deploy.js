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
  const html = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');
  console.log('File size:', html.length);

  // Deploy with BOTH index.html AND a vercel.json that sets headers
  const vercelJson = JSON.stringify({
    "headers": [
      {
        "source": "/(.*)",
        "headers": [
          { "key": "Cache-Control", "value": "no-store, no-cache, must-revalidate, max-age=0" },
          { "key": "Pragma", "value": "no-cache" },
          { "key": "Expires", "value": "0" }
        ]
      }
    ]
  });

  console.log('Deploying with cache-busting headers...');
  const dep = await post(
    `https://api.vercel.com/v13/deployments?teamId=${teamId}`,
    { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    {
      name: 'ezy-life',
      target: 'production',
      files: [
        { file: 'index.html', data: html, encoding: 'utf-8' },
        { file: 'vercel.json', data: vercelJson, encoding: 'utf-8' }
      ]
    }
  );
  console.log('Deploy ID:', dep.id);
  if (dep.error) { console.error('Error:', dep.error); process.exit(1); }

  for (let i = 0; i < 25; i++) {
    await new Promise(r => setTimeout(r, 3000));
    const r = JSON.parse((await get(`https://api.vercel.com/v13/deployments/${dep.id}?teamId=${teamId}`, { Authorization: `Bearer ${token}` })).toString());
    console.log(`[${i}] ${r.readyState}`);
    if (r.readyState === 'READY') break;
    if (r.readyState === 'ERROR') { console.error('Deploy failed!', r); process.exit(1); }
  }

  for (const alias of ['ezy-life.vercel.app', 'ezy-life-iron-eagle-truck-center.vercel.app']) {
    const r = await post(`https://api.vercel.com/v2/deployments/${dep.id}/aliases?teamId=${teamId}`,
      { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, { alias });
    console.log('Alias:', alias, r.uid ? '✅' : JSON.stringify(r).substring(0, 100));
  }

  // Verify live
  await new Promise(r => setTimeout(r, 3000));
  const live = await get('https://ezy-life.vercel.app', {});
  const liveHtml = live.toString();
  const s = liveHtml.indexOf('<script>') + 8;
  const e = liveHtml.indexOf('</script>', s);
  console.log('\nLive script size:', e - s);
  console.log('Live pass:', liveHtml.match(/pass: '([^']+)'/)?.[1]);
  console.log('Live doLogin:', liveHtml.includes('function doLogin()'));

  console.log('\n🚀 Done — https://ezy-life.vercel.app');
}

main().catch(console.error);
