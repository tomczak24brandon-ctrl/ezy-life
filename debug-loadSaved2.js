const https = require('https');
const token = 'vcp_0kEtvmApVQ4IWxG6Ko3BIAQTMF8GR6SgOhvGkerAZAQ30CRmlt3NYTs6';
const teamId = 'team_IGUGbCcmmIqBqrQz0zpvu1Zz';
function get(url, h) { return new Promise((res,rej)=>{https.get(url,{headers:h},r=>{const c=[];r.on('data',d=>c.push(d));r.on('end',()=>res(Buffer.concat(c)));}).on('error',rej);}); }
async function main() {
  const fr = await get('https://api.vercel.com/v7/deployments/dpl_AYcCTWpNBuigC8YxdcbWXTyp2uZK/files/8aa2b40d2879087b06f50b9de16c7b1f6632f514?teamId='+teamId, { Authorization: 'Bearer '+token });
  let html = Buffer.from(JSON.parse(fr.toString()).data,'base64').toString('utf8');
  const lsIdx = html.indexOf('(function loadSaved(){');
  const lsEnd = html.indexOf('\n})', lsIdx);
  const lsEnd2 = html.indexOf('\n}(', lsIdx);
  console.log('loadSaved IIFE start:', lsIdx);
  console.log('closing }) at:', lsEnd);
  console.log('closing }( at:', lsEnd2);
  console.log('\n=== End of loadSaved ===');
  console.log(JSON.stringify(html.substring(Math.min(lsEnd,lsEnd2)-10, Math.min(lsEnd,lsEnd2)+50)));
}
main().catch(console.error);
