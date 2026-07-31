const https = require('https');
https.get('https://ezy-life.vercel.app', res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('?? count:', (d.match(/\?\?/g)||[]).length);
    console.log('goalsShowOverdue fn:', d.includes('function goalsShowOverdue'));
    console.log('Banner onclick:', d.includes('banner.onclick = goalsShowOverdue'));
    console.log('Flash CSS:', d.includes('overdue-flash'));
    console.log('Overdue banner div:', d.includes('gcal-overdue-banner'));
    console.log('Has emoji:', d.includes('\uD83C\uDFAF'));
  });
});
