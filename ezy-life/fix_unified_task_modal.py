import re, time, sys

src = r"C:\Users\BIG D\.openclaw\workspace\ezy-life\index.html"
with open(src, 'r', encoding='utf-8') as f:
    c = f.read()

ok = True
misses = []
def patch(label, old, new):
    global c, ok
    if old in c:
        c = c.replace(old, new, 1)
        sys.stdout.buffer.write(f"OK: {label}\n".encode('utf-8'))
    else:
        sys.stdout.buffer.write(f"MISS: {label}\n".encode('utf-8'))
        misses.append(label)
        ok = False

# ══════════════════════════════════════════════════════════════════════════════
# 1. Replace the stripped modal-taskdetail HTML with a full unified edit modal
# ══════════════════════════════════════════════════════════════════════════════

OLD_MODAL = '''<!-- TASK DETAIL / EDIT -->
<div class="modal-overlay" id="modal-taskdetail" style="display:none">
  <div class="modal">
    <button class="close-btn" onclick="closeModal('taskdetail')">&#10005;</button>
    <div class="modal-title" id="td-title-display">Task Detail</div>
    <div class="modal-sub" id="td-time-display"></div>
    <div class="form-group" style="margin-bottom:12px">
      <label class="form-label">Title</label>
      <input class="form-input" id="td-title-input" placeholder="Task title">
    </div>
    <div id="td-subs-section" style="margin-bottom:12px"></div>
    <div class="modal-footer">
      <button class="btn btn-outline btn-sm" onclick="tdDelete()" style="color:var(--red);border-color:rgba(248,81,73,.3);margin-right:auto">??? Delete</button>
      <button class="btn btn-outline" onclick="closeModal('taskdetail')">Close</button>
      <button class="btn btn-primary" onclick="tdSave()">&#10003; Save</button>
    </div>
  </div>
</div>'''

NEW_MODAL = '''<!-- TASK DETAIL / EDIT (unified with Add Task) -->
<div class="modal-overlay" id="modal-taskdetail" style="display:none">
  <div class="modal">
    <button class="close-btn" onclick="closeModal('taskdetail')">&#10005;</button>
    <div class="modal-title">&#9998; Edit Task</div>
    <div class="modal-sub" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">Date: <input type="date" id="td-date-input" style="border:2px solid var(--accent2);border-radius:10px;padding:8px 16px;font-size:18px;font-weight:700;color:#ffffff;background:var(--card);cursor:pointer;outline:none;min-width:180px;min-height:42px;" onclick="try{this.showPicker()}catch(e){}"></div>
    <div class="form-grid">
      <div class="form-group form-full"><label class="form-label">Task Title</label><input class="form-input" id="td-title-input" placeholder="Task title"></div>
      <div class="form-group form-full">
        <div style="font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Sub-Tasks <span style="font-weight:400;text-transform:none">(optional)</span></div>
        <div id="td-sub-list" style="margin-bottom:8px"></div>
        <div style="display:flex;gap:8px">
          <input class="form-input" id="td-sub-input" placeholder="Add a sub-task..." style="flex:1" onkeydown="if(event.key==='Enter'){event.preventDefault();tdAddSub()}">
          <button class="btn btn-outline btn-sm" onclick="tdAddSub()">+ Add</button>
        </div>
      </div>
      <div class="form-group form-full">
        <label class="form-label">Start Time</label>
        <div class="time-picker-row">
          <input type="number" id="td-hr" class="time-unit" value="9" placeholder="9" data-prev="9" oninput="autoToggleAMPM_td('start',this)">
          <span class="time-sep">:</span>
          <input type="number" id="td-min" class="time-unit" value="0" placeholder="00" data-prev="0" oninput="autoToggleAMPM_td('start',this)">
          <div class="ampm-group">
            <button type="button" class="ampm-btn active" id="td-am-btn" onclick="setAMPM_td('AM')">AM</button>
            <button type="button" class="ampm-btn" id="td-pm-btn" onclick="setAMPM_td('PM')">PM</button>
          </div>
        </div>
      </div>
      <div class="form-group form-full">
        <label class="form-label">End Time</label>
        <div class="time-picker-row">
          <input type="number" id="td-ehr" class="time-unit" value="10" placeholder="10" data-prev="10" oninput="autoToggleAMPM_td('end',this)">
          <span class="time-sep">:</span>
          <input type="number" id="td-emin" class="time-unit" value="0" placeholder="00" data-prev="0" oninput="autoToggleAMPM_td('end',this)">
          <div class="ampm-group">
            <button type="button" class="ampm-btn active" id="td-eam-btn" onclick="setEndAMPM_td('AM')">AM</button>
            <button type="button" class="ampm-btn" id="td-epm-btn" onclick="setEndAMPM_td('PM')">PM</button>
          </div>
        </div>
      </div>
      <div class="form-group form-full">
        <label class="form-label">Event Color</label>
        <div class="color-picker-row" id="td-color-picker"></div>
      </div>
      <div class="form-group form-full">
        <label class="form-label">&#128276; Reminder</label>
        <select class="form-input" id="td-reminder" style="cursor:pointer">
          <option value="">No reminder</option>
          <option value="0">At time of event</option>
          <option value="5">5 minutes before</option>
          <option value="10" selected>10 minutes before</option>
          <option value="15">15 minutes before</option>
          <option value="30">30 minutes before</option>
          <option value="60">1 hour before</option>
          <option value="120">2 hours before</option>
        </select>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline btn-sm" onclick="tdDelete()" style="color:var(--red);border-color:rgba(248,81,73,.3);margin-right:auto">&#10005; Delete</button>
      <button class="btn btn-outline" onclick="closeModal('taskdetail')">Cancel</button>
      <button class="btn btn-primary" onclick="tdSave()">&#10003; Save</button>
    </div>
  </div>
</div>'''

patch("replace modal-taskdetail HTML", OLD_MODAL, NEW_MODAL)

# ══════════════════════════════════════════════════════════════════════════════
# 2. Fix renderNewSubList — replace corrupted ? with &#10005; and add drag handle
# ══════════════════════════════════════════════════════════════════════════════

# First find the full renderNewSubList
OLD_RNSB = "function renderNewSubList(){ var el=document.getElementById('new-sub-list'); el.innerHTML=_newSubs.length===0?'<div style=\"font-size:12px;color:var(--text3);padding:4px 0 6px\">No sub-tasks yet.</div>':_newSubs.map(function(s,i){ return '<div style=\"display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)\"><span style=\"font-size:13px;flex:1\">&bull;  '+esc(s.title)+'</span><button class=\"btn btn-outline btn-sm\" onclick=\"remNewSub('+i+')\" style=\"padding:2px 6px;color:var(--red)\">?</button></div>'; }).join(''); }"
NEW_RNSB = """function renderNewSubList() {
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
var _nsGlobalDragSrc = null;"""

patch("renderNewSubList: drag handles + clean X button", OLD_RNSB, NEW_RNSB)

# ══════════════════════════════════════════════════════════════════════════════
# 3. Replace gcalOpenTask with full pre-fill logic
# ══════════════════════════════════════════════════════════════════════════════

OLD_GCO = """function gcalOpenTask(dk, tid) {
  var t = (_tasks[dk]||[]).find(function(x){return x.id===tid;});
  if (!t) return;
  _editingTaskDk = dk; _editingTaskId = tid;
  document.getElementById('td-title-input').value = t.title;
  document.getElementById('td-title-display').textContent = t.title;
  document.getElementById('td-time-display').textContent = fmt12(t.time)+(t.endTime?' - '+fmt12(t.endTime):'')+' &ndash; '+fmtDate(dk);
  // Subtasks
  var sec = document.getElementById('td-subs-section');
  if (t.subtasks && t.subtasks.length) {
    sec.innerHTML = '<div style="font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Sub-Tasks</div>'
      +t.subtasks.map(function(s,i){
        return '<div class="step-row">'
          +'<div class="step-check'+(s.done?' done':'')+'"></div>'
          +'<span class="step-text"'+(s.done?' style="text-decoration:line-through;color:var(--text3)"':'')+'>'+esc(s.title)+'</span>'
          +'</div>';
      }).join('');
  } else {
    sec.innerHTML = '';
  }
  showModal('taskdetail');
}"""

NEW_GCO = """function gcalOpenTask(dk, tid) {
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

  // Sub-tasks — copy into _tdSubs
  _tdSubs = (t.subtasks || []).map(function(s){ return {id:s.id||(_subIdCtr++),title:s.title,done:!!s.done,rdate:s.rdate||null}; });
  renderTdSubList();

  // Time: parse "HH:MM" → h12 + am/pm
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
}"""

patch("gcalOpenTask: full pre-fill", OLD_GCO, NEW_GCO)

# ══════════════════════════════════════════════════════════════════════════════
# 4. Replace tdSave with full save logic
# ══════════════════════════════════════════════════════════════════════════════

OLD_TDSAVE = """function tdSave() {
  if (!_editingTaskDk) return;
  var t = (_tasks[_editingTaskDk]||[]).find(function(x){return x.id===_editingTaskId;});
  if (!t) return;
  t.title = (document.getElementById('td-title-input').value||'').trim() || t.title;
  closeModal('taskdetail');
  renderGCal();
}"""

NEW_TDSAVE = """function tdSave() {
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
  renderCalendar();
}"""

patch("tdSave: full save", OLD_TDSAVE, NEW_TDSAVE)

# ══════════════════════════════════════════════════════════════════════════════
# 5. Inject td* helper vars + functions (AM/PM, color, sub-tasks)
# ══════════════════════════════════════════════════════════════════════════════

TD_HELPERS = """
// ===== TASK DETAIL (EDIT) MODAL HELPERS =====
var _tdIsPM = false;
var _tdIsEndPM = false;
var _tdTaskColor = '#1f6feb';
var _tdSubs = [];
var _tdGlobalDragSrc = null;

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
    return '<button type="button" class="color-swatch" style="background:'+col+';width:28px;height:28px;border-radius:50%;border:none;cursor:pointer;margin:2px"'+active+' onclick="pickTdColor(\''+col+'\')"></button>';
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
"""

patch("inject td helpers before tdSave",
    "function tdSave() {",
    TD_HELPERS + "function tdSave() {")

# ══════════════════════════════════════════════════════════════════════════════
# 6. Fix ?? / corrupted characters in Reassign modal + any remaining spots
# ══════════════════════════════════════════════════════════════════════════════

patch("fix reassign modal title corruption",
    '<div class="modal-title">?? Reassign Sub-Task</div>',
    '<div class="modal-title">&#128197; Reassign Sub-Task</div>')

patch("fix reassign confirm button",
    ">Reassign ?</button>",
    ">Reassign &#10003;</button>")

patch("fix add task modal title corruption",
    '<div class="modal-title">? Add Task</div>',
    '<div class="modal-title">&#43; Add Task</div>')

# ══════════════════════════════════════════════════════════════════════════════
# 7. Bump version
# ══════════════════════════════════════════════════════════════════════════════
ts = int(time.time() * 1000)
c = re.sub(r'<!-- v\d+ -->', f'<!-- v{ts} -->', c)
with open(src, 'w', encoding='utf-8') as f:
    f.write(c)
sys.stdout.buffer.write(f"Version: v{ts}. Length: {len(c)}\n".encode('utf-8'))
if misses:
    sys.stdout.buffer.write(f"MISSED: {misses}\n".encode('utf-8'))
    sys.exit(1)
sys.stdout.buffer.write(b"All OK\n")
