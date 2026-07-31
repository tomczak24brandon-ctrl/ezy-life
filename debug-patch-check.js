const https = require('https');
const token = 'vcp_0kEtvmApVQ4IWxG6Ko3BIAQTMF8GR6SgOhvGkerAZAQ30CRmlt3NYTs6';
const teamId = 'team_IGUGbCcmmIqBqrQz0zpvu1Zz';
function get(url, h) { return new Promise((res,rej)=>{https.get(url,{headers:h},r=>{const c=[];r.on('data',d=>c.push(d));r.on('end',()=>res(Buffer.concat(c)));}).on('error',rej);}); }

async function main() {
  const fr = await get('https://api.vercel.com/v7/deployments/dpl_AYcCTWpNBuigC8YxdcbWXTyp2uZK/files/8aa2b40d2879087b06f50b9de16c7b1f6632f514?teamId='+teamId, { Authorization: 'Bearer '+token });
  let html = Buffer.from(JSON.parse(fr.toString()).data,'base64').toString('utf8');

  // Remove refreshCaptcha function first (as final-deploy2 does)
  var rfS = html.indexOf('function refreshCaptcha()');
  if (rfS !== -1) { var rfE = html.indexOf('\n}', rfS)+2; html = html.slice(0,rfS)+html.slice(rfE+1); console.log('refreshCaptcha fn removed'); }

  // Now check what's around the refreshCaptcha() call
  var rcCallIdx = html.indexOf('refreshCaptcha();');
  console.log('refreshCaptcha() call at:', rcCallIdx);
  if (rcCallIdx !== -1) {
    console.log('Context:', JSON.stringify(html.substring(rcCallIdx-20, rcCallIdx+200)));
  }

  // Check if our combined patch string exists
  var bigPatch = "refreshCaptcha();\n\n// ===== REMEMBER ME =====\n(function loadSaved(){";
  console.log('\nBig patch exists?', html.includes(bigPatch));
  
  // What actually follows refreshCaptcha call?
  var afterRC = html.indexOf('refreshCaptcha();\n');
  if (afterRC !== -1) console.log('After refreshCaptcha():', JSON.stringify(html.substring(afterRC, afterRC+100)));
}
main().catch(console.error);
