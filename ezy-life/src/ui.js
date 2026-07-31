
function toggleTheme() {
  var isLight = document.body.classList.toggle('light-theme');
  localStorage.setItem('ezy-theme', isLight ? 'light' : 'dark');
  var btn = document.getElementById('theme-toggle-btn');
  if (btn) btn.textContent = isLight ? String.fromCodePoint(0x2600,0xFE0F) : String.fromCodePoint(0x1F319);
}
function applyStoredTheme() {
  var saved = localStorage.getItem('ezy-theme');
  var isLight = saved === 'light';
  document.body.classList.toggle('light-theme', isLight);
  var btn = document.getElementById('theme-toggle-btn');
  if (btn) btn.textContent = isLight ? String.fromCodePoint(0x2600,0xFE0F) : String.fromCodePoint(0x1F319);
}

function setJTab(el) {

  document.querySelectorAll('.j-tab').forEach(function(t){ t.classList.remove('active'); });

  el.classList.add('active');

}

// ===== MODAL =====

function setAMPM(ampm) {

  _isPM = (ampm === 'PM');

  var amBtn = document.getElementById('t-am-btn'); if(amBtn) amBtn.classList.toggle('active', !_isPM);

  var pmBtn = document.getElementById('t-pm-btn'); if(pmBtn) pmBtn.classList.toggle('active', _isPM);

}

function setEndAMPM(ampm) {

  _isEndPM = (ampm === 'PM');

  var eamBtn = document.getElementById('t-eam-btn'); if(eamBtn) eamBtn.classList.toggle('active', !_isEndPM);

  var epmBtn = document.getElementById('t-epm-btn'); if(epmBtn) epmBtn.classList.toggle('active', _isEndPM);

}

function autoToggleAMPM(which, changedEl) {

  var isEnd = which === 'end';

  var hrId  = isEnd ? 't-ehr' : 't-hr';

  var mnId  = isEnd ? 't-emin' : 't-min';

  var hrEl  = document.getElementById(hrId);

  var mnEl  = document.getElementById(mnId);

  var hr = parseInt(hrEl.value, 10);

  var mn = parseInt(mnEl.value, 10);

  if (isNaN(hr)) hr = 12;

  if (isNaN(mn)) mn = 0;

  var prevHr = parseInt(hrEl.getAttribute('data-prev') || String(hr), 10);

  var prevMn = parseInt(mnEl.getAttribute('data-prev') || String(mn), 10);

  if (isNaN(prevHr)) prevHr = hr;

  if (isNaN(prevMn)) prevMn = mn;

  var goingUp = (hr > prevHr) || (mn > prevMn && hr === prevHr);

  var goingDown = !goingUp;

  // Minute rollover: carry into hours

  if (mn > 59) { mn = 0; mnEl.value = '0'; hr += 1; hrEl.value = String(hr); goingUp = true; goingDown = false; }

  if (mn < 0)  { mn = 59; mnEl.value = '59'; hr -= 1; hrEl.value = String(hr); goingDown = true; goingUp = false; }

  // Hour wrap: 13->1, 0->12 (no period change on wrap � period only flips at 11<->12 boundary)

  if (hr > 12) { hr = 1; hrEl.value = '1'; }

  if (hr < 1)  { hr = 12; hrEl.value = '12'; }

  // AM/PM flip ONLY at the 11<->12 boundary

  // Going UP:   prevHr=11 and hr=12 -> flip period

  // Going DOWN: prevHr=12 and hr=11 -> flip period

  var flip = false;

  if (goingUp   && prevHr === 11 && hr === 12) flip = true;

  if (goingDown && prevHr === 12 && hr === 11) flip = true;

  // Also catch wrap-around: going up from 12 wraps to 1 (prev=12, hr=1) � cross occurred, flip

  if (goingUp   && prevHr === 12 && hr === 1)  flip = true;

  // Going down from 1 wraps to 12 (prev=1, hr=12) � cross occurred, flip

  if (goingDown && prevHr === 1  && hr === 12) flip = true;

  if (flip) {

    var isPM = isEnd ? _isEndPM : _isPM;

    isPM = !isPM;

    if (isEnd) setEndAMPM(isPM ? 'PM' : 'AM');

    else       setAMPM(isPM ? 'PM' : 'AM');

  }

  // Store for next event

  hrEl.setAttribute('data-prev', String(hr));

  mnEl.setAttribute('data-prev', String(mn));

}

document.addEventListener('keydown', function(e) {

  var modal = document.getElementById('modal-addtask');

  if (modal && modal.style.display !== 'none') {

    if (e.key === 'a' || e.key === 'A') { e.preventDefault(); setAMPM('AM'); }

    if (e.key === 'p' || e.key === 'P') { e.preventDefault(); setAMPM('PM'); }

  }

});

function getPickedTime() {

  var hr = parseInt(document.getElementById('t-hr').value||'9',10);

  var mn = parseInt(document.getElementById('t-min').value||'0',10);

  if (isNaN(hr)||hr<1||hr>12) hr=9;

  if (isNaN(mn)||mn<0||mn>59) mn=0;

  if (_isPM && hr!==12) hr+=12;

  if (!_isPM && hr===12) hr=0;

  return pad2(hr)+':'+pad2(mn);

}

function getPickedEndTime() {

  var hr = parseInt(document.getElementById('t-ehr').value||'10',10);

  var mn = parseInt(document.getElementById('t-emin').value||'0',10);

  if (isNaN(hr)||hr<1||hr>12) hr=10;

  if (isNaN(mn)||mn<0||mn>59) mn=0;

  if (_isEndPM && hr!==12) hr+=12;

  if (!_isEndPM && hr===12) hr=0;

  return pad2(hr)+':'+pad2(mn);

}

// ===== COLOR PICKER (events) =====

var EVT_COLORS = [

  { label:'Blue',   val:'#1f6feb' },

  { label:'Green',  val:'#2ea043' },

  { label:'Red',    val:'#da3633' },

  { label:'Yellow', val:'#b08800' },

  { label:'Purple', val:'#8957e5' },

  { label:'Teal',   val:'#1a7f74' },

  { label:'Pink',   val:'#bf4b8a' }

];

function catIconHtml(cat) {

  if (!cat) return '';

  if (cat.iconUrl) return '<img src="'+cat.iconUrl+'" class="mcat-icon-img" style="width:18px;height:18px;border-radius:3px;object-fit:cover;vertical-align:middle" alt="">';

  return cat.emoji || '';

}

function printPage() {

  var mc = document.getElementById('main-content');

  var tb = document.getElementById('page-timeblocking');

  var isTimeblocking = _currentPage === 'timeblocking';

  if (isTimeblocking) {

    // ---- BUILD AGENDA HTML ----

    var anchor = new Date(_gcalAnchor);

    var days = [];

    if (_gcalView === 'week') {

      var sunday = new Date(anchor);

      sunday.setDate(anchor.getDate() - anchor.getDay());

      for (var i = 0; i < 7; i++) {

        var dd = new Date(sunday);

        dd.setDate(dd.getDate() + i);

        days.push(dd);

      }

    } else {

      days = [anchor];

    }

    // Month names + day names for header

    var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

    var DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

    // Collect all tasks across visible days, sorted by date then time

    var allItems = [];

    days.forEach(function(d) {

      var dk = tbDateKey(d);

      var dayTasks = (_tasks[dk] || []).slice();

      // Sort by start time

      dayTasks.sort(function(a, b) {

        var ta = (a.time || '00:00'), tb2 = (b.time || '00:00');

        return ta < tb2 ? -1 : ta > tb2 ? 1 : 0;

      });

      if (dayTasks.length) {

        allItems.push({ date: d, dk: dk, tasks: dayTasks });

      }

    });

    // Build agenda HTML

    var html = '<div class="ezy-agenda-wrap">';

    // Title

    if (_gcalView === 'week') {

      var firstDay = days[0], lastDay = days[6];

      html += '<div class="ezy-agenda-title">Week of ' + MONTHS[firstDay.getMonth()] + ' ' + firstDay.getDate() + ', ' + firstDay.getFullYear() + '</div>';

    } else {

      html += '<div class="ezy-agenda-title">' + DAYS[anchor.getDay()] + ', ' + MONTHS[anchor.getMonth()] + ' ' + anchor.getDate() + ', ' + anchor.getFullYear() + '</div>';

    }

    if (allItems.length === 0) {

      html += '<div style="color:#666;font-size:14px;">No tasks scheduled.</div>';

    } else {

      allItems.forEach(function(dayItem) {

        // Day heading (only in week view)

        if (_gcalView === 'week') {

          html += '<div style="font-size:13px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:.5px;margin:18px 0 10px;border-bottom:1px solid #ddd;padding-bottom:4px;">' +

            DAYS[dayItem.date.getDay()] + ', ' + MONTHS[dayItem.date.getMonth()] + ' ' + dayItem.date.getDate() +

            '</div>';

        }

        dayItem.tasks.forEach(function(t) {

          var timeStr = fmt12(t.time || '00:00');

          if (t.endTime) timeStr += ' ? ' + fmt12(t.endTime);

          html += '<div class="ezy-agenda-item">';

          html += '<div class="ezy-agenda-time">' + timeStr + '</div>';

          html += '<div class="ezy-agenda-task">' + esc(t.title) + '</div>';

          if (t.subtasks && t.subtasks.length) {

            html += '<div class="ezy-agenda-subs">';

            t.subtasks.forEach(function(s) {

              html += '<div class="ezy-agenda-sub">? ' + esc(s.title) + '</div>';

            });

            html += '</div>';

          }

          html += '</div>';

        });

      });

    }

    // Day view only: append Active Goal Tasks section

    if (_gcalView === 'day') {

      var goalTasks = getActiveGoalTasks();

      if (goalTasks.length) {

        html += '<div class="ezy-goal-tasks-section">';

        html += '<div class="ezy-goal-tasks-title">🎯 Today\'s Active Goal Tasks</div>';

        goalTasks.forEach(function(gt) {

          html += '<div class="ezy-goal-task-row">';

          html += '<div class="ezy-goal-task-chk"></div>';

          html += '<div class="ezy-goal-task-body">';

          if (gt.taskText) {

            html += '<div class="ezy-goal-task-name">' + esc(gt.taskText) + '</div>';

            html += '<div class="ezy-goal-task-meta">' + gt.catEmoji + ' ' + esc(gt.goalTitle) + ' &bull; ' + gt.progress + '% complete' + (gt.taskDate ? ' &bull; Due: ' + gt.taskDate : ' &bull; No date') + '</div>';

          } else {

            html += '<div class="ezy-goal-task-name">' + esc(gt.goalTitle) + '</div>';

            html += '<div class="ezy-goal-task-meta">' + gt.catEmoji + ' ' + esc(gt.catName) + ' &bull; ' + gt.progress + '% complete &bull; No sub-tasks</div>';

          }

          html += '</div></div>';

        });

        html += '</div>';

      }

    }

    html += '</div>';

    // Inject into the print-only div

    var agendaEl = document.getElementById('ezy-print-agenda');

    agendaEl.innerHTML = html;

    // Show time blocking page for print

    mc.style.display = 'none';

    tb.classList.add('print-target');

    window.print();

    // Restore

    setTimeout(function() {

      agendaEl.innerHTML = '';

      mc.style.display = '';

      tb.classList.remove('print-target');

    }, 1500);

  } else {

    // Non-timeblocking pages: standard print

    var pg = document.getElementById('page-' + _currentPage);

    if (pg) pg.classList.add('print-target');

    window.print();

    setTimeout(function() {

      var pg2 = document.getElementById('page-' + _currentPage);

      if (pg2) pg2.classList.remove('print-target');

    }, 1000);

  }

}

function pickEmoji(key, emoji) {

  var el = document.getElementById('ep-' + key);

  var cb = (el && el._cb) || _epCBs[key];

  if (cb) cb(emoji);

  closeAllEPs();

}

function requestNotifPermission(cb) {

  if (!('Notification' in window)) { if(cb) cb(false); return; }

  if (Notification.permission === 'granted') { if(cb) cb(true); return; }

  if (Notification.permission !== 'denied') {

    Notification.requestPermission().then(function(p){ if(cb) cb(p==='granted'); });

  } else { if(cb) cb(false); }

}

function _uiPersistSave(state) {
  try { localStorage.setItem(_UI_PERSIST_KEY, JSON.stringify(state)); } catch(e){}
}
function _uiPersistLoad() {
  try { var s=localStorage.getItem(_UI_PERSIST_KEY); return s?JSON.parse(s):null; } catch(e){ return null; }
}
function _uiPersistClear() {
  try { localStorage.removeItem(_UI_PERSIST_KEY); } catch(e){}
}
// Hook into showModal/closeModal to auto-persist add-task draft
var _origShowModal = showModal;
showModal = function(id) {
  _origShowModal(id);
  if (id === 'addtask') {
    // persist a snapshot of the draft on open
    try {
      var titleEl = document.getElementById('t-title');
      _uiPersistSave({modal:'addtask', date:_addTaskDate, title:titleEl?titleEl.value:''});
    } catch(e){}
  }
};
var _origCloseModal = closeModal;
closeModal = function(id) {
  _origCloseModal(id);
  if (id === 'addtask') _uiPersistClear();
};
// On page load, restore persisted modal state
(function _uiPersistRestore() {
  window.addEventListener('DOMContentLoaded', function() {
    var st = _uiPersistLoad();
    if (st && st.modal === 'addtask') {
      // Restore draft
      setTimeout(function(){
        try {
          openAddTaskModal(st.date || null, null);
          var te = document.getElementById('t-title'); if(te && st.title) te.value = st.title;
        } catch(e){}
      }, 600);
    }
  });
})();

function fmtTBDate(d){

  var DAYS=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  var MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];

  var n=d.getDate(), sfx=(n===1||n===21||n===31)?'st':(n===2||n===22)?'nd':(n===3||n===23)?'rd':'th';

  return DAYS[d.getDay()]+', '+MONTHS[d.getMonth()]+' '+n+sfx;

}



// ===== REASSIGN =====

function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function pad2(n){ return String(n).padStart(2,'0'); }

function fmtDate(ds){ var d=new Date(ds+'T00:00:00'); var M=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; return M[d.getMonth()]+' '+d.getDate()+', '+d.getFullYear(); }

function fmt12(t){ if(!t)return''; var p=t.split(':'); var h=parseInt(p[0],10),m=p[1]||'00'; var ap=h>=12?'PM':'AM'; h=h%12||12; return h+':'+m+' '+ap; }

// ===== INIT =====

applyStoredTheme();

// ===== NAVIGATION HISTORY =====

var _navHistory = [];

window.addEventListener('popstate', function(e) {
  var pg = (e.state && e.state.page) ? e.state.page : 'home';
  _currentPage = pg;
  _showPageInternal(pg);
  highlightNav(pg);
  updateNavButtons();
  if (pg === 'home') renderHomeBlocks();
});

function showCategoryMenu(groupId) {

  var group = sidebarGroups.find(function(g){ return g.id === groupId; });

  if (!group) { return; }

  // If only 1 item, navigate directly

  if (group.items.length === 1) { showPage(group.items[0].id); return; }

  

  if (window.innerWidth <= 768) closeMobileSidebar();

  var grid = document.getElementById('submenu-grid');

  var title = document.getElementById('submenu-title');

  if (title) title.textContent = group.name;

  if (grid) {

    grid.innerHTML = group.items.map(function(item) {

      return '<div class="submenu-card" onclick="showPage(\''+item.id+'\')">' +

        '<div class="submenu-card-icon">'+(item.icon||'?')+'</div>' +

        '<div class="submenu-card-label">'+esc(item.label)+'</div>' +

        '</div>';

    }).join('');

  }

  _navHistory.push(_currentPage || 'home');

  _currentPage = 'submenu';

  _showPageInternal('submenu');

  highlightNav('submenu');

  var info = document.getElementById('page-title');

  if (info) info.textContent = group.name;

  var sub = document.getElementById('page-sub');

  if (sub) sub.textContent = 'Choose a section';

  updateNavButtons();

}

function gsearchRun() {

  clearTimeout(_gsearchTimer);

  _gsearchTimer = setTimeout(function() {

    var q = (document.getElementById('gsearch-input').value || '').trim().toLowerCase();

    var dd = document.getElementById('gsearch-dropdown');

    if (!q) { dd.classList.remove('open'); dd.innerHTML = ''; return; }

    var results = [];

    // --- Notes (read-only) ---

    notes.forEach(function(n) {

      var t = (n.title||'').toLowerCase();

      var b = (n.body||'').toLowerCase();

      if (t.indexOf(q) >= 0 || b.indexOf(q) >= 0) {

        var preview = (n.body||'').replace(/\[[ x]\]\s*/gi,'').slice(0,60);

        results.push({ section:'Notes', icon:'&#128221;', title: n.title || '(untitled)', sub: preview, action: function(nid){ return function(){ openNoteModal(nid); }; }(n.id) });

      }

    });

    // --- Goals / Kanban (read-only) ---

    goals.forEach(function(g) {

      var t = (g.title||'').toLowerCase();

      if (t.indexOf(q) >= 0) {

        var sub = []; if (g.category) sub.push(g.category); if (g.targetDate) sub.push('Due '+g.targetDate);

        results.push({ section:'Goals', icon:'&#127919;', title: g.title, sub: sub.join(' � '), action: function(gid){ return function(){ showPage('goals'); setTimeout(function(){ if(typeof openGoalDetail==='function') openGoalDetail(gid); },150); }; }(g.id) });

      }

      (g.steps||[]).forEach(function(s) {

        if ((s.title||'').toLowerCase().indexOf(q) >= 0) {

          results.push({ section:'Goals', icon:'&#127919;', title: s.title, sub: 'Step in: '+(g.title||''), action: function(gid){ return function(){ showPage('goals'); setTimeout(function(){ if(typeof openGoalDetail==='function') openGoalDetail(gid); },150); }; }(g.id) });

        }

      });

    });

    // --- Tasks (read-only, all dates) ---

    Object.keys(_tasks).forEach(function(dk) {

      (_tasks[dk]||[]).forEach(function(t) {

        var tt = (t.title||'').toLowerCase();

        if (tt.indexOf(q) >= 0) {

          results.push({ section:'Tasks', icon:'&#9989;', title: t.title, sub: dk, action: function(dkk, tid){ return function(){ showPage('timeblocking'); setTimeout(function(){ if(typeof _tbDate!=='undefined') _tbDate=dkk; if(typeof renderTimeblocking==='function') renderTimeblocking(); setTimeout(function(){ if(typeof gcalOpenTask==='function') gcalOpenTask(dkk,tid); },180); },150); }; }(dk, t.id) });

        }

        (t.subtasks||[]).forEach(function(s) {

          if ((s.title||'').toLowerCase().indexOf(q) >= 0) {

            results.push({ section:'Tasks', icon:'&#9989;', title: s.title, sub: 'Subtask on '+dk+' � '+t.title, action: function(dkk, tid){ return function(){ showPage('timeblocking'); setTimeout(function(){ if(typeof _tbDate!=='undefined') _tbDate=dkk; if(typeof renderTimeblocking==='function') renderTimeblocking(); setTimeout(function(){ if(typeof gcalOpenTask==='function') gcalOpenTask(dkk,tid); },180); },150); }; }(dk, t.id) });

          }

        });

      });

    });

    // --- Quick Links (read-only) ---

    _quickLinks.forEach(function(l) {

      if ((l.label||'').toLowerCase().indexOf(q) >= 0 || (l.url||'').toLowerCase().indexOf(q) >= 0) {

        results.push({ section:'Quick Links', icon:'\ud83d\udd17', title: l.label||l.url, sub: l.url, action: function(url){ return function(){ window.open(url,'_blank'); }; }(l.url) });

      }

    });

    // --- Render ---

    if (!results.length) {

      dd.innerHTML = '<div class="gsearch-empty">No results for \''+esc(q)+'\'</div>';

      dd.classList.add('open');

      return;

    }

    var sections = {};

    results.forEach(function(r) { if (!sections[r.section]) sections[r.section] = []; sections[r.section].push(r); });

    var html = '';

    Object.keys(sections).forEach(function(sec) {

      html += '<div class="gsearch-section">'+esc(sec)+'</div>';

      sections[sec].slice(0,5).forEach(function(r, i) {

        html += '<div class="gsearch-item" data-sec="'+esc(sec)+'" data-idx="'+i+'" onclick="gsearchActEl(this)">'+'<span class="gsearch-item-icon">'+r.icon+'</span><div class="gsearch-item-main"><div class="gsearch-item-title">'+esc(r.title)+'</div>'+(r.sub ? '<div class="gsearch-item-sub">'+esc(r.sub)+'</div>' : '')+'</div></div>';

      });

    });

    dd.innerHTML = html;

    dd.classList.add('open');

    // store actions

    dd._actions = {};

    Object.keys(sections).forEach(function(sec) {

      sections[sec].slice(0,5).forEach(function(r,i) {

        dd._actions[sec+'_'+i] = r.action;

      });

    });

  }, 120);

}

function gsearchActEl(el) {

  var sec = el.getAttribute('data-sec');

  var i = parseInt(el.getAttribute('data-idx'));

  gsearchAct(sec, i);

}

function gsearchAct(sec, i) {

  var dd = document.getElementById('gsearch-dropdown');

  var fn = dd._actions && dd._actions[sec+'_'+i];

  document.getElementById('gsearch-input').value = '';

  dd.classList.remove('open');

  dd.innerHTML = '';

  if (typeof fn === 'function') fn();

}

function gsearchBlur() {

  // Delay so click on item fires first

  setTimeout(function() {

    var dd = document.getElementById('gsearch-dropdown');

    if (dd) { dd.classList.remove('open'); }

  }, 200);

}

function gsearchKey(e) {

  if (e.key === 'Escape') {

    document.getElementById('gsearch-input').value = '';

    var dd = document.getElementById('gsearch-dropdown');

    dd.classList.remove('open');

    dd.innerHTML = '';

    return;

  }

  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {

    e.preventDefault();

    var dd = document.getElementById('gsearch-dropdown');

    var items = dd.querySelectorAll('.gsearch-item');

    if (!items.length) return;

    var cur = dd.querySelector('.gsearch-item.gs-active');

    var idx = -1;

    items.forEach(function(el,i){ if(el===cur) idx=i; });

    if (cur) cur.classList.remove('gs-active');

    idx = e.key === 'ArrowDown' ? Math.min(idx+1, items.length-1) : Math.max(idx-1, 0);

    items[idx].classList.add('gs-active');

    items[idx].scrollIntoView({block:'nearest'});

    return;

  }

  if (e.key === 'Enter') {

    var dd = document.getElementById('gsearch-dropdown');

    var cur = dd.querySelector('.gsearch-item.gs-active');

    if (cur) cur.click();

  }

}

document.addEventListener('keydown', function(e) {

  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {

    e.preventDefault();

    var inp = document.getElementById('gsearch-input');

    if (inp) { inp.focus(); inp.select(); }

  }

});

// ===== GOALS CAROUSEL =====

var _goalsTabIdx = 0;

// ===== GOALS TAB CUSTOMIZATION =====

var _goalsTabDefaults = ['🎯 Active Goals', '📋 All Goals', '✅ Complete goals'];


// --- window exports ---
if (typeof setAMPM !== 'undefined') window.setAMPM = setAMPM;
if (typeof setEndAMPM !== 'undefined') window.setEndAMPM = setEndAMPM;
if (typeof autoToggleAMPM !== 'undefined') window.autoToggleAMPM = autoToggleAMPM;
if (typeof getPickedTime !== 'undefined') window.getPickedTime = getPickedTime;
if (typeof getPickedEndTime !== 'undefined') window.getPickedEndTime = getPickedEndTime;
if (typeof pickEmoji !== 'undefined') window.pickEmoji = pickEmoji;
if (typeof requestNotifPermission !== 'undefined') window.requestNotifPermission = requestNotifPermission;
if (typeof printPage !== 'undefined') window.printPage = printPage;
if (typeof showCategoryMenu !== 'undefined') window.showCategoryMenu = showCategoryMenu;
if (typeof gsearchRun !== 'undefined') window.gsearchRun = gsearchRun;
if (typeof gsearchActEl !== 'undefined') window.gsearchActEl = gsearchActEl;
if (typeof gsearchAct !== 'undefined') window.gsearchAct = gsearchAct;
if (typeof gsearchBlur !== 'undefined') window.gsearchBlur = gsearchBlur;
if (typeof gsearchKey !== 'undefined') window.gsearchKey = gsearchKey;
