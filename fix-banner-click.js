const fs = require('fs');
let txt = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', 'utf8');

// ── 1. Add CSS for overdue goal highlight flash ───────────────────────────────
const cssAnchor = '#page-timeblocking { flex:1; overflow:hidden; display:none; flex-direction:column; }';
if (!txt.includes(cssAnchor)) { console.error('CSS anchor not found'); process.exit(1); }

const flashCSS = `
/* Overdue goal highlight flash */
@keyframes overdue-flash {
  0%   { box-shadow:0 0 0 0 rgba(248,81,73,.8); }
  50%  { box-shadow:0 0 0 8px rgba(248,81,73,.3); }
  100% { box-shadow:0 0 0 0 rgba(248,81,73,0); }
}
.kanban-card.overdue-highlight {
  animation: overdue-flash .6s ease 3;
  border-color: var(--red) !important;
}
`;
txt = txt.replace(cssAnchor, flashCSS + cssAnchor);

// ── 2. Add goalsShowOverdue() navigation function ────────────────────────────
const navFnAnchor = 'function getOverdueGoals()';
if (!txt.includes(navFnAnchor)) { console.error('getOverdueGoals anchor not found'); process.exit(1); }

const navFn = `function goalsShowOverdue() {
  // Navigate to Goals page, All Goals tab (index 1)
  showPage('goals');
  goalsGoTab(1);
  // After render, scroll to first overdue goal card and flash it
  requestAnimationFrame(function() {
    var og = getOverdueGoals();
    if (!og.length) return;
    var firstId = og[0].id;
    var card = document.querySelector('.kanban-card[data-gid="' + firstId + '"]');
    if (card) {
      card.scrollIntoView({ behavior:'smooth', block:'center' });
      card.classList.add('overdue-highlight');
      setTimeout(function(){ card.classList.remove('overdue-highlight'); }, 2000);
    }
  });
}
`;
txt = txt.replace(navFnAnchor, navFn + navFnAnchor);

// ── 3. Make banner clickable in renderGCal() ─────────────────────────────────
// Find the banner element setup in renderGCal
const oldBannerSetup = `  if (banner) {
    var ov = getOverdueSteps();
    var og = getOverdueGoals();
    var parts = [];`;
const newBannerSetup = `  if (banner) {
    var ov = getOverdueSteps();
    var og = getOverdueGoals();
    var parts = [];`;

// We need to add click handler and cursor when banner is shown
// Find the line where banner.style.display = 'block' is set and innerHTML is assigned
const oldBannerShow = `    if (parts.length > 0) {
      banner.style.display = 'block';
      banner.innerHTML = parts.join('<br>');
    } else {
      banner.style.display = 'none';
    }`;

const newBannerShow = `    if (parts.length > 0) {
      banner.style.display = 'block';
      banner.style.cursor = 'pointer';
      banner.title = 'Click to view overdue goals';
      banner.onclick = goalsShowOverdue;
      banner.innerHTML = '<span style="float:right;opacity:.6;font-size:11px">View Goals →</span>' + parts.join('<br>');
    } else {
      banner.style.display = 'none';
      banner.onclick = null;
      banner.style.cursor = '';
    }`;

if (!txt.includes(oldBannerShow)) { console.error('Banner show block not found'); process.exit(1); }
txt = txt.replace(oldBannerShow, newBannerShow);

// ── Verify ────────────────────────────────────────────────────────────────────
const qq = (txt.match(/\?\?/g)||[]).length;
console.log('?? count:', qq);
console.log('Flash CSS added:', txt.includes('overdue-flash'));
console.log('goalsShowOverdue added:', txt.includes('function goalsShowOverdue'));
console.log('Banner onclick set:', txt.includes('banner.onclick = goalsShowOverdue'));
console.log('Has emoji:', txt.includes('\uD83C\uDFAF'));
console.log('Has back arrow:', txt.includes('\u2190 Back'));
console.log('Size:', Buffer.byteLength(txt,'utf8'), 'bytes');

fs.writeFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', txt, {encoding:'utf8'});
console.log('Saved.');
