const https = require('https');
const fs = require('fs');

// Fetch from the last known-good deployment URL (before my changes broke it)
// Actually fetch from current live site which has the fixed alert code but broken emojis
// We need the Vercel file API to get the original

const token = 'vcp_0kEtvmApVQ4IWxG6Ko3BIAQTMF8GR6SgOhvGkerAZAQ30CRmlt3NYTs6';
const teamId = 'team_IGUGbCcmmIqBqrQz0zpvu1Zz';
// This is the deployment I made that has fixed alerts + index.html at root
const dplId = 'dpl_E416qHdh9B63vj6JDaUrfMqfw41R';

function get(url, headers) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers }, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks) }));
    });
    req.on('error', reject);
  });
}

async function main() {
  // List files in deployment
  const filesRes = await get(
    `https://api.vercel.com/v7/deployments/${dplId}/files?teamId=${teamId}`,
    { Authorization: `Bearer ${token}` }
  );
  console.log('Files API status:', filesRes.status);
  const files = JSON.parse(filesRes.body.toString());
  console.log('Files:', JSON.stringify(files, null, 2));

  // Find index.html uid
  let uid = null;
  if (Array.isArray(files)) {
    for (const f of files) {
      if (f.name === 'index.html') { uid = f.uid; break; }
    }
  }
  console.log('UID:', uid);

  if (uid) {
    const fileRes = await get(
      `https://api.vercel.com/v7/deployments/${dplId}/files/${uid}?teamId=${teamId}`,
      { Authorization: `Bearer ${token}` }
    );
    console.log('File fetch status:', fileRes.status);
    fs.writeFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-raw.html', fileRes.body);
    console.log('Saved', fileRes.body.length, 'bytes');
  }
}

main().catch(console.error);
