const https = require('https');
https.get('https://ezy-life.vercel.app', (res) => {
  const chunks = [];
  res.on('data', c => chunks.push(c));
  res.on('end', () => {
    const html = Buffer.concat(chunks).toString();
    const pass = html.match(/pass: '([^']+)'/)?.[1];
    const hasDoLogin = html.includes('function doLogin()');
    const hasCaptcha = html.includes('_captchaAns');
    const hasCaptchaCheck = html.includes('ans === _captchaAns');
    const loginCheck = html.includes("if (user === CREDS.user.toLowerCase() && pass === CREDS.pass) {");
    console.log('pass:', pass);
    console.log('doLogin present:', hasDoLogin);
    console.log('captchaAns var:', hasCaptcha);
    console.log('captcha check in doLogin:', hasCaptchaCheck);
    console.log('clean login check:', loginCheck);
    // Check for syntax errors by finding the script
    const s = html.indexOf('<script>') + 8;
    const e = html.indexOf('</script>', s);
    console.log('Script size:', e - s);
  });
}).on('error', console.error);
