const https = require('https');

https.get('https://ezy-life.vercel.app', (res) => {
  const chunks = [];
  res.on('data', c => chunks.push(c));
  res.on('end', () => {
    const html = Buffer.concat(chunks).toString();

    // Find the main script (second one)
    let pos = 0, scripts = [];
    while (true) {
      const i = html.indexOf('<script>', pos);
      if (i === -1) break;
      const e = html.indexOf('</script>', i);
      scripts.push({ start: i, end: e, size: e - i });
      pos = i + 1;
    }
    console.log('Scripts found:', scripts.length);
    scripts.forEach((s, i) => console.log(`  Script ${i+1}: size=${s.size}`));

    // Check the main script
    const mainScript = scripts.find(s => s.size > 1000);
    if (!mainScript) { console.log('❌ No main script found!'); return; }
    const js = html.substring(mainScript.start + 8, mainScript.end);

    console.log('\n=== KEY CHECKS ===');
    console.log('CREDS.pass:', html.match(/pass: '([^']+)'/)?.[1]);
    console.log('doLogin present:', js.includes('function doLogin()'));
    console.log('captcha in doLogin:', js.includes('_captchaAns'));
    console.log('clean login check:', js.includes("user === CREDS.user.toLowerCase() && pass === CREDS.pass) {"));

    // Show the actual doLogin function
    const dl = js.indexOf('function doLogin()');
    console.log('\n=== doLogin ===');
    console.log(js.substring(dl, dl + 400));

    // Show login button HTML
    const btn = html.indexOf('doLogin');
    console.log('\n=== Login button ===');
    console.log(html.substring(btn - 100, btn + 100));
  });
}).on('error', console.error);
