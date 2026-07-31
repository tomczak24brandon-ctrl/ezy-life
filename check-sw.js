const https = require('https');
function get(url,h){return new Promise((res,rej)=>{https.get(url,{headers:h},r=>{const c=[];r.on('data',d=>c.push(d));r.on('end',()=>res(Buffer.concat(c)));}).on('error',rej);});}
async function main() {
  const buf = await get('https://ezy-life.vercel.app',{'Cache-Control':'no-cache'});
  const html = buf.toString();
  // Check SW killer script
  const swKillerIdx = html.indexOf('serviceWorker');
  console.log('SW killer present:', swKillerIdx !== -1);
  if (swKillerIdx !== -1) console.log('SW killer code:', html.substring(swKillerIdx-20, swKillerIdx+300));
  // Check for any sw.js or service-worker.js links
  console.log('sw.js link:', html.includes('sw.js'));
  console.log('service-worker link:', html.includes('service-worker'));
}
main().catch(console.error);
