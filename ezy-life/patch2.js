const fs = require('fs');
let c = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', 'utf8');
const orig = c.length;

function rep(label, oldStr, newStr) {
  if (c.includes(oldStr)) {
    c = c.split(oldStr).join(newStr);
    console.log(label + ': OK');
  } else {
    console.log(label + ': NOT FOUND');
    const key = oldStr.slice(0, 50);
    const idx = c.indexOf(key);
    if (idx >= 0) {
      console.log('  partial at ' + idx + ': ' + JSON.stringify(c.slice(idx, idx+150)));
    }
  }
}

const CR = '\r\n';
const B = '\r\n\r\n';

// Patch renderSidebar to support externalUrl items (the second/active definition)
rep('7. renderSidebar nav-item',
  "        html += '<div class=\"nav-item\" id=\"nav-'+item.id+'\" onclick=\"showPage(\\\''+item.id+'\\\')\"><span class=\"icon\">'+item.icon+'</span>'+esc(item.label)+badge+'</div>';",
  "        if (item.externalUrl) {" + CR +
  "          html += '<a class=\"nav-item\" id=\"nav-'+item.id+'\" href=\"'+item.externalUrl+'\" target=\"'+(item.target||'_blank')+'\" style=\"text-decoration:none;color:inherit\"><span class=\"icon\">'+item.icon+'</span>'+esc(item.label)+'</a>';" + CR +
  "        } else {" + CR +
  "          html += '<div class=\"nav-item\" id=\"nav-'+item.id+'\" onclick=\"showPage(\\\''+item.id+'\\\')\"><span class=\"icon\">'+item.icon+'</span>'+esc(item.label)+badge+'</div>';" + CR +
  "        }"
);

console.log('Length:', orig, '->', c.length);
fs.writeFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', c, 'utf8');
console.log('Written.');
