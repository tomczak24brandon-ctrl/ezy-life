const https = require('https');
const token = 'vcp_0kEtvmApVQ4IWxG6Ko3BIAQTMF8GR6SgOhvGkerAZAQ30CRmlt3NYTs6';
const teamId = 'team_IGUGbCcmmIqBqrQz0zpvu1Zz';

function get(url, headers) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(JSON.parse(Buffer.concat(chunks).toString())));
    }).on('error', reject);
  });
}

async function main() {
  // List files in the known-good deployment
  const r = await get(
    `https://api.vercel.com/v7/deployments/dpl_2659JMjo2viD1pqHH2hu4rAoSZqA/files?teamId=${teamId}`,
    { Authorization: `Bearer ${token}` }
  );
  console.log(JSON.stringify(r, null, 2));
}
main().catch(console.error);
