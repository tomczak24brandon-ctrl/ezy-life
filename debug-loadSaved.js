const https = require('https');
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

async function main() {
  const fileResp = await get(
    'https://api.vercel.com/v7/deployments/dpl_AYcCTWpNBuigC8YxdcbWXTyp2uZK/files/8aa2b40d2879087b06f50b9de16c7b1f6632f514?teamId=' + teamId,
    { Authorization: 'Bearer ' + token }
  );
  let html = Buffer.from(JSON.parse(fileResp.toString()).data, 'base64').toString('utf8');

  // Find the area around loadSaved and refreshCaptcha
  const lsIdx = html.indexOf('function loadSaved');
  const rcIdx = html.indexOf('function refreshCaptcha');
  console.log('loadSaved at:', lsIdx);
  console.log('refreshCaptcha at:', rcIdx);
  
  // Show 500 chars before loadSaved to see context
  console.log('\n=== Before loadSaved ===');
  console.log(JSON.stringify(html.substring(lsIdx - 200, lsIdx + 50)));
  
  // Show refreshCaptcha area
  console.log('\n=== refreshCaptcha area ===');
  console.log(JSON.stringify(html.substring(rcIdx - 50, rcIdx + 300)));
}

main().catch(console.error);
