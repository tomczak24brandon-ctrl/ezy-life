const fs = require('fs');
let txt = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', 'utf8');

// ── 1. Update checkbox onclick to pass `this` (the checkbox element) ──────────
txt = txt.replace(
  `+'<input type="checkbox" class="kcard-done-chk" title="Mark goal complete" '+(isDone?'checked':'')+' onclick="event.stopPropagation();kcardComplete('+g.id+')" />'`,
  `+'<input type="checkbox" class="kcard-done-chk" title="Mark goal complete" '+(isDone?'checked':'')+' onclick="event.stopPropagation();kcardComplete('+g.id+',this)" />'`
);

// ── 2. Replace kcardComplete with snapshot/restore logic ──────────────────────
const oldFn = `function kcardComplete(gid) {
  var g = goals.find(function(x){ return x.id === gid; });
  if (!g) return;
  // Mark all steps done
  if (g.steps && g.steps.length > 0) {
    g.steps.forEach(function(s){ s.done = true; });
  }
  // Set progress to 100 and archive
  g.progress = 100;
  g.completedAt = Date.now();
  saveData();
  renderKanban();
  renderGoalsDashboard();
}`;

const newFn = `function kcardComplete(gid, chk) {
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
  } else {
    // Restore previous step states
    if (g.steps && g.steps.length > 0) {
      if (g.previousTaskStates && g.previousTaskStates.length === g.steps.length) {
        g.steps.forEach(function(s, i){ s.done = g.previousTaskStates[i]; });
      } else {
        // Fallback: all incomplete
        g.steps.forEach(function(s){ s.done = false; });
      }
      g.previousTaskStates = undefined;
    }
    // Recalculate progress from restored steps
    if (g.steps && g.steps.length > 0) {
      var done = g.steps.filter(function(s){ return s.done; }).length;
      g.progress = Math.round((done / g.steps.length) * 100);
    } else {
      g.progress = 0;
    }
    g.completedAt = undefined;
  }
  saveData();
  renderKanban();
  renderGoalsDashboard();
}`;

if (!txt.includes(oldFn)) {
  console.error('kcardComplete old text not found!');
  process.exit(1);
}
txt = txt.replace(oldFn, newFn);

// ── Verify ────────────────────────────────────────────────────────────────────
const qq = (txt.match(/\?\?/g)||[]).length;
console.log('?? count:', qq);
console.log('Has previousTaskStates:', txt.includes('previousTaskStates'));
console.log('Has restore logic:', txt.includes('Restore previous step states'));
console.log('Has kcardComplete(gid, chk):', txt.includes('function kcardComplete(gid, chk)'));
console.log('Has \uD83C\uDFAF:', txt.includes('\uD83C\uDFAF'));
console.log('Has \u2190 Back:', txt.includes('\u2190 Back'));
console.log('Size:', Buffer.byteLength(txt,'utf8'), 'bytes');

fs.writeFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', txt, {encoding:'utf8'});
console.log('Saved.');
