const fs = require('fs');
let txt = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', 'utf8');

// ── 1. Rename tab text ──────────────────────────────────────────────────────
txt = txt.replace(
  '>📋 All Categories<',
  '>📋 All Goals<'
);

// ── 2. Add CSS for chevron toggle ───────────────────────────────────────────
const chevronCss = `
.kcard-chevron { float:right; background:none; border:none; cursor:pointer; font-size:13px; color:var(--text3); padding:0 0 0 6px; line-height:1; transition:color .15s; }
.kcard-chevron:hover { color:var(--accent); }
.kcard-steps.collapsed { display:none; }
`;
txt = txt.replace(
  '.kcard-steps { margin-top:8px; border-top:1px solid var(--border); padding-top:6px; }',
  '.kcard-steps { margin-top:8px; border-top:1px solid var(--border); padding-top:6px; }' + chevronCss
);

// ── 3. Update buildKCard to include chevron toggle ──────────────────────────
// The chevron only appears on the All Goals (panel 1 / kanban) cards.
// buildKCard is ONLY called from renderKanban (panel 1). The Active Goals
// dashboard (panel 0) uses renderGoalsDashboard — completely separate.
txt = txt.replace(
  `function buildKCard(g) {
  var dateStr = g.targetDate ? '<div class="kcard-date">\\uD83D\\uDCC5 '+fmtDate(g.targetDate)+'</div>' : '';
  return '<div class="kanban-card" draggable="true" data-gid="'+g.id+'" ondragstart="kbDragStart(event,'+g.id+')" ondragover="kbCardDragOver(event)" ondrop="kbCardDrop(event,'+g.id+')" ondragleave="kbCardDragLeave(event)" onclick="if(!event.target.closest(\\'.kcard-steps\\'))openGoalDetail('+g.id+')">'
    +'<div class="kcard-title">'+esc(g.title)+'</div>'
    +'<div class="kcard-bar"><div class="kcard-fill" id="kcs-bar-'+g.id+'" style="width:'+g.progress+'%"></div></div>'
    +'<div class="kcard-meta"><span class="kcard-pct" id="kcs-pct-'+g.id+'">'+g.progress+'%</span>'+dateStr+'</div>'
    +'<div class="kcard-steps" id="kcs-'+g.id+'"></div>'
    +'</div>';
}`,
  `function buildKCard(g) {
  var dateStr = g.targetDate ? '<div class="kcard-date">\\uD83D\\uDCC5 '+fmtDate(g.targetDate)+'</div>' : '';
  var chevronId = 'kchev-'+g.id;
  var stepsId = 'kcs-'+g.id;
  return '<div class="kanban-card" draggable="true" data-gid="'+g.id+'" ondragstart="kbDragStart(event,'+g.id+')" ondragover="kbCardDragOver(event)" ondrop="kbCardDrop(event,'+g.id+')" ondragleave="kbCardDragLeave(event)" onclick="if(!event.target.closest(\\'.kcard-steps\\')&&!event.target.closest(\\'.kcard-chevron\\'))openGoalDetail('+g.id+')">'
    +'<div class="kcard-title">'+esc(g.title)
      +'<button class="kcard-chevron" id="'+chevronId+'" onclick="event.stopPropagation();kcardToggle(\\'' + g.id + '\\')" title="Expand/collapse tasks">\u25BC</button>'
    +'</div>'
    +'<div class="kcard-bar"><div class="kcard-fill" id="kcs-bar-'+g.id+'" style="width:'+g.progress+'%"></div></div>'
    +'<div class="kcard-meta"><span class="kcard-pct" id="kcs-pct-'+g.id+'">'+g.progress+'%</span>'+dateStr+'</div>'
    +'<div class="kcard-steps" id="'+stepsId+'"></div>'
    +'</div>';
}`
);

// ── 4. Add kcardToggle function right after buildKCard ──────────────────────
txt = txt.replace(
  'function renderKCardSteps(gid) {',
  `function kcardToggle(gid) {
  var steps = document.getElementById('kcs-' + gid);
  var chev  = document.getElementById('kchev-' + gid);
  if (!steps) return;
  var collapsed = steps.classList.toggle('collapsed');
  if (chev) chev.textContent = collapsed ? '\u25B6' : '\u25BC';
}
function renderKCardSteps(gid) {`
);

// ── 5. Verify ───────────────────────────────────────────────────────────────
const qqCount = (txt.match(/\?\?/g) || []).length;
console.log('?? count:', qqCount);
console.log('Tab renamed:', txt.includes('>📋 All Goals<'));
console.log('Has kcardToggle:', txt.includes('function kcardToggle'));
console.log('Has kcard-chevron CSS:', txt.includes('kcard-chevron'));
console.log('Has 🎯:', txt.includes('\uD83C\uDFAF'));
console.log('Has 🏠:', txt.includes('\uD83C\uDFE0'));
console.log('Size:', Buffer.byteLength(txt, 'utf8'), 'bytes');

fs.writeFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', txt, { encoding: 'utf8' });
console.log('Saved.');
