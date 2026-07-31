const fs = require('fs');
const vm = require('vm');
const html = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');

// Find main script
var si = 0, scripts = [];
while(true){var s=html.indexOf('<script>',si);if(s===-1)break;var e=html.indexOf('</script>',s);scripts.push({s:s+8,e:e,size:e-s});si=s+1;}
var ms=scripts.sort((a,b)=>b.size-a.size)[0];
var js=html.substring(ms.s,ms.e);

// Binary search for error line
var lines=js.split('\n'),lo=0,hi=lines.length;
while(hi-lo>1){var mid=Math.floor((lo+hi)/2);try{new vm.Script('"use strict";\n'+lines.slice(0,mid).join('\n'));lo=mid;}catch(e){hi=mid;}}
console.log('Error around line',hi);
for(var x=Math.max(0,hi-10);x<Math.min(lines.length,hi+5);x++) console.log('['+x+']: '+lines[x]);
