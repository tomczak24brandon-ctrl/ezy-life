const https = require('https');
https.get('https://ezy-life.vercel.app', res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('?? count:', (d.match(/\?\?/g)||[]).length);
    console.log('Default day:', d.includes("_gcalView = 'day'"));
    console.log('Day btn active:', d.includes('gcal-vbtn active" id="gcal-vbtn-day'));
    console.log('Week btn inactive:', d.includes('gcal-vbtn" id="gcal-vbtn-week'));
  });
});
