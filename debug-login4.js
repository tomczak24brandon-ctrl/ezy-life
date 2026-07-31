const https = require('https');
https.get('https://ezy-life.vercel.app', r => {
  let d = '';
  r.on('data', c => d += c);
  r.on('end', () => {
    console.log('login-screen:', d.includes('id="login-screen"'));
    console.log('main-app:', d.includes('id="main-app"'));
    console.log('l-user:', d.includes('id="l-user"'));
    console.log('l-pass:', d.includes('id="l-pass"'));
    console.log('login-err:', d.includes('id="login-err"'));
    console.log('appInit:', d.includes('function appInit'));

    // Show the full doLogin function from live site
    const i = d.indexOf('function doLogin');
    console.log('\n=== live doLogin ===');
    console.log(d.substring(i, i + 600));

    // Show what's around login-screen div
    const ls = d.indexOf('id="login-screen"');
    console.log('\n=== login-screen div ===');
    console.log(d.substring(ls - 10, ls + 100));

    // Show appInit
    const ai = d.indexOf('function appInit');
    console.log('\n=== appInit ===');
    console.log(d.substring(ai, ai + 300));
  });
});
