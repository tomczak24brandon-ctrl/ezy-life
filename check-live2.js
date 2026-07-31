const https = require('https');
https.get('https://ezy-life.vercel.app', (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', JSON.stringify(res.headers, null, 2));
  const chunks = [];
  res.on('data', c => chunks.push(c));
  res.on('end', () => {
    const html = Buffer.concat(chunks).toString();
    console.log('\nTotal HTML length:', html.length);
    const s = html.indexOf('<script>');
    const e = html.indexOf('</script>', s);
    console.log('Script tag at:', s, 'end at:', e);
    if (s !== -1) {
      console.log('Script content:', JSON.stringify(html.substring(s, Math.min(s+500, e+9))));
    }
    // Also check if there are multiple scripts
    let pos = 0, count = 0;
    while (true) {
      const i = html.indexOf('<script', pos);
      if (i === -1) break;
      count++;
      console.log(`Script #${count} at pos ${i}: ${html.substring(i, i+80)}`);
      pos = i + 1;
    }
  });
}).on('error', console.error);
