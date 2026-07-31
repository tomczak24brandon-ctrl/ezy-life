const fs = require('fs');
const t = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', 'utf8');

// Find window.onload or init() call
['window.onload', 'window.addEventListener(', 'function init(', 'doLogin', 'showMainApp', 'loadData'].forEach(kw => {
  const idx = t.indexOf(kw);
  if (idx >= 0) {
    console.log('=== '+kw+' at '+idx+' ===');
    console.log(t.substring(idx, idx + 300));
    console.log('');
  }
});
