const fs = require('fs');
let txt = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', 'utf8');

const oldFn = `function kcardComplete(gid, chk) {
  var g = goals.find(function(x){ return x.id === gid; });
  if (!g) return;
  var checking = chk ? chk.checked : !(g.progress >= 100 && g.completedAt);
  if (checking) {
    // Save snapshot of current step states before overwriting
    if (g.steps && g.steps.length > 0) {
      g.previousTaskStates = g.steps.map(function(s){ return !!s.done; });
      g.steps.forEach(function(s){ s.done = true; });
    }
    g.progress = 100;
    g.completedAt = Date.now();
  } else {`;

const newFn = `function kcardComplete(gid, chk) {
  var g = goals.find(function(x){ return x.id === gid; });
  if (!g) return;
  var checking = chk ? chk.checked : !(g.progress >= 100 && g.completedAt);
  if (checking) {
    // Confirm before archiving
    var ok = confirm('Mark "' + g.title + '" as 100% complete and move it to Completed Goals?');
    if (!ok) {
      // Revert checkbox to unchecked state without doing anything
      if (chk) chk.checked = false;
      return;
    }
    // Save snapshot of current step states before overwriting
    if (g.steps && g.steps.length > 0) {
      g.previousTaskStates = g.steps.map(function(s){ return !!s.done; });
      g.steps.forEach(function(s){ s.done = true; });
    }
    g.progress = 100;
    g.completedAt = Date.now();
  } else {`;

if (!txt.includes(oldFn)) {
  console.error('Target not found!');
  process.exit(1);
}

txt = txt.replace(oldFn, newFn);

const qq = (txt.match(/\?\?/g)||[]).length;
console.log('?? count:', qq);
console.log('Has confirm():', txt.includes("confirm('Mark"));
console.log('Has chk.checked = false:', txt.includes('chk.checked = false'));
console.log('Has previousTaskStates:', txt.includes('previousTaskStates'));
console.log('Has \uD83C\uDFAF:', txt.includes('\uD83C\uDFAF'));
console.log('Has \u2190 Back:', txt.includes('\u2190 Back'));
console.log('Size:', Buffer.byteLength(txt,'utf8'), 'bytes');

fs.writeFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', txt, {encoding:'utf8'});
console.log('Saved.');
