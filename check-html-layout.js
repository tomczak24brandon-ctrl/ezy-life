const fs = require('fs');
const t = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', 'utf8');

// Get the wrapper area to check flex layout
const appDiv = t.indexOf('id="main-app"');
console.log('=== main-app div ===');
console.log(t.substring(appDiv - 10, appDiv + 400));

// Check if goals-carousel-wrap or kanban-outer has absolute/fixed positioning
const lines = t.split('\n');
lines.forEach((l, i) => {
  if (/goals-carousel|kanban-outer|goals-panel/.test(l) && /position.*absolute|position.*fixed|z-index.*[5-9]\d\d/i.test(l)) {
    console.log('POSITIONED: line '+(i+1)+': '+l.trim().substring(0,140));
  }
});

// Check CSS for goals-carousel/kanban-outer positioning
const cssGoals = t.match(/\.goals-carousel[\w-]*\s*\{[^}]+\}/g) || [];
console.log('\n=== goals-carousel CSS ===');
cssGoals.forEach(r => console.log(r.substring(0,200)));

const cssKanban = t.match(/\.kanban-outer\s*\{[^}]+\}/g) || [];
console.log('\n=== kanban-outer CSS ===');
cssKanban.forEach(r => console.log(r.substring(0,200)));
