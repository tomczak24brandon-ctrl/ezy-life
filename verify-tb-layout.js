const https = require('https');
https.get('https://ezy-life.vercel.app', res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('?? count:', (d.match(/\?\?/g)||[]).length);
    console.log('tb-mode CSS:', d.includes('.main.tb-mode > #main-content'));
    console.log('tb-mode toggle in JS:', d.includes("classList.toggle('tb-mode'"));
    console.log('Overdue banner intact:', d.includes('gcal-overdue-banner'));
  });
});
