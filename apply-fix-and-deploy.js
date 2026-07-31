const https = require('https');
const fs = require('fs');

const token = 'vcp_0kEtvmApVQ4IWxG6Ko3BIAQTMF8GR6SgOhvGkerAZAQ30CRmlt3NYTs6';
const teamId = 'team_IGUGbCcmmIqBqrQz0zpvu1Zz';

// Read original clean file
let html = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-original.html', 'utf8');
console.log('Original size:', html.length);

// Apply the debug alert fixes
const fixes = [
  ["if (!group) { alert('DEBUG: group not found for id=' + groupId); return; }", "if (!group) { return; }"],
  ["if (group.items.length === 1) { alert('DEBUG: going to ' + group.items[0].id); showPage(group.items[0].id); return; }", "if (group.items.length === 1) { showPage(group.items[0].id); return; }"],
  ["alert('DEBUG: showing submenu for ' + groupId + ' with ' + group.items.length + ' items');", ""],
];

for (const [from, to] of fixes) {
  if (html.includes(from)) {
    html = html.split(from).join(to);
    console.log('✅ Fixed:', from.substring(0, 60));
  } else {
    console.log('❌ Not found:', from.substring(0, 60));
  }
}

// Save fixed file
fs.writeFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', html, 'utf8');
console.log('Fixed file saved:', html.length, 'chars');

// Deploy to Vercel
function post(url, headers, body) {
  return new Promise((resolve, reject) => {
    const data = Buffer.from(JSON.stringify(body), 'utf8');
    const urlObj = new URL(url);
    const req = https.request({
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: { ...headers, 'Content-Length': data.length }
    }, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString() }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function deploy() {
  console.log('\nDeploying...');
  const res = await post(
    `https://api.vercel.com/v13/deployments?teamId=${teamId}`,
    { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    {
      name: 'ezy-life',
      target: 'production',
      files: [{ file: 'index.html', data: html, encoding: 'utf-8' }]
    }
  );
  const parsed = JSON.parse(res.body);
  console.log('Deploy ID:', parsed.id);
  console.log('URL:', parsed.url);
  console.log('State:', parsed.readyState);
  return parsed.id;
}

deploy().catch(console.error);
