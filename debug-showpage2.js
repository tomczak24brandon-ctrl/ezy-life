const https = require('https');
const vm = require('vm');
const token = 'vcp_0kEtvmApVQ4IWxG6Ko3BIAQTMF8GR6SgOhvGkerAZAQ30CRmlt3NYTs6';
const teamId = 'team_IGUGbCcmmIqBqrQz0zpvu1Zz';
function get(url, h) { return new Promise((res,rej)=>{https.get(url,{headers:h},r=>{const c=[];r.on('data',d=>c.push(d));r.on('end',()=>res(Buffer.concat(c)));}).on('error',rej);}); }

function checkSyntax(html) {
  var scripts = [], sp = 0;
  while (true) { var si = html.indexOf('<script>', sp); if (si === -1) break; var se = html.indexOf('</script>', si); scripts.push({s:si+8,e:se,size:se-si}); sp = si+1; }
  var ms = scripts.sort(function(a,b){return b.size-a.size;})[0];
  var js = html.substring(ms.s, ms.e);
  try { new vm.Script('"use strict";\n' + js); return 'CLEAN'; }
  catch(e) { return 'ERROR: '+e.message; }
}

async function main() {
  const fr = await get('https://api.vercel.com/v7/deployments/dpl_AYcCTWpNBuigC8YxdcbWXTyp2uZK/files/8aa2b40d2879087b06f50b9de16c7b1f6632f514?teamId='+teamId, { Authorization: 'Bearer '+token });
  let html = Buffer.from(JSON.parse(fr.toString()).data,'base64').toString('utf8');
  function p(from,to){if(html.includes(from)){html=html.split(from).join(to);return true;}return false;}

  // All patches from final-deploy2
  p("pass: 'Gordon24@'","pass: 'Gordon2448@@@'");
  var cbS=html.indexOf('<div class="captcha-box">');if(cbS!==-1){var cbE=html.indexOf('</div>',cbS)+6;html=html.slice(0,cbS)+html.slice(cbE);}
  p("  var ans  = parseInt(document.getElementById('captcha-a').value, 10);\n  var err  = document.getElementById('login-err');\n  if (user === CREDS.user.toLowerCase() && pass === CREDS.pass && !isNaN(ans) && ans === _captchaAns) {","  var err  = document.getElementById('login-err');\n  if (user.toLowerCase() === CREDS.user.toLowerCase() && pass === CREDS.pass) {");
  p('var _captchaAns = 0;\n','');
  var rfS=html.indexOf('function refreshCaptcha()');if(rfS!==-1){var rfE=html.indexOf('\n}',rfS)+2;html=html.slice(0,rfS)+html.slice(rfE+1);}
  p("refreshCaptcha();\n\n// ===== REMEMBER ME =====\n(function loadSaved(){\n  var saved = localStorage.getItem('ezy_saved_creds');\n  if (saved) {\n    try {\n      var c = JSON.parse(atob(saved));\n      var u = document.getElementById('l-user'), p = document.getElementById('l-pass');\n      if (u && c.u) u.value = c.u;\n      if (p && c.p) p.value = c.p;\n      document.getElementById('remember-me').checked = true;\n    } catch(e){}\n  }\n})()",
   "// ===== REMEMBER ME =====\nfunction loadSaved(){\n  var saved = localStorage.getItem('ezy_saved_creds');\n  if (saved) {\n    try {\n      var c = JSON.parse(atob(saved));\n      var u = document.getElementById('l-user'), pw = document.getElementById('l-pass');\n      if (u && c.u) u.value = c.u.toLowerCase();\n      if (pw && c.p) pw.value = c.p;\n      document.getElementById('remember-me').checked = true;\n    } catch(e){}\n  }\n}\nloadSaved()");
  p("    refreshCaptcha();\n  }\n}\ndocument.addEventListener('keydown'","  }\n}\ndocument.addEventListener('keydown'");
  p('Incorrect email, password, or security answer.','Incorrect email or password.');
  p('<meta charset="UTF-8">','<meta charset="UTF-8"><meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">');
  p("alert('DEBUG: group not found for id=' + groupId); return; }","return; }");
  p("alert('DEBUG: going to ' + group.items[0].id); showPage(group.items[0].id); return; }","showPage(group.items[0].id); return; }");
  p("alert('DEBUG: showing submenu for ' + groupId + ' with ' + group.items.length + ' items');","");
  console.log('After base:', checkSyntax(html));

  // How many times does 'function showPage(id) {' appear?
  var count=0,pos=0;
  while(true){var i=html.indexOf('function showPage(id) {',pos);if(i===-1)break;count++;pos=i+1;}
  console.log('showPage occurrences:', count);

  // Apply showPage patch
  p('function showPage(id) {',"function showPage(id) {\n  var sb=document.getElementById('sidebar');if(sb&&sb.classList.contains('open')){sb.classList.remove('open');var ov=document.getElementById('sidebar-overlay');if(ov)ov.style.display='none';}");
  console.log('After showPage:', checkSyntax(html));

  // Check if showPage appears in script
  var scripts=[],sp=0;
  while(true){var si=html.indexOf('<script>',sp);if(si===-1)break;var se=html.indexOf('</script>',si);scripts.push({s:si+8,e:se,size:se-si});sp=si+1;}
  var ms=scripts.sort((a,b)=>b.size-a.size)[0];
  var js=html.substring(ms.s,ms.e);
  var spIdx=js.indexOf("function showPage(id) {");
  if(spIdx!==-1) console.log('showPage in main script at JS line:', js.substring(0,spIdx).split('\n').length);
}
main().catch(console.error);
