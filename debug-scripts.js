const fs = require('fs');
const vm = require('vm');
const html = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');

var scripts = [], sp = 0;
while (true) {
  var si = html.indexOf('<script>', sp); if (si === -1) break;
  var se = html.indexOf('</script>', si);
  var content = html.substring(si+8, se);
  scripts.push({s:si+8, e:se, size:se-si, preview:content.substring(0,80)});
  sp = si+1;
}
console.log('Scripts found:', scripts.length);
scripts.forEach(function(s,i){ console.log('Script #'+(i+1)+' size='+s.size+': '+s.preview); });

// Check each
scripts.forEach(function(s,i){
  var js = html.substring(s.s, s.e);
  try { new vm.Script('"use strict";\n'+js); console.log('Script #'+(i+1)+': CLEAN'); }
  catch(e) { console.log('Script #'+(i+1)+': ERROR: '+e.message); }
});
