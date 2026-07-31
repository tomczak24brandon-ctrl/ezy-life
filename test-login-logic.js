const https = require('https');

function get(url, h) {
  return new Promise((res,rej)=>{
    https.get(url,{headers:h},r=>{const c=[];r.on('data',d=>c.push(d));r.on('end',()=>res(Buffer.concat(c)));}).on('error',rej);
  });
}

async function main() {
  const buf = await get('https://ezy-life.vercel.app', {'Cache-Control':'no-cache'});
  const html = buf.toString();

  // Extract CREDS
  const credsMatch = html.match(/var CREDS = \{[^}]+\}/);
  console.log('CREDS line:', credsMatch ? credsMatch[0] : 'NOT FOUND');

  // Extract doLogin function
  const dlIdx = html.indexOf('function doLogin()');
  console.log('\ndoLogin function:');
  console.log(html.substring(dlIdx, dlIdx+600));

  // Check for captcha in the HTML body (not CSS)
  const captchaHtmlIdx = html.indexOf('<div class="captcha-box"');
  console.log('\ncaptcha-box HTML element:', captchaHtmlIdx !== -1 ? 'PRESENT (BAD)' : 'REMOVED (GOOD)');

  // Simulate login
  const email = 'tomczak24brandon@gmail.com';
  const pass = 'Gordon2448@@@';
  const userMatch = html.match(/user: '([^']+)'/);
  const passMatch = html.match(/pass: '([^']+)'/);
  if (userMatch && passMatch) {
    const CREDS_user = userMatch[1];
    const CREDS_pass = passMatch[1];
    const loginResult = email.toLowerCase() === CREDS_user.toLowerCase() && pass === CREDS_pass;
    console.log('\nLogin simulation:');
    console.log('  Input email:', email);
    console.log('  CREDS user:', CREDS_user);
    console.log('  Input pass:', pass);
    console.log('  CREDS pass:', CREDS_pass);
    console.log('  Would login?', loginResult ? 'YES ✓' : 'NO ✗');
  }
}
main().catch(console.error);
