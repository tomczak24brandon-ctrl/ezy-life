const fs = require('fs');
const t = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', 'utf8');

// Find the actual app entry point after login
const dli = t.indexOf('function doLogin');
console.log('=== doLogin ===');
console.log(t.substring(dli, dli + 800));

// Find showMainApp
const sma = t.indexOf('function showMainApp');
if (sma >= 0) {
  console.log('\n=== showMainApp ===');
  console.log(t.substring(sma, sma + 800));
}

// Find what page is shown first
const spi = t.indexOf("showPage('");
console.log('\n=== First showPage call ===');
console.log(t.substring(spi - 100, spi + 200));
