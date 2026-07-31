const fs = require('fs');
let txt = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', 'utf8');

// Fix: filter out completed goals from the All Goals kanban board
// Line 2461: var catGoals = goals.filter(function(g){ return g.catId === cat.id; });
// Must exclude goals at 100% / with completedAt

const oldFilter = `    var catGoals = goals.filter(function(g){ return g.catId === cat.id; });`;
const newFilter = `    var catGoals = goals.filter(function(g){ return g.catId === cat.id && !(g.progress >= 100 && g.completedAt); });`;

if (!txt.includes(oldFilter)) {
  console.error('Target line not found!');
  // Show what's around line 2461
  const lines = txt.split('\n');
  for (let i = 2459; i <= 2463; i++) console.log((i+1)+':', JSON.stringify(lines[i]));
  process.exit(1);
}

txt = txt.replace(oldFilter, newFilter);

const qq = (txt.match(/\?\?/g)||[]).length;
console.log('?? count:', qq);
console.log('Filter applied:', txt.includes('!(g.progress >= 100 && g.completedAt)'));
console.log('Has \uD83C\uDFAF:', txt.includes('\uD83C\uDFAF'));
console.log('Has \u2190 Back:', txt.includes('\u2190 Back'));
console.log('Size:', Buffer.byteLength(txt,'utf8'), 'bytes');

fs.writeFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', txt, {encoding:'utf8'});
console.log('Saved.');
