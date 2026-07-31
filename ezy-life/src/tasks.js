
function setAMPM_td(v) {

  _tdIsPM = (v === 'PM');

  document.getElementById('td-am-btn').classList.toggle('active', !_tdIsPM);

  document.getElementById('td-pm-btn').classList.toggle('active', _tdIsPM);

}

function setEndAMPM_td(v) {

  _tdIsEndPM = (v === 'PM');

  document.getElementById('td-eam-btn').classList.toggle('active', !_tdIsEndPM);

  document.getElementById('td-epm-btn').classList.toggle('active', _tdIsEndPM);

}

function autoToggleAMPM_td(which, inp) {

  var v = parseInt(inp.value, 10);

  if (isNaN(v)) return;

  if (v > 12) {

    if (which === 'start') { setAMPM_td('PM'); inp.value = v - 12; }

    else { setEndAMPM_td('PM'); inp.value = v - 12; }

  }

  inp.setAttribute('data-prev', inp.value);

}

function getTdPickedTime() {

  var h = parseInt(document.getElementById('td-hr').value||'9',10);

  var m = parseInt(document.getElementById('td-min').value||'0',10);

  if (_tdIsPM && h!==12) h+=12;

  if (!_tdIsPM && h===12) h=0;

  return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');

}

function getTdPickedEndTime() {

  var h = parseInt(document.getElementById('td-ehr').value||'10',10);

  var m = parseInt(document.getElementById('td-emin').value||'0',10);

  if (_tdIsEndPM && h!==12) h+=12;

  if (!_tdIsEndPM && h===12) h=0;

  return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');

}

function buildTdColorPicker() {
  var el = document.getElementById('td-color-picker');
  if (!el) return;
  var colors = ['#1f6feb','#2ea043','#e3b341','#f85149','#a371f7','#fd7e14','#20c997','#e36396'];
  el.innerHTML = colors.map(function(col) {
    var active = col === _tdTaskColor ? ' style="outline:3px solid #fff;outline-offset:2px"' : '';
    return '<button type="button" class="color-swatch" data-col="' + col + '" '
      + 'style="background:' + col + ';width:28px;height:28px;border-radius:50%;border:none;cursor:pointer;margin:2px"'
      + active
      + ' onclick="pickTdColor(this.dataset.col)"></button>';
  }).join('');
}

function pickTdColor(col) {

  _tdTaskColor = col;

  buildTdColorPicker();

}

function tdAddSub() {

  var inp = document.getElementById('td-sub-input');

  var title = (inp ? inp.value : '').trim();

  if (!title) return;

  _tdSubs.push({id: _subIdCtr++, title: title, done: false, rdate: null});

  if (inp) inp.value = '';

  renderTdSubList();

}

function renderTdSubList() {

  var el = document.getElementById('td-sub-list');

  if (!el) return;

  if (_tdSubs.length === 0) {

    el.innerHTML = '<div style="font-size:12px;color:var(--text3);padding:4px 0 6px">No sub-tasks yet.</div>';

    return;

  }

  el.innerHTML = _tdSubs.map(function(s, i) {

    return '<div class="kcard-step-row" data-tdidx="'+i+'" draggable="false">'

      + '<span class="kcard-step-hdl" title="Drag to reorder">&#8942;&#8942;</span>'

      + '<div class="step-check'+(s.done?' done':'')+'"></div>'

      + '<span class="kcard-step-txt'+(s.done?' done-step':'')+'" contenteditable="true" '

      + 'onblur="updateTdSub('+i+',this.textContent)" '

      + 'onkeydown="if(event.key===\'Enter\'){event.preventDefault();this.blur();}" '

      + 'style="flex:1;outline:none;cursor:text;padding:1px 4px;border-radius:4px;font-size:13px">'

      + esc(s.title)+'</span>'

      + '<button class="btn btn-outline btn-sm" onclick="remTdSub('+i+')" '

      + 'style="padding:2px 8px;color:var(--red);font-size:14px;line-height:1">&#10005;</button>'

      + '</div>';

  }).join('');

  // Wire drag handles

  el.querySelectorAll('.kcard-step-row').forEach(function(row) {

    var hdl = row.querySelector('.kcard-step-hdl');

    var chk = row.querySelector('.step-check');

    var i = parseInt(row.getAttribute('data-tdidx'), 10);

    hdl.addEventListener('dragstart', function(e) {

      e.stopPropagation();

      _tdGlobalDragSrc = i;

      row.draggable = true;

      e.dataTransfer.setData('td-step', '1');

      e.dataTransfer.effectAllowed = 'move';

      setTimeout(function(){ row.classList.add('kcs-dragging'); }, 0);

    });

    hdl.addEventListener('dragend', function() { row.draggable = false; });

    row.addEventListener('dragover', function(e) {

      if (e.dataTransfer.types.indexOf('td-step') === -1) return;

      e.preventDefault(); e.stopPropagation();

      var rect = row.getBoundingClientRect();

      var before = (e.clientY - rect.top) < rect.height / 2;

      el.querySelectorAll('.kcard-step-row').forEach(function(r){ r.classList.remove('kcs-drop-above','kcs-drop-below'); });

      row.classList.add(before ? 'kcs-drop-above' : 'kcs-drop-below');

      row._tdInsertBefore = before;

    });

    row.addEventListener('dragleave', function(){ row.classList.remove('kcs-drop-above','kcs-drop-below'); });

    row.addEventListener('dragend', function(){

      el.querySelectorAll('.kcard-step-row').forEach(function(r){ r.classList.remove('kcs-dragging','kcs-drop-above','kcs-drop-below'); });

    });

    row.addEventListener('drop', function(e) {

      e.preventDefault(); e.stopPropagation();

      var before = row._tdInsertBefore !== false;

      el.querySelectorAll('.kcard-step-row').forEach(function(r){ r.classList.remove('kcs-drop-above','kcs-drop-below','kcs-dragging'); });

      if (_tdGlobalDragSrc === null || _tdGlobalDragSrc === i) return;

      var moved = _tdSubs.splice(_tdGlobalDragSrc, 1)[0];

      var newIdx = before ? i : i + 1;

      if (_tdGlobalDragSrc < i) newIdx = before ? i - 1 : i;

      if (newIdx < 0) newIdx = 0;

      _tdSubs.splice(newIdx, 0, moved);

      _tdGlobalDragSrc = null;

      renderTdSubList();

    });

    chk.addEventListener('click', function(e) {

      e.stopPropagation();

      _tdSubs[i].done = !_tdSubs[i].done;

      chk.classList.toggle('done', _tdSubs[i].done);

      var txt = row.querySelector('.kcard-step-txt');

      if (txt) txt.classList.toggle('done-step', _tdSubs[i].done);

    });

  });

}

function remTdSub(i) { _tdSubs.splice(i, 1); renderTdSubList(); }

function updateTdSub(i, text) { if (_tdSubs[i]) _tdSubs[i].title = (text||'').trim() || _tdSubs[i].title; }

function tdSave() {

  if (!_editingTaskDk) return;

  var t = (_tasks[_editingTaskDk]||[]).find(function(x){return x.id===_editingTaskId;});

  if (!t) return;

  t.title = (document.getElementById('td-title-input').value||'').trim() || t.title;

  // Time

  t.time = getTdPickedTime();

  t.endTime = getTdPickedEndTime();

  // Color

  t.color = _tdTaskColor || t.color;

  // Reminder

  var rdrop = document.getElementById('td-reminder');

  if (rdrop) t.reminder = rdrop.value;

  // Sub-tasks

  t.subtasks = _tdSubs.slice();

  // Date change

  var newDk = (document.getElementById('td-date-input')||{}).value || _editingTaskDk;

  if (newDk && newDk !== _editingTaskDk) {

    _tasks[_editingTaskDk] = (_tasks[_editingTaskDk]||[]).filter(function(x){return x.id!==_editingTaskId;});

    if (!_tasks[newDk]) _tasks[newDk] = [];

    _tasks[newDk].push(t);

    _editingTaskDk = newDk;

  }

  saveData();

  closeModal('taskdetail');

  renderGCal();


}

function tdDelete() {

  if (!confirm('Delete this task?')) return;

  if (_tasks[_editingTaskDk]) {

    _tasks[_editingTaskDk] = _tasks[_editingTaskDk].filter(function(x){return x.id!==_editingTaskId;});

  }

  closeModal('taskdetail');

  renderGCal();


  saveData();

}

function openAddTaskModal(dk, hour) {

  _newSubs = []; renderNewSubList();

  _selectedTaskColor = '#1f6feb';

  buildTaskColorPicker();

  var d = dk ? new Date(dk+'T12:00:00') : new Date(_gcalAnchor);

  _addTaskDate = tbDateKey(d);

  var h = (hour !== null && hour !== undefined) ? hour : 9;

  if (h < 0) h = 0; if (h > 23) h = 23;

  _isPM = h >= 12;

  var h12 = h === 0 ? 12 : h > 12 ? h-12 : h;

  document.getElementById('t-hr').value = h12;

  document.getElementById('t-min').value = '0';

  var tamBtn = document.getElementById('t-am-btn'); if(tamBtn) tamBtn.classList.toggle('active', !_isPM);

  var tpmBtn = document.getElementById('t-pm-btn'); if(tpmBtn) tpmBtn.classList.toggle('active', _isPM);

  // end time = start + 1 hour

  var eh = h + 1;

  _isEndPM = eh >= 12;

  var eh12 = eh === 0 ? 12 : eh > 12 ? eh-12 : eh;

  document.getElementById('t-ehr').value = eh12 > 12 ? eh12-12 : eh12;

  document.getElementById('t-emin').value = '0';

  var teamBtn = document.getElementById('t-eam-btn'); if(teamBtn) teamBtn.classList.toggle('active', !_isEndPM);

  var tepmBtn = document.getElementById('t-epm-btn'); if(tepmBtn) tepmBtn.classList.toggle('active', _isEndPM);

  document.getElementById('t-title').value = '';

  var rr = document.getElementById('t-reminder'); if(rr) rr.value='10';

  var ru = document.getElementById('t-rrule'); if(ru) ru.value='';

  var rcp = document.getElementById('reminder-custom-panel'); if(rcp) rcp.style.display='none';

  var rrup = document.getElementById('rrule-custom-panel'); if(rrup) rrup.style.display='none';

  document.querySelectorAll('.rrule-day-btn').forEach(function(b){b.classList.remove('active');});

  var ri = document.getElementById('rrule-interval'); if(ri) ri.value='1';

  var rf = document.getElementById('rrule-freq'); if(rf) rf.value='WEEKLY';

  var rcn = document.getElementById('reminder-custom-num'); if(rcn) rcn.value='1';

  var rcu = document.getElementById('reminder-custom-unit'); if(rcu) rcu.value='minutes';

  _customRrule=''; _customReminderMinutes=null;

  showModal('addtask');

  clockInitFace('t','start', h12, 0, _isPM);

  clockInitFace('t','end', (eh12 > 12 ? eh12-12 : eh12), 0, _isEndPM);

  setTimeout(function(){ var inp = document.getElementById('addtask-date-input'); if(inp) inp.value = _addTaskDate; }, 0);

}

function addTaskDateChanged(val) { if (val) _addTaskDate = val; }

var _subIdCtr=1;

function addNewSub(){ var inp=document.getElementById('new-sub-input'); var title=(inp.value||'').trim(); if(!title)return; _newSubs.push({id:_subIdCtr++,title:title,done:false,rdate:null}); inp.value=''; renderNewSubList(); }

function renderNewSubList() {

  var el = document.getElementById('new-sub-list');

  if (!el) return;

  if (_newSubs.length === 0) {

    el.innerHTML = '<div style="font-size:12px;color:var(--text3);padding:4px 0 6px">No sub-tasks yet.</div>';

    return;

  }

  el.innerHTML = _newSubs.map(function(s, i) {

    return '<div class="kcard-step-row" data-nsidx="'+i+'" draggable="false">'

      + '<span class="kcard-step-hdl" title="Drag to reorder">&#8942;&#8942;</span>'

      + '<div class="step-check'+(s.done?' done':'')+'"></div>'

      + '<span class="kcard-step-txt'+(s.done?' done-step':'')+'" contenteditable="true" '

      + 'onblur="updateNewSub('+i+',this.textContent)" '

      + 'onkeydown="if(event.key===\'Enter\'){event.preventDefault();this.blur();}" '

      + 'style="flex:1;outline:none;cursor:text;padding:1px 4px;border-radius:4px;font-size:13px">'

      + esc(s.title)+'</span>'

      + '<button class="btn btn-outline btn-sm" onclick="remNewSub('+i+')" '

      + 'style="padding:2px 8px;color:var(--red);font-size:14px;line-height:1">&#10005;</button>'

      + '</div>';

  }).join('');

  // Wire drag handles

  el.querySelectorAll('.kcard-step-row').forEach(function(row) {

    var hdl = row.querySelector('.kcard-step-hdl');

    var chk = row.querySelector('.step-check');

    var idx = parseInt(row.getAttribute('data-nsidx'), 10);

    var _ns_dragSrc = null;

    hdl.addEventListener('dragstart', function(e) {

      e.stopPropagation();

      _nsGlobalDragSrc = idx;

      row.draggable = true;

      e.dataTransfer.setData('ns-step', '1');

      e.dataTransfer.effectAllowed = 'move';

      setTimeout(function(){ row.classList.add('kcs-dragging'); }, 0);

    });

    hdl.addEventListener('dragend', function() { row.draggable = false; });

    row.addEventListener('dragover', function(e) {

      if (e.dataTransfer.types.indexOf('ns-step') === -1) return;

      e.preventDefault(); e.stopPropagation();

      var rect = row.getBoundingClientRect();

      var before = (e.clientY - rect.top) < rect.height / 2;

      el.querySelectorAll('.kcard-step-row').forEach(function(r){ r.classList.remove('kcs-drop-above','kcs-drop-below'); });

      row.classList.add(before ? 'kcs-drop-above' : 'kcs-drop-below');

      row._nsInsertBefore = before;

    });

    row.addEventListener('dragleave', function(){ row.classList.remove('kcs-drop-above','kcs-drop-below'); });

    row.addEventListener('dragend', function(){

      el.querySelectorAll('.kcard-step-row').forEach(function(r){ r.classList.remove('kcs-dragging','kcs-drop-above','kcs-drop-below'); });

    });

    row.addEventListener('drop', function(e) {

      e.preventDefault(); e.stopPropagation();

      var before = row._nsInsertBefore !== false;

      el.querySelectorAll('.kcard-step-row').forEach(function(r){ r.classList.remove('kcs-drop-above','kcs-drop-below','kcs-dragging'); });

      if (_nsGlobalDragSrc === null || _nsGlobalDragSrc === idx) return;

      var moved = _newSubs.splice(_nsGlobalDragSrc, 1)[0];

      var newIdx = before ? idx : idx + 1;

      if (_nsGlobalDragSrc < idx) newIdx = before ? idx - 1 : idx;

      if (newIdx < 0) newIdx = 0;

      _newSubs.splice(newIdx, 0, moved);

      _nsGlobalDragSrc = null;

      renderNewSubList();

    });

    // Checkbox toggle

    chk.addEventListener('click', function(e) {

      e.stopPropagation();

      s.done = !s.done;

      chk.classList.toggle('done', s.done);

      var txt = row.querySelector('.kcard-step-txt');

      if (txt) txt.classList.toggle('done-step', s.done);

    });

  });

}

function updateNewSub(i, text) {

  if (_newSubs[i]) _newSubs[i].title = (text || '').trim() || _newSubs[i].title;

}

var _nsGlobalDragSrc = null;

function remNewSub(i){ _newSubs.splice(i,1); renderNewSubList(); }

// ===== CUSTOM REMINDER PANEL =====

var _customReminderMinutes = 60;

function onReminderChange(val) {

  var panel = document.getElementById('reminder-custom-panel');

  if (val === 'custom') { panel.style.display = 'block'; buildCustomReminder(); }

  else { panel.style.display = 'none'; _customReminderMinutes = null; }

}

function buildCustomReminder() {

  var num = parseInt(document.getElementById('reminder-custom-num').value, 10) || 1;

  var unit = document.getElementById('reminder-custom-unit').value;

  var mins = unit === 'minutes' ? num : unit === 'hours' ? num*60 : unit === 'days' ? num*1440 : num*10080;

  _customReminderMinutes = mins;

}

function getReminderMinutes() {

  var sel = document.getElementById('t-reminder');

  if (!sel) return null;

  if (sel.value === 'custom') return _customReminderMinutes;

  if (sel.value === '') return null;

  return parseInt(sel.value, 10);

}

// ===== CUSTOM RRULE BUILDER =====

var _customRrule = '';

function onRruleChange(val) {

  var panel = document.getElementById('rrule-custom-panel');

  if (val === 'custom') { panel.style.display = 'block'; buildCustomRrule(); updateRruleFreqLabel(); }

  else { panel.style.display = 'none'; _customRrule = ''; }

}

function updateRruleFreqLabel() {

  var freq = document.getElementById('rrule-freq') ? document.getElementById('rrule-freq').value : 'WEEKLY';

  var daysRow = document.getElementById('rrule-days-row');

  var moRow = document.getElementById('rrule-monthly-row');

  if (daysRow) daysRow.style.display = (freq === 'WEEKLY') ? 'block' : 'none';

  if (moRow) moRow.style.display = (freq === 'MONTHLY') ? 'block' : 'none';

  buildCustomRrule();

}

function toggleRruleDay(btn) {

  btn.classList.toggle('active');

  buildCustomRrule();

}

function buildCustomRrule() {

  var freq = (document.getElementById('rrule-freq') || {value:'WEEKLY'}).value;

  var interval = parseInt((document.getElementById('rrule-interval') || {value:'1'}).value, 10) || 1;

  var parts = ['FREQ=' + freq];

  if (interval > 1) parts.push('INTERVAL=' + interval);

  if (freq === 'WEEKLY') {

    var days = [];

    document.querySelectorAll('.rrule-day-btn.active').forEach(function(b){ days.push(b.getAttribute('data-day')); });

    if (days.length) parts.push('BYDAY=' + days.join(','));

  }

  if (freq === 'MONTHLY') {

    var mtype = (document.getElementById('rrule-monthly-type') || {value:'bymonthday'}).value;

    var mday = (document.getElementById('rrule-monthly-day') || {value:'MO'}).value;

    if (mtype !== 'bymonthday') {

      var posMap = {'byday-1st':'1','byday-2nd':'2','byday-3rd':'3','byday-4th':'4','byday-last':'-1'};

      var pos = posMap[mtype] || '1';

      parts.push('BYDAY=' + pos + mday);

    }

  }

  _customRrule = parts.join(';');

  var freqLabel = {DAILY:'day',WEEKLY:'week',MONTHLY:'month',YEARLY:'year'}[freq] || freq.toLowerCase();

  var preview = 'Every ' + (interval > 1 ? interval + ' ' + freqLabel + 's' : freqLabel);

  if (freq === 'WEEKLY') {

    var dayNames = {MO:'Mon',TU:'Tue',WE:'Wed',TH:'Thu',FR:'Fri',SA:'Sat',SU:'Sun'};

    var activeDays = [];

    document.querySelectorAll('.rrule-day-btn.active').forEach(function(b){ activeDays.push(dayNames[b.getAttribute('data-day')]||b.getAttribute('data-day')); });

    if (activeDays.length) preview += ' on ' + activeDays.join(', ');

  }

  var prev = document.getElementById('rrule-preview');

  if (prev) prev.textContent = preview;

}

function getEffectiveRrule(originKey) {

  var sel = document.getElementById('t-rrule');

  if (!sel || sel.value === '') return '';

  if (sel.value !== 'custom') return sel.value;

  var mtype = document.getElementById('rrule-monthly-type') ? document.getElementById('rrule-monthly-type').value : '';

  if (mtype === 'bymonthday' && _customRrule.indexOf('MONTHLY') >= 0) {

    var d = new Date(originKey + 'T12:00:00');

    return _customRrule + ';BYMONTHDAY=' + d.getDate();

  }

  return _customRrule;

}

// ===== RECURRENCE EXPANSION =====

function expandRecurringTask(task, originKey) {

  var rrule = task.rrule || '';

  if (!rrule) return;

  var origin = new Date(originKey + 'T12:00:00');

  var endRange = new Date(origin); endRange.setFullYear(endRange.getFullYear() + 2);

  var freq = 'DAILY', byDay = null;

  var parts = rrule.split(';');

  parts.forEach(function(p) {

    if (p.indexOf('FREQ=') === 0) freq = p.replace('FREQ=','');

    if (p.indexOf('BYDAY=') === 0) byDay = p.replace('BYDAY=','').split(',');

  });

  var dayMap = {SU:0,MO:1,TU:2,WE:3,TH:4,FR:5,SA:6};

  var cur = new Date(origin);

  var limit = 730; var count = 0;

  while (cur <= endRange && count < limit) {

    var step = freq === 'DAILY' ? 1 : freq === 'WEEKLY' ? 7 : freq === 'MONTHLY' ? 0 : 1;

    if (freq === 'MONTHLY') { cur.setMonth(cur.getMonth()+1); } else { cur.setDate(cur.getDate()+step); }

    if (cur <= origin) continue;

    if (byDay) {

      var dow = cur.getDay();

      var match = byDay.some(function(d){ return dayMap[d] === dow; });

      if (!match) { count++; continue; }

    }

    var dk = cur.getFullYear()+'-'+('0'+(cur.getMonth()+1)).slice(-2)+'-'+('0'+cur.getDate()).slice(-2);

    if (!_tasks[dk]) _tasks[dk] = [];

    // Avoid duplicates

    var exists = _tasks[dk].some(function(t){ return t.recurId === task.id; });

    if (!exists) _tasks[dk].push({id:_nextTaskId++,recurId:task.id,title:task.title,time:task.time,endTime:task.endTime,done:false,color:task.color,subtasks:[],reminder:task.reminder,rrule:'',originDate:task.originDate,isRecurring:true});

    count++;

  }

}

// ===== BROWSER NOTIFICATION REMINDERS =====

function scheduleTaskReminder(task, dateKey) {

  var minsBefore = parseInt(task.reminder, 10);

  if (isNaN(minsBefore) && task.reminder !== '0') return;

  if (task.reminder === '') return;

  var timeParts = (task.time || '09:00').split(':');

  var taskHr = parseInt(timeParts[0],10), taskMin = parseInt(timeParts[1]||'0',10);

  var taskDate = new Date(dateKey + 'T00:00:00');

  taskDate.setHours(taskHr, taskMin, 0, 0);

  var fireAt = new Date(taskDate.getTime() - minsBefore * 60000);

  var msUntil = fireAt.getTime() - Date.now();

  if (msUntil < 0) return; // already past

  requestNotifPermission(function(granted) {

    if (!granted) return;

    setTimeout(function() {

      var label = minsBefore === 0 ? 'Now: ' : (minsBefore + ' min: ');

      new Notification('\u23f0 Reminder: ' + task.title, {

        body: label + (task.time || '') + (dateKey ? ' on ' + dateKey : ''),

        icon: '/favicon.ico'

      });

    }, msUntil);

  });

}

// Re-schedule all saved reminders on page load

function rescheduleAllReminders() {

  Object.keys(_tasks || {}).forEach(function(dk) {

    (_tasks[dk] || []).forEach(function(t) {

      if (t.reminder && t.reminder !== '' && !t.isRecurring) scheduleTaskReminder(t, dk);

    });

  });

}

// ===== SCHEDULE/LIST VIEW =====
function saveTask(){

  var title=(document.getElementById('t-title').value||'').trim();

  if(!title){alert('Please enter a task title.');return;}

  var dateInp = document.getElementById('addtask-date-input'); var key = (dateInp && dateInp.value) ? dateInp.value : (_addTaskDate || tbDateKey(new Date()));

  var reminderMins = getReminderMinutes();

  var reminderVal = (reminderMins !== null && reminderMins !== undefined) ? String(reminderMins) : '';

  var rruleVal = getEffectiveRrule(key);

  var taskObj = {id:_nextTaskId++,title:title,time:getPickedTime(),endTime:getPickedEndTime(),done:false,color:_selectedTaskColor,subtasks:_newSubs.slice(),reminder:reminderVal,rrule:rruleVal,originDate:key};

  if(!_tasks[key])_tasks[key]=[];

  _tasks[key].push(taskObj);

  // Expand recurrence into visible range (2 years forward)

  if (rruleVal) expandRecurringTask(taskObj, key);

  // Schedule browser notification reminder

  if (reminderVal !== '') scheduleTaskReminder(taskObj, key);

  _newSubs=[];

  var subInp=document.getElementById('new-sub-input'); if(subInp) subInp.value='';

  document.getElementById('t-title').value='';

  closeModal('addtask');

  renderGCal();


  saveData();

}

// ===== CALENDAR (monthly overview page) =====

function tbDateKey(d){ return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate()); }


// --- window exports ---
if (typeof setAMPM_td !== 'undefined') window.setAMPM_td = setAMPM_td;
if (typeof setEndAMPM_td !== 'undefined') window.setEndAMPM_td = setEndAMPM_td;
if (typeof autoToggleAMPM_td !== 'undefined') window.autoToggleAMPM_td = autoToggleAMPM_td;
if (typeof getTdPickedTime !== 'undefined') window.getTdPickedTime = getTdPickedTime;
if (typeof getTdPickedEndTime !== 'undefined') window.getTdPickedEndTime = getTdPickedEndTime;
if (typeof buildTdColorPicker !== 'undefined') window.buildTdColorPicker = buildTdColorPicker;
if (typeof pickTdColor !== 'undefined') window.pickTdColor = pickTdColor;
if (typeof tdAddSub !== 'undefined') window.tdAddSub = tdAddSub;
if (typeof remTdSub !== 'undefined') window.remTdSub = remTdSub;
if (typeof updateTdSub !== 'undefined') window.updateTdSub = updateTdSub;
if (typeof tdSave !== 'undefined') window.tdSave = tdSave;
if (typeof tdDelete !== 'undefined') window.tdDelete = tdDelete;
if (typeof openAddTaskModal !== 'undefined') window.openAddTaskModal = openAddTaskModal;
if (typeof addTaskDateChanged !== 'undefined') window.addTaskDateChanged = addTaskDateChanged;
if (typeof addNewSub !== 'undefined') window.addNewSub = addNewSub;
if (typeof updateNewSub !== 'undefined') window.updateNewSub = updateNewSub;
if (typeof remNewSub !== 'undefined') window.remNewSub = remNewSub;
if (typeof onReminderChange !== 'undefined') window.onReminderChange = onReminderChange;
if (typeof buildCustomReminder !== 'undefined') window.buildCustomReminder = buildCustomReminder;
if (typeof onRruleChange !== 'undefined') window.onRruleChange = onRruleChange;
if (typeof updateRruleFreqLabel !== 'undefined') window.updateRruleFreqLabel = updateRruleFreqLabel;
if (typeof toggleRruleDay !== 'undefined') window.toggleRruleDay = toggleRruleDay;
if (typeof scheduleTaskReminder !== 'undefined') window.scheduleTaskReminder = scheduleTaskReminder;
if (typeof rescheduleAllReminders !== 'undefined') window.rescheduleAllReminders = rescheduleAllReminders;
if (typeof saveTask !== 'undefined') window.saveTask = saveTask;
if (typeof renderTdSubList !== 'undefined') window.renderTdSubList = renderTdSubList;
if (typeof renderNewSubList !== 'undefined') window.renderNewSubList = renderNewSubList;
