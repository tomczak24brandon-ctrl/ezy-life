const https = require('https');
const vm = require('vm');
const token = 'vcp_0kEtvmApVQ4IWxG6Ko3BIAQTMF8GR6SgOhvGkerAZAQ30CRmlt3NYTs6';
const teamId = 'team_IGUGbCcmmIqBqrQz0zpvu1Zz';
function get(url, h) { return new Promise((res,rej)=>{https.get(url,{headers:h},r=>{const c=[];r.on('data',d=>c.push(d));r.on('end',()=>res(Buffer.concat(c)));}).on('error',rej);}); }

async function main() {
  const fr = await get('https://api.vercel.com/v7/deployments/dpl_AYcCTWpNBuigC8YxdcbWXTyp2uZK/files/8aa2b40d2879087b06f50b9de16c7b1f6632f514?teamId='+teamId, { Authorization: 'Bearer '+token });
  let html = Buffer.from(JSON.parse(fr.toString()).data,'base64').toString('utf8');

  function patch(from, to) { if (html.includes(from)) { html = html.split(from).join(to); return true; } return false; }

  patch("pass: 'Gordon24@'", "pass: 'Gordon2448@@@'");
  var cbS = html.indexOf('<div class="captcha-box">');
  if (cbS !== -1) { var cbE = html.indexOf('</div>', cbS)+6; html = html.slice(0,cbS)+html.slice(cbE); }
  patch(
    "  var ans  = parseInt(document.getElementById('captcha-a').value, 10);\n  var err  = document.getElementById('login-err');\n  if (user === CREDS.user.toLowerCase() && pass === CREDS.pass && !isNaN(ans) && ans === _captchaAns) {",
    "  var err  = document.getElementById('login-err');\n  if (user.toLowerCase() === CREDS.user.toLowerCase() && pass === CREDS.pass) {"
  );
  patch('var _captchaAns = 0;\n', '');
  var rfS = html.indexOf('function refreshCaptcha()');
  if (rfS !== -1) { var rfE = html.indexOf('\n}', rfS)+2; html = html.slice(0,rfS)+html.slice(rfE+1); }
  patch('refreshCaptcha();\n\n// ===== REMEMBER ME =====', '// ===== REMEMBER ME =====');
  patch("(function loadSaved(){\n  var saved = localStorage.getItem('ezy_saved_creds');\n  if (saved) {\n    try {\n      var c = JSON.parse(atob(saved));\n      var u = document.getElementById('l-user'), p = document.getElementById('l-pass');\n      if (u && c.u) u.value = c.u;\n      if (p && c.p) p.value = c.p;\n      document.getElementById('remember-me').checked = true;\n    } catch(e){}\n  }\n})()",
    "function loadSaved(){\n  var saved = localStorage.getItem('ezy_saved_creds');\n  if (saved) {\n    try {\n      var c = JSON.parse(atob(saved));\n      var u = document.getElementById('l-user'), p = document.getElementById('l-pass');\n      if (u && c.u) u.value = c.u.toLowerCase();\n      if (p && c.p) p.value = c.p;\n      document.getElementById('remember-me').checked = true;\n    } catch(e){}\n  }\n}\nloadSaved()");

  // Get main script
  var scripts = [], sp = 0;
  while (true) { var si = html.indexOf('<script>',sp); if(si===-1)break; var se=html.indexOf('</script>',si); scripts.push({s:si+8,e:se,size:se-si}); sp=si+1; }
  var ms = scripts.sort((a,b)=>b.size-a.size)[0];
  var js = html.substring(ms.s, ms.e);
  var lines = js.split('\n');
  console.log('First 20 lines:');
  for (var i=0;i<20;i++) console.log('['+i+']: '+lines[i]);
  
  try { new vm.Script('"use strict";\n'+js); console.log('\nCLEAN!'); }
  catch(e) { console.log('\nERROR:', e.message); }
}
main().catch(console.error);
