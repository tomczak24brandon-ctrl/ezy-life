const https = require('https');
const fs = require('fs');

const token = 'vcp_0kEtvmApVQ4IWxG6Ko3BIAQTMF8GR6SgOhvGkerAZAQ30CRmlt3NYTs6';
const teamId = 'team_IGUGbCcmmIqBqrQz0zpvu1Zz';
const dplId = 'dpl_E416qHdh9B63vj6JDaUrfMqfw41R';

function get(url, headers) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers }, (res) => {
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return get(res.headers.location, headers).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks) }));
    });
    req.on('error', reject);
  });
}

async function main() {
  // List files
  const filesRes = await get(
    `https://api.vercel.com/v7/deployments/${dplId}/files?teamId=${teamId}`,
    { Authorization: `Bearer ${token}` }
  );
  const files = JSON.parse(filesRes.body.toString());
  console.log('Files:', JSON.stringify(files, null, 2));

  // Find uid - could be at root level
  let uid = null;
  function findUid(items) {
    for (const f of items || []) {
      if (f.name === 'index.html' && f.uid) { uid = f.uid; return; }
      if (f.children) findUid(f.children);
    }
  }
  findUid(Array.isArray(files) ? files : [files]);
  console.log('UID:', uid);

  if (uid) {
    const fileRes = await get(
      `https://api.vercel.com/v7/deployments/${dplId}/files/${uid}?teamId=${teamId}`,
      { Authorization: `Bearer ${token}` }
    );
    console.log('File status:', fileRes.status, 'size:', fileRes.body.length);
    const text = fileRes.body.toString('utf8');
    // Verify it's not corrupted
    const hasNav = text.includes('sidebarGroup') || text.includes('showPage');
    console.log('Has nav code:', hasNav);
    if (hasNav) {
      fs.writeFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-clean.html', fileRes.body);
      console.log('Saved clean copy!');
    } else {
      console.log('First 300:', text.substring(0, 300));
    }
  }
}

main().catch(console.error);
