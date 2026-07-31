const https = require('https');
const token = 'vcp_0kEtvmApVQ4IWxG6Ko3BIAQTMF8GR6SgOhvGkerAZAQ30CRmlt3NYTs6';
const teamId = 'team_IGUGbCcmmIqBqrQz0zpvu1Zz';
function get(url, h) { return new Promise((res,rej)=>{https.get(url,{headers:h},r=>{const c=[];r.on('data',d=>c.push(d));r.on('end',()=>res(Buffer.concat(c)));}).on('error',rej);}); }
async function main() {
  const fr = await get('https://api.vercel.com/v7/deployments/dpl_AYcCTWpNBuigC8YxdcbWXTyp2uZK/files/8aa2b40d2879087b06f50b9de16c7b1f6632f514?teamId='+teamId, { Authorization: 'Bearer '+token });
  let html = Buffer.from(JSON.parse(fr.toString()).data,'base64').toString('utf8');
  
  // How many </body> tags?
  var count=0,pos=0;
  while(true){var i=html.indexOf('</body>',pos);if(i===-1)break;count++;console.log('</body> at:',i);pos=i+1;}
  console.log('Total </body> tags:',count);
  
  // Where is </script> relative to last </body>?
  var lastBody = html.lastIndexOf('</body>');
  var lastScript = html.lastIndexOf('</script>');
  console.log('Last </body>:', lastBody);
  console.log('Last </script>:', lastScript);
  console.log('Script comes after body?', lastScript > lastBody);
  
  // Show last 200 chars before </body>
  console.log('\nBefore last </body>:');
  console.log(html.substring(lastBody-200, lastBody+10));
}
main().catch(console.error);
