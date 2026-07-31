const fs = require('fs');
const t = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', 'utf8');

// Get the full main-app structure to see sibling order
const appDiv = t.indexOf('<div id="main-app"');
// Find the content area wrapper
const contentArea = t.indexOf('class="content"', appDiv);
const contentEnd = t.indexOf('</div>', contentArea + 100);
console.log('=== content wrapper ===');
console.log(t.substring(contentArea - 50, contentArea + 200));

// Find all direct children of the content area
const afterSidebar = t.indexOf('<div class="m', appDiv + 200);
console.log('\n=== after sidebar ===');
console.log(t.substring(afterSidebar, afterSidebar + 500));

// Look for class="layout" CSS
const layoutCSS = t.match(/\.layout\s*\{[^}]+\}/g) || [];
console.log('\n=== .layout CSS ===');
layoutCSS.forEach(r => console.log(r));

// content area CSS
const contentCSS = t.match(/\.content\s*\{[^}]+\}/g) || [];
console.log('\n=== .content CSS ===');
contentCSS.forEach(r => console.log(r));
