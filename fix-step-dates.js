const fs = require('fs');
let txt = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', 'utf8');

// ══════════════════════════════════════════════════════════════
// 1. CSS — step date input + overdue styles
// ══════════════════════════════════════════════════════════════
const newCss = `
.kcard-step-date { font-size:10px; border:none; background:none; color:var(--text3); cursor:pointer; padding:0 2px; flex-shrink:0; width:90px; outline:none; }
.kcard-step-date::-webkit-calendar-picker-indicator { filter:invert(0.5); cursor:pointer; }
.kcard-step-date.overdue { color:var(--red); font-weight:700; }
.gcal-overdue-strip { background:#3a1a1a; border-left:3px solid var(--red); border-radius:3px; font-size:10px; color:#ff6b6b; padding:2px 5px; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.gcal-overdue-badge { display:inline-block; background:var(--red); color:#fff; font-size:9px; font-weight:800; border-radius:99px; padding:1px 5px; margin-left:4px; vertical-align:middle; }
`;
txt = txt.replace(
  '.kcard-step-hdl { font-size:11px; color:var(--text3); cursor:grab; flex-shrink:0; padding:0 2px; }',
  '.kcard-step-hdl { font-size:11px; color:var(--text3); cursor:grab; flex-shrink:0; padding:0 2px; }' + newCss
);

// ══════════════════════════════════════════════════════════════
// 2. renderKCardSteps — add date picker per step
// ══════════════════════════════════════════════════════════════
const oldAppend = `    row.appendChild(hdl);
    row.appendChild(chk);
    row.appendChild(txt);
    wrap.appendChild(row);`;

const newAppend = `    // Date picker for this step
    var datePick = document.createElement('input');
    datePick.type = 'date';
    datePick.className = 'kcard-step-date' + (checkStepOverdue(step) ? ' overdue' : '');
    datePick.title = 'Set target date for this task';
    if (step.targetDate) datePick.value = step.targetDate;
    datePick.addEventListener('click', function(e){ e.stopPropagation(); });
    datePick.addEventListener('change', function(e) {
      e.stopPropagation();
      step.targetDate = datePick.value || undefined;
      datePick.className = 'kcard-step-date' + (checkStepOverdue(step) ? ' overdue' : '');
      saveData();
    });

    row.appendChild(hdl);
    row.appendChild(chk);
    row.appendChild(txt);
    row.appendChild(datePick);
    wrap.appendChild(row);`;

if (!txt.includes(oldAppend)) { console.error('oldAppend not found!'); process.exit(1); }
txt = txt.replace(oldAppend, newAppend);

// ══════════════════════════════════════════════════════════════
// 3. Helper functions — insert before renderKCardSteps
// ══════════════════════════════════════════════════════════════
txt = txt.replace(
  'function renderKCardSteps(gid) {',
  `function checkStepOverdue(step) {
  if (!step.targetDate || step.done) return false;
  var today = new Date(); today.setHours(0,0,0,0);
  var d = new Date(step.targetDate + 'T00:00:00');
  return d < today;
}
function getOverdueSteps() {
  var result = [];
  var today = new Date(); today.setHours(0,0,0,0);
  (goals||[]).forEach(function(g) {
    if (!g.steps) return;
    g.steps.forEach(function(s) {
      if (s.targetDate && !s.done) {
        var d = new Date(s.targetDate + 'T00:00:00');
        if (d < today) result.push({ goalTitle: g.title, stepText: s.text, targetDate: s.targetDate, daysLate: Math.floor((today - d) / 86400000) });
      }
    });
  });
  return result;
}
function renderKCardSteps(gid) {`
);

// ══════════════════════════════════════════════════════════════
// 4. Inject overdue goal-task pills into renderGCalMonth cells
//    Match the exact escaped string from the file
// ══════════════════════════════════════════════════════════════
const oldMonthReturn = `    return '<div class=\"gcal-month-cell'+(isToday?' today-cell':'')+'\" onclick=\"gcalMonthCellClick(\\''+dk+'\\')\">'+'<span class=\"gcal-month-daynum'+numCls+'\">'+d+'</span>'+pills+more+'</div>';`;

const newMonthReturn = `    // Goal sub-task due/overdue indicators on this date
    var goalPills = '';
    var cellDate = new Date(dk+'T00:00:00'); cellDate.setHours(0,0,0,0);
    var todayMid = new Date(); todayMid.setHours(0,0,0,0);
    (goals||[]).forEach(function(g) {
      if (!g.steps) return;
      g.steps.forEach(function(s) {
        if (s.targetDate === dk && !s.done) {
          var isOv = cellDate < todayMid;
          goalPills += '<div class=\"gcal-overdue-strip\" style=\"'+(isOv?'':'border-color:#1f6feb;color:var(--text2)')+'\">'+esc(s.text)+'</div>';
        }
      });
    });
    return '<div class=\"gcal-month-cell'+(isToday?' today-cell':'')+'\" onclick=\"gcalMonthCellClick(\\''+dk+'\\')\">'+'<span class=\"gcal-month-daynum'+numCls+'\">'+d+'</span>'+pills+more+goalPills+'</div>';`;

if (!txt.includes(oldMonthReturn)) { console.error('oldMonthReturn not found!'); process.exit(1); }
txt = txt.replace(oldMonthReturn, newMonthReturn);

// ══════════════════════════════════════════════════════════════
// 5. Overdue banner injected into renderGCal()
// ══════════════════════════════════════════════════════════════
const oldRenderGCal = `function renderGCal() {
  var go = document.getElementById('gcal-grid-outer');
  var mo = document.getElementById('gcal-month-outer');
  if (_gcalView === 'month') {
    go.style.display = 'none';
    mo.style.display = 'flex';
    renderGCalMonth();
  } else {
    go.style.display = 'flex';
    mo.style.display = 'none';
    if (_gcalView === 'week') renderGCalWeek();
    else renderGCalDay();
  }
}`;

const newRenderGCal = `function renderGCal() {
  var go = document.getElementById('gcal-grid-outer');
  var mo = document.getElementById('gcal-month-outer');
  if (_gcalView === 'month') {
    go.style.display = 'none';
    mo.style.display = 'flex';
    renderGCalMonth();
  } else {
    go.style.display = 'flex';
    mo.style.display = 'none';
    if (_gcalView === 'week') renderGCalWeek();
    else renderGCalDay();
  }
  // Overdue goal-task banner
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
  }
}`;

if (!txt.includes(oldRenderGCal)) { console.error('oldRenderGCal not found!'); process.exit(1); }
txt = txt.replace(oldRenderGCal, newRenderGCal);

// ══════════════════════════════════════════════════════════════
// 6. Add banner div inside #page-timeblocking
// ══════════════════════════════════════════════════════════════
txt = txt.replace(
  '<div id="page-timeblocking">',
  '<div id="page-timeblocking"><div id="gcal-overdue-banner" style="display:none;background:#3a1a1a;border-bottom:2px solid var(--red);padding:6px 14px;font-size:12px;color:#ff6b6b;flex-shrink:0;"></div>'
);

// ══════════════════════════════════════════════════════════════
// Verify
// ══════════════════════════════════════════════════════════════
const qq = (txt.match(/\?\?/g)||[]).length;
console.log('?? count:', qq);
console.log('Has checkStepOverdue:', txt.includes('function checkStepOverdue'));
console.log('Has getOverdueSteps:', txt.includes('function getOverdueSteps'));
console.log('Has kcard-step-date:', txt.includes('kcard-step-date'));
console.log('Has gcal-overdue-banner:', txt.includes('gcal-overdue-banner'));
console.log('Has gcal-overdue-strip:', txt.includes('gcal-overdue-strip'));
console.log('Has \uD83C\uDFAF:', txt.includes('\uD83C\uDFAF'));
console.log('Has \u2190 Back:', txt.includes('\u2190 Back'));
console.log('Size:', Buffer.byteLength(txt,'utf8'), 'bytes');

fs.writeFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', txt, {encoding:'utf8'});
console.log('Saved.');
