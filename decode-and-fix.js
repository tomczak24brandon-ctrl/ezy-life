const https = require('https');
const fs = require('fs');

const token = 'vcp_0kEtvmApVQ4IWxG6Ko3BIAQTMF8GR6SgOhvGkerAZAQ30CRmlt3NYTs6';
const teamId = 'team_IGUGbCcmmIqBqrQz0zpvu1Zz';
// Use the ORIGINAL deployment (before any of my changes)
const dplId = 'dpl_AYcCTWpNBuigC8YxdcbWXTyp2uZK';
const uid = '8aa2b40d2879087b06f50b9de16c7b1f6632f514'; // src/index.html from original

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
  const fileRes = await get(
    `https://api.vercel.com/v7/deployments/${dplId}/files/${uid}?teamId=${teamId}`,
    { Authorization: `Bearer ${token}` }
  );
  console.log('Status:', fileRes.status, 'size:', fileRes.body.length);
  
  const parsed = JSON.parse(fileRes.body.toString());
  let htmlContent;
  if (parsed.data) {
    // base64 encoded
    htmlContent = Buffer.from(parsed.data, 'base64').toString('utf8');
    console.log('Decoded from base64, length:', htmlContent.length);
  } else {
    htmlContent = fileRes.body.toString('utf8');
  }
  
  const hasNav = htmlContent.includes('sidebarGroup') || htmlContent.includes('showPage');
  console.log('Has nav code:', hasNav);
  console.log('First 200:', htmlContent.substring(0, 200));

  // Check emoji state
  const hasRealEmojis = /[\u{1F000}-\u{1FFFF}]/u.test(htmlContent);
  const qqCount = (htmlContent.match(/\?\?/g) || []).length;
  console.log('Has real emojis:', hasRealEmojis);
  console.log('?? count:', qqCount);

  // Save the original
  fs.writeFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-original.html', htmlContent, 'utf8');
  console.log('Saved original!');
}

main().catch(console.error);
