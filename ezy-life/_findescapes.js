var fs = require('fs');
var html = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html','utf8');
var vm = require('vm');
var pos = 0, count = 0, block3src = '';
while (true) {
  var i = html.indexOf('<script>', pos);
  if (i < 0) break;
  var end = html.indexOf('</script>', i);
  count++;
  if (count === 3) { block3src = html.slice(i+8, end); break; }
  pos = end + 1;
}

// Find all lines with backslash sequences
var lines = block3src.split('\n');
lines.forEach(function(l, i) {
  if (l.indexOf('\\') >= 0) {
    console.log(i + ': ' + l.trim());
  }
});
