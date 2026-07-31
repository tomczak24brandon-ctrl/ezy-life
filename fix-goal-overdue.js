const fs = require('fs');
let txt = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', 'utf8');

// ── 1. Fix "Save Goal ?" button corruption ────────────────────────────────────
if (!txt.includes('<button class="btn btn-primary" onclick="saveGoal()">Save Goal ')) {
  console.log('Save Goal button not found with expected text — checking raw...');
}
// Replace whatever is in Save Goal button with clean text
txt = txt.replace(
  /(<button class="btn btn-primary" onclick="saveGoal\(\)">Save Goal\s*)[^<]*/,
  '$1'
);
// Ensure it ends with </button>
txt = txt.replace(
  /(<button class="btn btn-primary" onclick="saveGoal\(\)">Save Goal)(\s*<\/button>)/,
  '$1$2'
);

// ── 2. Add getOverdueGoals() after getOverdueSteps() ─────────────────────────
const anchorFn = 'function renderKCardSteps(gid)';
if (!txt.includes(anchorFn)) {
  console.error('Anchor function not found!'); process.exit(1);
}

const newFn = `function getOverdueGoals() {
  var result = [];
  var today = new Date(); today.setHours(0,0,0,0);
  (goals||[]).forEach(function(g) {
    if (!g.targetDate) return;
    if (g.progress >= 100 && g.completedAt) return; // already complete
    var d = new Date(g.targetDate + 'T00:00:00');
    if (d < today) result.push({ id: g.id, title: g.title, targetDate: g.targetDate, daysLate: Math.floor((today - d) / 86400000), progress: g.progress });
  });
  return result;
}
`;

txt = txt.replace(anchorFn, newFn + anchorFn);

// ── 3. Expand the banner in renderGCal() to include goal-level overdue ────────
const oldBanner = `  // Overdue goal-task banner
  var banner = document.getElementById('gcal-overdue-banner');
  if (banner) {
    var ov = getOverdueSteps();
    if (ov.length > 0) {
      banner.style.display = 'block';
      banner.innerHTML = '<span style="font-weight:700;color:var(--red)">&#9888; ' + ov.length + ' overdue goal task' + (ov.length>1?'s':'') + ':</span> '
        + ov.slice(0,3).map(function(x){ return esc(x.stepText) + ' <span style="color:var(--text3)">(' + esc(x.goalTitle) + ', ' + x.daysLate + 'd late)</span>'; }).join(' &bull; ')
        + (ov.length > 3 ? ' &bull; <span style="color:var(--text3)">+' + (ov.length-3) + ' more</span>' : '');
    } else {
      banner.style.display = 'none';
    }
  }`;

const newBanner = `  // Overdue goal-task + goal-level banner
  var banner = document.getElementById('gcal-overdue-banner');
  if (banner) {
    var ov = getOverdueSteps();
    var og = getOverdueGoals();
    var parts = [];
    if (og.length > 0) {
      parts.push('<span style="font-weight:700;color:#ff9944">&#9888; ' + og.length + ' overdue goal' + (og.length>1?'s':'') + ':</span> '
        + og.slice(0,3).map(function(x){ return '<span style="color:#ff9944">' + esc(x.title) + '</span> <span style="color:var(--text3)">(' + x.daysLate + 'd overdue, ' + x.progress + '% done)</span>'; }).join(' &bull; ')
        + (og.length > 3 ? ' &bull; <span style="color:var(--text3)">+' + (og.length-3) + ' more</span>' : ''));
    }
    if (ov.length > 0) {
      parts.push('<span style="font-weight:700;color:var(--red)">&#9888; ' + ov.length + ' overdue sub-task' + (ov.length>1?'s':'') + ':</span> '
        + ov.slice(0,3).map(function(x){ return esc(x.stepText) + ' <span style="color:var(--text3)">(' + esc(x.goalTitle) + ', ' + x.daysLate + 'd late)</span>'; }).join(' &bull; ')
        + (ov.length > 3 ? ' &bull; <span style="color:var(--text3)">+' + (ov.length-3) + ' more</span>' : ''));
    }
    if (parts.length > 0) {
      banner.style.display = 'block';
      banner.innerHTML = parts.join('<br>');
    } else {
      banner.style.display = 'none';
    }
  }`;

if (!txt.includes(oldBanner)) {
  console.error('Banner block not found!'); process.exit(1);
}
txt = txt.replace(oldBanner, newBanner);

// ── Verify ────────────────────────────────────────────────────────────────────
const qq = (txt.match(/\?\?/g)||[]).length;
console.log('?? count:', qq);
console.log('getOverdueGoals present:', txt.includes('function getOverdueGoals'));
console.log('Banner expanded:', txt.includes('og.length > 0'));
console.log('Has emoji:', txt.includes('\uD83C\uDFAF'));
console.log('Has back arrow:', txt.includes('\u2190 Back'));
console.log('Size:', Buffer.byteLength(txt,'utf8'), 'bytes');

fs.writeFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', txt, {encoding:'utf8'});
console.log('Saved.');
