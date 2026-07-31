const https = require('https');
https.get('https://ezy-life.vercel.app', r => {
  let d = '';
  r.on('data', c => d += c);
  r.on('end', () => {
    // Show full appInit
    const ai = d.indexOf('function appInit');
    console.log('=== full appInit ===');
    console.log(d.substring(ai, ai + 1500));

    // Show full doLogin
    const di = d.indexOf('function doLogin');
    console.log('\n=== full doLogin ===');
    console.log(d.substring(di, di + 800));
  });
});
