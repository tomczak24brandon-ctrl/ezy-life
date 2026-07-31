const fs = require('fs');
const t = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', 'utf8');

// Check the main layout structure around main-content and page-timeblocking
const layoutIdx = t.indexOf('id="main-content"');
console.log('=== main-content area ===');
console.log(t.substring(layoutIdx - 200, layoutIdx + 400));

// Check the showPage mc visibility logic
const spIdx = t.indexOf('function showPage');
const spBlock = t.substring(spIdx, spIdx + 2500);
const mcIdx = spBlock.indexOf('mc.style');
console.log('\n=== showPage mc visibility ===');
console.log(spBlock.substring(mcIdx - 50, mcIdx + 200));

// Check if there's a goals-carousel or kanban-outer inside main-content area HTML
const mcHtmlIdx = t.indexOf('<div id="main-content"');
const pagesEndIdx = t.indexOf('<!-- TIME BLOCKING');
console.log('\n=== HTML between main-content and TIME BLOCKING ===');
console.log('main-content HTML start:', mcHtmlIdx, '  timeblocking start:', pagesEndIdx);
// Look for goals-specific HTML inside main-content
const mcBlock = t.substring(mcHtmlIdx, pagesEndIdx);
console.log('Has goals-carousel:', mcBlock.includes('goals-carousel'));
console.log('Has kanban-outer:', mcBlock.includes('kanban-outer'));
console.log('Has page-goals:', mcBlock.includes('page-goals'));
