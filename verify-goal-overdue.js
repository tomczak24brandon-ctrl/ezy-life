const https = require('https');
https.get('https://ezy-life.vercel.app', res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('?? count:', (d.match(/\?\?/g)||[]).length);
    console.log('getOverdueGoals present:', d.includes('function getOverdueGoals'));
    console.log('Banner expanded:', d.includes('og.length > 0'));
    console.log('Goal targetDate in saveGoal:', d.includes('targetDate:document.getElementById'));
    console.log('Has emoji:', d.includes('\uD83C\uDFAF'));
  });
});
