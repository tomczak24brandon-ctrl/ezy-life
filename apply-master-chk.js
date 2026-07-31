const fs = require('fs');
let txt = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', 'utf8');

// ── 1. Add CSS for master checkbox ──────────────────────────────────────────
const chkCss = `
.kcard-done-chk { width:1.4em; height:1.4em; accent-color:var(--green); cursor:pointer; flex-shrink:0; margin-left:4px; vertical-align:middle; }
`;
txt = txt.replace(
  '.kcard-chevron:hover { color:var(--accent); }',
  '.kcard-chevron:hover { color:var(--accent); }' + chkCss
);

// ── 2. Update buildKCard — add master checkbox next to chevron ───────────────
const oldBuild = `function buildKCard(g) {
  var dateStr = g.targetDate ? '<div class="kcard-date">\\uD83D\\uDCC5 '+fmtDate(g.targetDate)+'</div>' : '';
  var chevronId = 'kchev-'+g.id;
  var stepsId = 'kcs-'+g.id;
  return '<div class="kanban-card" draggable="true" data-gid="'+g.id+'" ondragstart="kbDragStart(event,'+g.id+')" ondragover="kbCardDragOver(event)" ondrop="kbCardDrop(event,'+g.id+')" ondragleave="kbCardDragLeave(event)" onclick="if(!event.target.closest(\\'.kcard-steps\\')&&!event.target.closest(\\'.kcard-chevron\\'))openGoalDetail('+g.id+')">'
    +'<div class="kcard-title">'+esc(g.title)
      +'<button class="kcard-chevron" id="'+chevronId+'" onclick="event.stopPropagation();kcardToggle(\\'' + g.id + '\\')" title="Expand/collapse tasks">▼</button>'
    +'</div>'
    +'<div class="kcard-bar"><div class="kcard-fill" id="kcs-bar-'+g.id+'" style="width:'+g.progress+'%"></div></div>'
    +'<div class="kcard-meta"><span class="kcard-pct" id="kcs-pct-'+g.id+'">'+g.progress+'%</span>'+dateStr+'</div>'
    +'<div class="kcard-steps" id="'+stepsId+'"></div>'
    +'</div>';
}`;

const newBuild = `function buildKCard(g) {
  var dateStr = g.targetDate ? '<div class="kcard-date">\\uD83D\\uDCC5 '+fmtDate(g.targetDate)+'</div>' : '';
  var chevronId = 'kchev-'+g.id;
  var stepsId = 'kcs-'+g.id;
  var isDone = g.progress >= 100;
  return '<div class="kanban-card" draggable="true" data-gid="'+g.id+'" ondragstart="kbDragStart(event,'+g.id+')" ondragover="kbCardDragOver(event)" ondrop="kbCardDrop(event,'+g.id+')" ondragleave="kbCardDragLeave(event)" onclick="if(!event.target.closest(\\'.kcard-steps\\')&&!event.target.closest(\\'.kcard-chevron\\')&&!event.target.closest(\\'.kcard-done-chk\\'))openGoalDetail('+g.id+')">'
    +'<div class="kcard-title" style="display:flex;align-items:center;gap:4px">'
    +'<span style="flex:1;min-width:0">'+esc(g.title)+'</span>'
    +'<input type="checkbox" class="kcard-done-chk" title="Mark goal complete" '+(isDone?'checked':'')+' onclick="event.stopPropagation();kcardComplete('+g.id+')" />'
    +'<button class="kcard-chevron" id="'+chevronId+'" onclick="event.stopPropagation();kcardToggle(\\'' + g.id + '\\')" title="Expand/collapse tasks">▼</button>'
    +'</div>'
    +'<div class="kcard-bar"><div class="kcard-fill" id="kcs-bar-'+g.id+'" style="width:'+g.progress+'%"></div></div>'
    +'<div class="kcard-meta"><span class="kcard-pct" id="kcs-pct-'+g.id+'">'+g.progress+'%</span>'+dateStr+'</div>'
    +'<div class="kcard-steps" id="'+stepsId+'"></div>'
    +'</div>';
}`;

if (!txt.includes(oldBuild)) {
  console.error('buildKCard old text not found!');
  process.exit(1);
}
txt = txt.replace(oldBuild, newBuild);

// ── 3. Add kcardComplete function after kcardToggle ─────────────────────────
const newFn = `
function kcardComplete(gid) {
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
}
`;

txt = txt.replace(
  'function kcardToggle(gid) {',
  newFn + 'function kcardToggle(gid) {'
);

// ── Verify ───────────────────────────────────────────────────────────────────
const qq = (txt.match(/\?\?/g)||[]).length;
console.log('?? count:', qq);
console.log('Has kcardComplete:', txt.includes('function kcardComplete'));
console.log('Has kcard-done-chk CSS:', txt.includes('kcard-done-chk'));
console.log('Has \uD83C\uDFAF:', txt.includes('\uD83C\uDFAF'));
console.log('Has \u2190 Back:', txt.includes('\u2190 Back'));
console.log('Size:', Buffer.byteLength(txt,'utf8'), 'bytes');

fs.writeFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', txt, {encoding:'utf8'});
console.log('Saved.');
