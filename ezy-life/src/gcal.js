
function setGCalView(v) {

  _gcalView = v;

  ['day','week','month','schedule'].forEach(function(vv){

    var btn = document.getElementById('gcal-vbtn-'+vv);

    if (btn) btn.classList.toggle('active', vv===v);

  });

  renderGCal();

}


function gcalToday() {

  _gcalAnchor = new Date();

  renderGCal();

}

function gcalShift(delta) {

  var d = new Date(_gcalAnchor);

  if (_gcalView === 'day')   d.setDate(d.getDate() + delta);

  else if (_gcalView === 'week')  d.setDate(d.getDate() + delta*7);

  else d.setMonth(d.getMonth() + delta);

  _gcalAnchor = d;

  renderGCal();

}

function renderGCal() {

  var go = document.getElementById('gcal-grid-outer');

  var mo = document.getElementById('gcal-month-outer');

  var so = document.getElementById('gcal-schedule-outer');

  if (_gcalView === 'month') {

    go.style.display = 'none';

    mo.style.display = 'flex';

    if (so) so.style.display = 'none';

    renderGCalMonth();

  } else if (_gcalView === 'schedule') {

    go.style.display = 'none';

    mo.style.display = 'none';

    if (so) { so.style.display = 'flex'; renderGCalSchedule(); }

  } else {

    go.style.display = 'flex';

    mo.style.display = 'none';

    if (so) so.style.display = 'none';

    if (_gcalView === 'week') renderGCalWeek();

    else renderGCalDay();

  }

  // Overdue goal-task + goal-level banner

  var banner = document.getElementById('gcal-overdue-banner');

  if (banner) {

    var ov = getOverdueSteps();

    var og = getOverdueGoals();

    var parts = [];

    if (og.length > 0) {

      parts.push('<span style="font-weight:700;color:#ff9944">&#9888; ' + og.length + ' overdue/unscheduled goal' + (og.length>1?'s':'') + ':</span> '

        + og.slice(0,3).map(function(x){ var meta = x.daysLate !== null ? x.daysLate+'d overdue, '+x.progress+'% done' : 'no date, '+x.progress+'% done'; return '<span style="color:#ff9944">' + esc(x.title) + '</span> <span style="color:var(--text3)">(' + meta + ')</span>'; }).join(' &bull; ')

        + (og.length > 3 ? ' &bull; <span style="color:var(--text3)">+' + (og.length-3) + ' more</span>' : ''));

    }

    if (ov.length > 0) {

      parts.push('<span style="font-weight:700;color:var(--red)">&#9888; ' + ov.length + ' overdue/unscheduled sub-task' + (ov.length>1?'s':'') + ':</span> '

        + ov.slice(0,3).map(function(x){ var meta = x.daysLate !== null ? x.goalTitle+', '+x.daysLate+'d late' : x.goalTitle+', no date'; return esc(x.stepText) + ' <span style="color:var(--text3)">(' + esc(meta) + ')</span>'; }).join(' &bull; ')

        + (ov.length > 3 ? ' &bull; <span style="color:var(--text3)">+' + (ov.length-3) + ' more</span>' : ''));

    }

    if (parts.length > 0) {

      banner.style.display = 'block';

      banner.style.cursor = 'pointer';

      banner.title = 'Click to view overdue goals';

      banner.onclick = goalsShowOverdue;

      banner.innerHTML = '<span style="float:right;opacity:.6;font-size:11px">View Goals ?</span>' + parts.join('<br>');

    } else {

      banner.style.display = 'none';

      banner.onclick = null;

      banner.style.cursor = '';

    }

  }

}

function renderGCalWeek() {

  var anchor = new Date(_gcalAnchor);

  var sunday = new Date(anchor);

  sunday.setDate(anchor.getDate() - anchor.getDay());

  var days = [];

  for (var i=0;i<7;i++) { var d=new Date(sunday); d.setDate(d.getDate()+i); days.push(d); }

  var MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  var s=days[0], e=days[6];

  var label = (s.getMonth()===e.getMonth())

    ? MONTHS[s.getMonth()]+' '+s.getDate()+'-'+e.getDate()+', '+s.getFullYear()

    : MONTHS[s.getMonth()]+' '+s.getDate()+' - '+MONTHS[e.getMonth()]+' '+e.getDate()+', '+e.getFullYear();

  document.getElementById('gcal-period-label').textContent = label;

  buildWeekDayHeaders(days);

  buildHourGrid(days);

}

function renderGCalDay() {

  var d = new Date(_gcalAnchor);

  var DAYS=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  var MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];

  document.getElementById('gcal-period-label').textContent = DAYS[d.getDay()]+', '+MONTHS[d.getMonth()]+' '+d.getDate()+', '+d.getFullYear();

  buildWeekDayHeaders([d]);

  buildHourGrid([d]);

}

function buildWeekDayHeaders(days) {

  var today = new Date();

  var todayKey = tbDateKey(today);

  var ABBR=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  var html = '<div class="gcal-gutter-hdr"></div>';

  days.forEach(function(d){

    var dk = tbDateKey(d);

    var isToday = dk === todayKey;

    html += '<div class="gcal-col-hdr" onclick="gcalClickDayHeader(\''+dk+'\')">'

      +'<div class="gcal-day-abbr">'+ABBR[d.getDay()]+'</div>'

      +'<div class="gcal-day-num'+(isToday?' is-today':'')+'">'+d.getDate()+'</div>'

      +'</div>';

  });

  document.getElementById('gcal-col-headers').innerHTML = html;

}

function buildHourGrid(days) {

  var totalH = 24 * 60; // total px

  var today = new Date();

  var todayKey = tbDateKey(today);

  // Time gutter

  var gutterHtml = '';

  for (var h=0;h<24;h++) {

    var top = h * 60;

    var lbl = h===0 ? '12 AM' : h<12 ? h+' AM' : h===12 ? '12 PM' : (h-12)+' PM';

    if (h > 0) gutterHtml += '<div class="gcal-time-label" style="top:'+top+'px">'+lbl+'</div>';

  }

  var gutter = document.getElementById('gcal-time-gutter');

  gutter.innerHTML = gutterHtml;

  gutter.style.height = totalH+'px';

  // Day columns

  var colsHtml = '';

  days.forEach(function(d){

    var dk = tbDateKey(d);

    var isToday = dk === todayKey;

    var dayTasks = _tasks[dk] || [];

    colsHtml += '<div class="gcal-day-col" data-date="'+dk+'" onclick="gcalColClick(event,\''+dk+'\')">';

    // hour lines

    for (var h2=0;h2<24;h2++) {

      colsHtml += '<div class="gcal-hour-line" style="top:'+(h2*60)+'px"></div>';

      colsHtml += '<div class="gcal-half-line" style="top:'+(h2*60+30)+'px"></div>';

    }

    // events

    dayTasks.forEach(function(t){

      var tp = (t.time||'09:00').split(':');

      var sh = parseInt(tp[0],10), sm = parseInt(tp[1]||'0',10);

      var ep = (t.endTime||'').split(':');

      var eh = ep[0]?parseInt(ep[0],10):sh+1;

      var em = ep[1]?parseInt(ep[1],10):sm;

      var dur = (eh*60+em)-(sh*60+sm);

      if(dur<=0) dur=60;

      var topPx = sh*60+sm;

      var htPx = Math.max(30,dur);

      var clr = t.color||'#1f6feb';

      colsHtml += '<div class="gcal-evt" style="top:'+topPx+'px;height:'+htPx+'px;background:'+clr+'" onclick="event.stopPropagation();gcalOpenTask(\''+dk+'\','+t.id+')">';

      colsHtml += '<div class="gcal-evt-title">'+esc(t.title)+'</div>';

      colsHtml += '<div class="gcal-evt-time">'+fmt12(t.time)+(t.endTime?'-'+fmt12(t.endTime):'')+'</div>';

      colsHtml += '</div>';

    });

    // current time indicator

    if (isToday) {

      var now2=new Date();

      var nTop=now2.getHours()*60+now2.getMinutes();

      colsHtml += '<div class="gcal-now-wrap" style="top:'+nTop+'px"><div class="gcal-now-line"><div class="gcal-now-dot"></div></div></div>';

    }

    colsHtml += '</div>';

  });

  var wrap = document.getElementById('gcal-cols-wrap');

  wrap.innerHTML = colsHtml;

  wrap.style.height = totalH+'px';

  // Scroll to 7am

  var scroll = document.getElementById('gcal-body-scroll');

  scroll.scrollTop = 7*60;

}

function gcalColClick(e, dk) {

  if (e.target.classList.contains('gcal-evt') || e.target.classList.contains('gcal-evt-title') || e.target.classList.contains('gcal-evt-time')) return;

  var col = e.currentTarget;

  var rect = col.getBoundingClientRect();

  var scrollTop = document.getElementById('gcal-body-scroll').scrollTop;

  var clickY = e.clientY - rect.top + (e.currentTarget.closest('.gcal-body-scroll')||{scrollTop:0}).scrollTop;

  // Actually compute relative to the scrollable body

  var bodyEl = document.getElementById('gcal-body-scroll');

  var bodyRect = bodyEl.getBoundingClientRect();

  var relY = e.clientY - bodyRect.top + bodyEl.scrollTop;

  var hour = Math.floor(relY / 60);

  openAddTaskModal(dk, hour);

}

function gcalClickDayHeader(dk) {

  _gcalAnchor = new Date(dk+'T12:00:00');

  setGCalView('day');

}

function gcalOpenTask(dk, tid) {

  var t = (_tasks[dk]||[]).find(function(x){return x.id===tid;});

  if (!t) return;

  _editingTaskDk = dk; _editingTaskId = tid;

  // Title

  document.getElementById('td-title-input').value = t.title || '';

  // Date

  setTimeout(function(){

    var di = document.getElementById('td-date-input');

    if (di) di.value = dk;

  }, 0);

  // Sub-tasks � copy into _tdSubs

  _tdSubs = (t.subtasks || []).map(function(s){ return {id:s.id||(_subIdCtr++),title:s.title,done:!!s.done,rdate:s.rdate||null}; });

  renderTdSubList();

  // Time: parse "HH:MM" ? h12 + am/pm

  function parseTime(str, hrId, minId, amId, pmId, isPMFlag) {

    if (!str) return;

    var parts = str.split(':');

    var hh = parseInt(parts[0]||'9',10);

    var mm = parseInt(parts[1]||'0',10);

    var isPM = hh >= 12;

    var h12 = hh === 0 ? 12 : hh > 12 ? hh-12 : hh;

    document.getElementById(hrId).value = h12;

    document.getElementById(minId).value = mm;

    document.getElementById(amId).classList.toggle('active', !isPM);

    document.getElementById(pmId).classList.toggle('active', isPM);

    return isPM;

  }

  _tdIsPM = parseTime(t.time, 'td-hr','td-min','td-am-btn','td-pm-btn') || false;

  _tdIsEndPM = parseTime(t.endTime||t.time, 'td-ehr','td-emin','td-eam-btn','td-epm-btn') || false;

  // Color

  _tdTaskColor = t.color || '#1f6feb';

  buildTdColorPicker();

  // Reminder

  var rdrop = document.getElementById('td-reminder');

  if (rdrop) rdrop.value = (t.reminder !== undefined && t.reminder !== null) ? String(t.reminder) : '';

  showModal('taskdetail');

}

// ===== TASK DETAIL (EDIT) MODAL HELPERS =====

var _tdIsPM = false;

var _tdIsEndPM = false;

var _tdTaskColor = '#1f6feb';

var _tdSubs = [];

var _tdGlobalDragSrc = null;

function renderGCalMonth() {

  var y = _gcalAnchor.getFullYear(), mo = _gcalAnchor.getMonth();

  var MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];

  document.getElementById('gcal-period-label').textContent = MONTHS[mo]+' '+y;

  var first = new Date(y,mo,1).getDay();

  var last  = new Date(y,mo+1,0).getDate();

  var today = new Date(), todayKey = tbDateKey(today);

  var cells = [];

  for (var i=0;i<first;i++) cells.push(null);

  for (var d=1;d<=last;d++) cells.push(d);

  while (cells.length%7!==0) cells.push(null);

  var html = cells.map(function(d){

    if (!d) return '<div class="gcal-month-cell empty-month"></div>';

    var dk = y+'-'+pad2(mo+1)+'-'+pad2(d);

    var dayTasks = _tasks[dk]||[];

    var isToday = dk===todayKey;

    var numCls = isToday?' today-mnum':'';

    var pills = dayTasks.slice(0,2).map(function(t){

      return '<div class="gcal-month-pill" style="background:'+(t.color||'#1f6feb')+'">'+esc(t.title)+'</div>';

    }).join('');

    var more = dayTasks.length>2 ? '<div class="gcal-month-more">+'+( dayTasks.length-2)+' more</div>' : '';

    // Goal sub-task due/overdue indicators on this date

    var goalPills = '';

    var cellDate = new Date(dk+'T00:00:00'); cellDate.setHours(0,0,0,0);

    var todayMid = new Date(); todayMid.setHours(0,0,0,0);

    (goals||[]).forEach(function(g) {

      if (!g.steps) return;

      g.steps.forEach(function(s) {

        if (s.targetDate === dk && !s.done) {

          var isOv = cellDate < todayMid;

          goalPills += '<div class="gcal-overdue-strip" style="'+(isOv?'':'border-color:#1f6feb;color:var(--text2)')+'">'+esc(s.text)+'</div>';

        }

      });

    });

    return '<div class="gcal-month-cell'+(isToday?' today-cell':'')+'" onclick="gcalMonthCellClick(\''+dk+'\')">'+'<span class="gcal-month-daynum'+numCls+'">'+d+'</span>'+pills+more+goalPills+'</div>';

  }).join('');

  document.getElementById('gcal-month-grid').innerHTML = html;

}

function gcalMonthCellClick(dk) {

  _gcalAnchor = new Date(dk+'T12:00:00');

  setGCalView('day');

}

// ===== ADD TASK MODAL =====

function renderGCalSchedule() {
  var so = document.getElementById('gcal-schedule-outer'); if (!so) return;
  // Collect all date keys with tasks, sorted
  var keys = Object.keys(_tasks).filter(function(k){ return _tasks[k] && _tasks[k].length > 0; }).sort();
  if (!keys.length) { so.innerHTML = '<div style="color:var(--text3);text-align:center;padding:40px">No tasks scheduled.</div>'; return; }
  var html = '';
  keys.forEach(function(dk) {
    var d = new Date(dk+'T12:00:00');
    var DAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    var MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    html += '<div style="margin-bottom:18px">';
    html += '<div style="font-size:13px;font-weight:700;color:var(--accent2);letter-spacing:.04em;margin-bottom:6px;text-transform:uppercase">';
    html += DAYS[d.getDay()]+', '+MONTHS[d.getMonth()]+' '+d.getDate()+', '+d.getFullYear();
    html += '</div>';
    var tasks = _tasks[dk].slice().sort(function(a,b){ return (a.time||'').localeCompare(b.time||''); });
    tasks.forEach(function(t) {
      var color = t.color || '#1f6feb';
      html += '<div style="display:flex;align-items:flex-start;gap:10px;padding:10px 12px;background:var(--card);border-radius:10px;border-left:4px solid '+color+';margin-bottom:6px">';
      html += '<input type="checkbox"'+(t.done?' checked':'')+' onchange="_schedToggleTask(\''+dk+'\','+t.id+',this.checked)" style="margin-top:3px;cursor:pointer;accent-color:'+color+'">';
      html += '<div style="flex:1">';
      html += '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">';
      html += '<span style="font-weight:700;font-size:15px;color:'+(t.done?'var(--text3)':'var(--text)')+';text-decoration:'+(t.done?'line-through':'none')+'">'+esc(t.title)+'</span>';
      if (t.time) html += '<span style="font-size:12px;color:var(--text3)">'+esc(t.time)+(t.endTime?' � '+esc(t.endTime):'')+'</span>';
      html += '</div>';
      if (t.subtasks && t.subtasks.length) {
        html += '<div style="margin-top:6px;display:flex;flex-direction:column;gap:4px">';
        t.subtasks.forEach(function(s,si) {
          html += '<div style="display:flex;align-items:center;gap:8px;padding-left:4px">';
          html += '<input type="checkbox"'+(s.done?' checked':'')+' onchange="_schedToggleSub(\''+dk+'\','+t.id+','+si+',this.checked)" style="cursor:pointer;accent-color:'+color+'">';
          html += '<span style="font-size:13px;color:'+(s.done?'var(--text3)':'var(--text2)')+';text-decoration:'+(s.done?'line-through':'none')+'">'+esc(s.text||s.title||'')+'</span>';
          html += '</div>';
        });
        html += '</div>';
      }
      html += '</div></div>';
    });
    html += '</div>';
  });
  so.innerHTML = html;
}
function _schedToggleTask(dk,id,done){
  if(!_tasks[dk])return;
  var t=_tasks[dk].find(function(x){return x.id===id;});
  if(t){t.done=done;saveData();}
}
function _schedToggleSub(dk,id,si,done){
  if(!_tasks[dk])return;
  var t=_tasks[dk].find(function(x){return x.id===id;});
  if(t&&t.subtasks&&t.subtasks[si]){t.subtasks[si].done=done;saveData();}
}

// ===== UI STATE PERSISTENCE (localStorage) =====
var _UI_PERSIST_KEY = 'ezy_modal_ui_state';

// --- window exports ---
window.setGCalView = setGCalView;
window.gcalToday = gcalToday;
window.gcalShift = gcalShift;
window.renderGCal = renderGCal;
window.gcalColClick = gcalColClick;
window.gcalClickDayHeader = gcalClickDayHeader;
window.gcalOpenTask = gcalOpenTask;
window.gcalMonthCellClick = gcalMonthCellClick;
window.renderGCalSchedule = renderGCalSchedule;
window._schedToggleTask = _schedToggleTask;
window._schedToggleSub = _schedToggleSub;
