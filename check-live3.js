const https = require('https');
https.get('https://ezy-life.vercel.app', {headers:{'Cache-Control':'no-cache','Pragma':'no-cache'}}, res => {
  const c=[];
  res.on('data',d=>c.push(d));
  res.on('end',()=>{
    const html=Buffer.concat(c).toString();
    console.log('Size:', html.length);
    var ci=html.indexOf('captcha-box');
    if(ci!==-1) console.log('captcha-box ctx:', html.substring(ci-20,ci+200));
    else console.log('captcha-box: NOT FOUND (good!)');
    
    var di=html.indexOf('function doLogin()');
    if(di!==-1) console.log('\ndoLogin fn:\n', html.substring(di,di+400));
    
    var pi=html.indexOf("pass: '");
    if(pi!==-1) console.log('\npass ctx:', html.substring(pi,pi+40));
  });
}).on('error',e=>console.error(e));
