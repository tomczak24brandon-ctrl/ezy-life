const https = require('https');
const vm = require('vm');
const token = 'vcp_0kEtvmApVQ4IWxG6Ko3BIAQTMF8GR6SgOhvGkerAZAQ30CRmlt3NYTs6';
const teamId = 'team_IGUGbCcmmIqBqrQz0zpvu1Zz';
function get(url, h) { return new Promise((res,rej)=>{https.get(url,{headers:h},r=>{const c=[];r.on('data',d=>c.push(d));r.on('end',()=>res(Buffer.concat(c)));}).on('error',rej);}); }

function checkSyntax(html) {
  var scripts = [], sp = 0;
  while (true) { var si = html.indexOf('<script>',sp); if(si===-1)break; var se=html.indexOf('</script>',si); scripts.push({s:si+8,e:se,size:se-si}); sp=si+1; }
  var ms = scripts.sort((a,b)=>b.size-a.size)[0];
  var js = html.substring(ms.s, ms.e);
  try { new vm.Script('"use strict";\n'+js); return null; }
  catch(e) { return e.message; }
}

async function main() {
  const fr = await get('https://api.vercel.com/v7/deployments/dpl_AYcCTWpNBuigC8YxdcbWXTyp2uZK/files/8aa2b40d2879087b06f50b9de16c7b1f6632f514?teamId='+teamId, { Authorization: 'Bearer '+token });
  let html = Buffer.from(JSON.parse(fr.toString()).data,'base64').toString('utf8');
  function p(from,to) { if(html.includes(from)){html=html.split(from).join(to);return true;} return false; }

  // Base patches
  p("pass: 'Gordon24@'","pass: 'Gordon2448@@@'");
  var cbS=html.indexOf('<div class="captcha-box">'); if(cbS!==-1){var cbE=html.indexOf('</div>',cbS)+6;html=html.slice(0,cbS)+html.slice(cbE);}
  p("  var ans  = parseInt(document.getElementById('captcha-a').value, 10);\n  var err  = document.getElementById('login-err');\n  if (user === CREDS.user.toLowerCase() && pass === CREDS.pass && !isNaN(ans) && ans === _captchaAns) {","  var err  = document.getElementById('login-err');\n  if (user.toLowerCase() === CREDS.user.toLowerCase() && pass === CREDS.pass) {");
  p('var _captchaAns = 0;\n','');
  var rfS=html.indexOf('function refreshCaptcha()'); if(rfS!==-1){var rfE=html.indexOf('\n}',rfS)+2;html=html.slice(0,rfS)+html.slice(rfE+1);}
  p('refreshCaptcha();\n\n// ===== REMEMBER ME =====','// ===== REMEMBER ME =====');
  p("(function loadSaved(){\n  var saved = localStorage.getItem('ezy_saved_creds');\n  if (saved) {\n    try {\n      var c = JSON.parse(atob(saved));\n      var u = document.getElementById('l-user'), p = document.getElementById('l-pass');\n      if (u && c.u) u.value = c.u;\n      if (p && c.p) p.value = c.p;\n      document.getElementById('remember-me').checked = true;\n    } catch(e){}\n  }\n})()",
   "function loadSaved(){\n  var saved = localStorage.getItem('ezy_saved_creds');\n  if (saved) {\n    try {\n      var c = JSON.parse(atob(saved));\n      var u = document.getElementById('l-user'), p2 = document.getElementById('l-pass');\n      if (u && c.u) u.value = c.u.toLowerCase();\n      if (p2 && c.p) p2.value = c.p;\n      document.getElementById('remember-me').checked = true;\n    } catch(e){}\n  }\n}\nloadSaved()");
  p("    refreshCaptcha();\n  }\n}\ndocument.addEventListener('keydown'","  }\n}\ndocument.addEventListener('keydown'");
  p('Incorrect email, password, or security answer.','Incorrect email or password.');
  p('<meta charset="UTF-8">','<meta charset="UTF-8"><meta http-equiv="Cache-Control" content="no-cache">');
  p("alert('DEBUG: group not found for id=' + groupId); return; }","return; }");
  p("alert('DEBUG: going to ' + group.items[0].id); showPage(group.items[0].id); return; }","showPage(group.items[0].id); return; }");
  p("alert('DEBUG: showing submenu for ' + groupId + ' with ' + group.items.length + ' items');","");
  console.log('After base patches:', checkSyntax(html) || 'CLEAN');

  // Fin tabs
  var tS=html.indexOf('<!-- Personal / Business tabs -->');
  if(tS!==-1){
    var cS=html.indexOf('<div style="display:flex;gap:0;margin-bottom:20px',tS),depth=0,pos=cS;
    while(pos<html.length){var open=html.indexOf('<div',pos),close=html.indexOf('</div>',pos);if(close===-1)break;if(open!==-1&&open<close){depth++;pos=open+4;}else{depth--;pos=close+6;if(depth===0)break;}}
    var nt='<!-- Financials tabs -->\n        <div style="display:flex;gap:0;margin-bottom:20px;border-bottom:2px solid var(--border)">\n          <div id="fin-tab-personal" class="biz-tab active" onclick="setFinTab(\'personal\')" style="font-size:13px;font-weight:800;padding:10px 16px">Personal</div>\n          <div id="fin-tab-ietc" class="biz-tab" onclick="setFinTab(\'ietc\')" style="font-size:13px;font-weight:800;padding:10px 16px">Iron Eagle</div>\n          <div id="fin-tab-bn1" class="biz-tab" onclick="setFinTab(\'bn1\')" style="font-size:13px;font-weight:800;padding:10px 16px">B&amp;N #1</div>\n          <div id="fin-tab-bn2" class="biz-tab" onclick="setFinTab(\'bn2\')" style="font-size:13px;font-weight:800;padding:10px 16px">B&amp;N #2</div>\n        </div>';
    html=html.slice(0,tS)+nt+html.slice(pos);
  }
  console.log('After fin tabs:', checkSyntax(html) || 'CLEAN');

  // setFinTab
  var sfS=html.indexOf('function setFinTab(tab)');
  if(sfS!==-1){var sfE=html.indexOf('\n}',sfS)+2;html=html.slice(0,sfS)+"function setFinTab(tab) {\n  _currentFinTab = tab;\n  _currentFinAccountId = null;\n  ['personal','ietc','bn1','bn2'].forEach(function(t) {\n    var el = document.getElementById('fin-tab-' + t);\n    if (el) el.classList.toggle('active', t === tab);\n  });\n  renderFinPage();\n}"+html.slice(sfE);}
  console.log('After setFinTab:', checkSyntax(html) || 'CLEAN');

  // modal
  if(!html.includes('id="modal-addfin"')){var m='\n<div class="modal-overlay" id="modal-addfin" style="display:none"><div class="modal"><button class="close-btn" onclick="closeModal(\'addfin\')">X</button><h2>Add Account</h2><div class="form-group"><label>Account Name</label><input class="form-input" id="fin-acct-name" placeholder="e.g. Chase Checking"></div><div class="form-group"><label>Account Type</label><select class="form-input" id="fin-acct-type"><option value="checking">Checking</option><option value="savings">Savings</option><option value="credit">Credit Card</option></select></div><button class="btn-primary" onclick="saveFinAccount()">Save Account</button></div></div>\n';html=html.replace('</body>',m+'</body>');}
  console.log('After modal:', checkSyntax(html) || 'CLEAN');

  // showPage
  p('function showPage(id) {',"function showPage(id) {\n  var sb=document.getElementById('sidebar');if(sb&&sb.classList.contains('open')){sb.classList.remove('open');var ov=document.getElementById('sidebar-overlay');if(ov)ov.style.display='none';}");
  console.log('After showPage:', checkSyntax(html) || 'CLEAN');
}
main().catch(console.error);
