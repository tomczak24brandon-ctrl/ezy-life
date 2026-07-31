const https = require('https');
https.get('https://ezy-life.vercel.app', res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('?? count:', (d.match(/\?\?/g)||[]).length);
    console.log('Sign In clean:', d.includes('>Sign In<'));
    console.log('No trailing ?:', !d.includes('Sign In ?'));
  });
});
