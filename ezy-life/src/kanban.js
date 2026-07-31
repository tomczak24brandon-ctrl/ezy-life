
function renderKanban() {

  renderGoalsDashboard();

  renderGoalsYearOverview();

  var board = document.getElementById('kanban-board');

  board.innerHTML = '';

  categories.forEach(function(cat) {

    var catGoals = goals.filter(function(g){ return g.catId === cat.id && !(g.progress >= 100 && g.completedAt); });

    var col = document.createElement('div');

    col.className = 'kanban-col';

    col.dataset.catId = cat.id;

    col.draggable = true;

    col.addEventListener('dragstart', function(e) {

      if (e.target !== col && !e.target.classList.contains('kanban-col-header')) return;

      _colDragSrc = Array.from(board.children).indexOf(col);

      e.dataTransfer.setData('colmove','1');

      e.dataTransfer.effectAllowed='move';

      setTimeout(function(){ col.style.opacity='0.4'; },0);

    });

    col.addEventListener('dragend', function() {

      col.style.opacity='';

      board.querySelectorAll('.kanban-col').forEach(function(c){c.classList.remove('drag-over-col');});

    });

    col.ondragover = function(e){ e.preventDefault(); col.classList.add('drag-over-col'); };

    col.ondragleave = function(){ col.classList.remove('drag-over-col'); };

    col.ondrop = function(e){

      e.preventDefault(); col.classList.remove('drag-over-col');

      if (e.dataTransfer.getData('colmove')==='1' && _colDragSrc!==null) {

        var toIdx=Array.from(board.children).indexOf(col);

        if(toIdx!==_colDragSrc){ var m=categories.splice(_colDragSrc,1)[0]; categories.splice(toIdx,0,m); _colDragSrc=null; renderKanban(); } return;

      }

      kbDrop(e, cat.id);

    };

    var hdr = '<div class="kanban-col-header" style="cursor:grab"><span class="kanban-col-emoji">'+cat.emoji+'</span><span class="kanban-col-name">'+esc(cat.name)+'</span><span class="kanban-col-count">'+catGoals.length+'</span></div>';

    var body = '<div class="kanban-col-body" id="kb-body-'+cat.id+'">';

    catGoals.forEach(function(g) {

      body += buildKCard(g);

    });

    body += '<div class="kanban-add-card" onclick="openAddGoalModal('+cat.id+')">+ Add Goal</div>';

    body += '</div>';

    col.innerHTML = hdr + body;

    board.appendChild(col);

    catGoals.forEach(function(g){ renderKCardSteps(g.id); });

  });

  updateGoalsCount();

}

function buildKCard(g) {

  var dateStr = g.targetDate ? '<div class="kcard-date">\uD83D\uDCC5 '+fmtDate(g.targetDate)+'</div>' : '';

  var chevronId = 'kchev-'+g.id;

  var stepsId = 'kcs-'+g.id;

  var isDone = g.progress >= 100;

  var kStatus = isDone ? '' : getGoalStatus(g);

  var kStatusClass = kStatus ? ' status-'+kStatus : '';

  return '<div class="kanban-card'+kStatusClass+'" draggable="true" data-gid="'+g.id+'" ondragstart="kbDragStart(event,'+g.id+')" ondragover="kbCardDragOver(event)" ondrop="kbCardDrop(event,'+g.id+')" ondragleave="kbCardDragLeave(event)" onclick="if(!event.target.closest(\'.kcard-steps\')&&!event.target.closest(\'.kcard-chevron\')&&!event.target.closest(\'.kcard-done-chk\')&&!event.target.closest(\'.kcard-edit-btn\'))openGoalDetail('+g.id+')">'

    +'<div class="kcard-title" style="display:flex;align-items:center;gap:4px">'

    +'<span style="flex:1;min-width:0">'+esc(g.title)+'</span>'

    +'<input type="checkbox" class="kcard-done-chk" title="Mark goal complete" '+(isDone?'checked':'')+' onclick="event.stopPropagation();kcardComplete('+g.id+',this)" />'

    +'<button class="kcard-edit-btn" onclick="event.stopPropagation();openEditGoalModal('+g.id+')" title="Edit goal">&#9998;</button>'

    +'<button class="kcard-chevron" id="'+chevronId+'" onclick="event.stopPropagation();kcardToggle(\'' + g.id + '\')" title="Expand/collapse tasks">?</button>'

    +'</div>'

    +'<div class="kcard-bar"><div class="kcard-fill" id="kcs-bar-'+g.id+'" style="width:'+g.progress+'%"></div></div>'

    +'<div class="kcard-meta"><span class="kcard-pct" id="kcs-pct-'+g.id+'">'+g.progress+'%</span>'+dateStr+'</div>'

    +'<div class="kcard-steps" id="'+stepsId+'"></div>'

    +'</div>';

}

function kcardComplete(gid, chk) {

  var g = goals.find(function(x){ return x.id === gid; });

  if (!g) return;

  var checking = chk ? chk.checked : !(g.progress >= 100 && g.completedAt);

  if (checking) {

    // Confirm before archiving

    var ok = confirm('Mark "' + g.title + '" as 100% complete and move it to Completed Goals?');

    if (!ok) {

      // Revert checkbox to unchecked state without doing anything

      if (chk) chk.checked = false;

      return;

    }

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

}

function kcardToggle(gid) {

  var steps = document.getElementById('kcs-' + gid);

  var chev  = document.getElementById('kchev-' + gid);

  if (!steps) return;

  var collapsed = steps.classList.toggle('collapsed');

  if (chev) chev.textContent = collapsed ? '?' : '?';

}

function renderKCardSteps(gid) {

  var wrap = document.getElementById('kcs-' + gid);

  if (!wrap) return;

  var g = goals.find(function(x){ return x.id === gid; });

  if (!g || !g.steps || g.steps.length === 0) { wrap.innerHTML = ''; return; }

  wrap.innerHTML = '';

  var arr = g.steps;

  var dragSrcIdx = null;

  arr.forEach(function(step, idx) {

    var row = document.createElement('div');

    row.className = 'kcard-step-row';

    row.draggable = false;

    // Drag handle

    var hdl = document.createElement('span');

    hdl.className = 'kcard-step-hdl';

    hdl.innerHTML = '&#x22EE;&#x22EE;';

    hdl.title = 'Drag to reorder';

    hdl.draggable = true;

    // Checkbox

    var chk = document.createElement('div');

    chk.className = 'kcard-step-chk' + (step.done ? ' done' : '');

    // Text

    var txt = document.createElement('span');

    txt.className = 'kcard-step-txt' + (step.done ? ' done-step' : '');

    txt.contentEditable = 'true';

    txt.textContent = step.text;

    // Stop clicks on interactive elements from opening goal detail modal

    chk.addEventListener('click', function(e) {

      e.stopPropagation();

      step.done = !step.done;

      if (step.done) { chk.classList.add('done'); txt.classList.add('done-step'); }

      else { chk.classList.remove('done'); txt.classList.remove('done-step'); }

      // Recalc progress

      var doneCnt = arr.filter(function(s){ return s.done; }).length;

      var newPct = Math.round((doneCnt / arr.length) * 100);

      g.progress = newPct;

      if (newPct === 100 && !g.completedAt) { g.completedAt = Date.now(); }

      else if (newPct < 100) { g.completedAt = null; }

      saveData();

      renderKanban();

    });

    txt.addEventListener('click', function(e){ e.stopPropagation(); });

    txt.addEventListener('blur', function() {

      var val = txt.textContent.trim();

      if (val) { step.text = val; saveData(); }

      else { txt.textContent = step.text; }

    });

    txt.addEventListener('keydown', function(e) {

      if (e.key === 'Enter') { e.preventDefault(); txt.blur(); }

    });

    // DnD  scoped to this steps list, tagged kcs-step -- drag via handle only

    hdl.addEventListener('dragstart', function(e) {

      e.stopPropagation();

      dragSrcIdx = idx;

      row.draggable = true;

      e.dataTransfer.setData('kcs-step', String(gid));

      e.dataTransfer.effectAllowed = 'move';

      setTimeout(function(){ row.classList.add('kcs-dragging'); }, 0);

    });

    hdl.addEventListener('dragend', function() { row.draggable = false; });

    row.addEventListener('dragstart', function(e) {

      if (!row.draggable) { e.preventDefault(); e.stopPropagation(); return; }

      e.stopPropagation();

    });

    row.addEventListener('dragend', function() {

      row.classList.remove('kcs-dragging');

      wrap.querySelectorAll('.kcard-step-row').forEach(function(r){ r.classList.remove('kcs-drop-above','kcs-drop-below'); });

    });

    row.addEventListener('dragover', function(e) {

      if (e.dataTransfer.types.indexOf('kcs-step') === -1) return;

      e.preventDefault(); e.stopPropagation();

      var rect = row.getBoundingClientRect();

      var before = (e.clientY - rect.top) < rect.height / 2;

      wrap.querySelectorAll('.kcard-step-row').forEach(function(r){ r.classList.remove('kcs-drop-above','kcs-drop-below'); });

      row.classList.add(before ? 'kcs-drop-above' : 'kcs-drop-below');

      row._kcsInsertBefore = before;

    });

    row.addEventListener('dragleave', function() {

      row.classList.remove('kcs-drop-above');

    });

    row.addEventListener('drop', function(e) {

      e.preventDefault(); e.stopPropagation();

      var insertBefore = row._kcsInsertBefore !== false;

      row.classList.remove('kcs-drop-above','kcs-drop-below');

      if (dragSrcIdx === null || dragSrcIdx === idx) return;

      var moved = arr.splice(dragSrcIdx, 1)[0];

      var newIdx = insertBefore ? idx : idx + 1;

      if (dragSrcIdx < idx) newIdx = insertBefore ? idx - 1 : idx;

      if (newIdx < 0) newIdx = 0;

      if (newIdx > arr.length) newIdx = arr.length;

      arr.splice(newIdx, 0, moved);

      dragSrcIdx = null;

      g.steps = arr;

      saveData();

      renderKCardSteps(gid);

    });

    // Date picker for this step

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

    wrap.appendChild(row);

  });

}

var _kbDragGoalId = null;

var _colDragSrc = null;

function kbDragStart(e, gid) {

  _kbDragGoalId = gid;

  e.dataTransfer.effectAllowed = 'move';

  e.dataTransfer.setData('text/plain', String(gid));

  setTimeout(function(){

    var el = document.querySelector('.kanban-card[data-gid="'+gid+'"]');

    if(el) el.classList.add('dragging-card');

  },0);

}

function kbDrop(e, catId) {

  e.preventDefault();

  if (_kbDragGoalId === null) return;

  var g = goals.find(function(x){ return x.id === _kbDragGoalId; });

  if (g) g.catId = catId;

  _kbDragGoalId = null;

  document.querySelectorAll('.kanban-card').forEach(function(c){ c.classList.remove('dragging-card','drag-over-card'); });

  renderKanban();

}

function kbCardDragOver(e) {

  e.preventDefault(); e.stopPropagation();

  e.currentTarget.classList.add('drag-over-card');

}

function kbCardDragLeave(e) {

  e.currentTarget.classList.remove('drag-over-card');

}

function kbCardDrop(e, targetGid) {

  e.preventDefault(); e.stopPropagation();

  e.currentTarget.classList.remove('drag-over-card');

  if (_kbDragGoalId === null || _kbDragGoalId === targetGid) return;

  var srcIdx = goals.findIndex(function(g){ return g.id===_kbDragGoalId; });

  var tgtIdx = goals.findIndex(function(g){ return g.id===targetGid; });

  if (srcIdx<0||tgtIdx<0) return;

  var srcG = goals[srcIdx];

  // Move to same catId as target

  srcG.catId = goals[tgtIdx].catId;

  goals.splice(srcIdx,1);

  var newTgt = goals.findIndex(function(g){ return g.id===targetGid; });

  goals.splice(newTgt,0,srcG);

  _kbDragGoalId = null;

  renderKanban();

}


// --- window exports ---
if (typeof renderKanban !== 'undefined') window.renderKanban = renderKanban;
if (typeof kcardComplete !== 'undefined') window.kcardComplete = kcardComplete;
if (typeof kcardToggle !== 'undefined') window.kcardToggle = kcardToggle;
if (typeof kbDragStart !== 'undefined') window.kbDragStart = kbDragStart;
if (typeof kbDrop !== 'undefined') window.kbDrop = kbDrop;
if (typeof kbCardDragOver !== 'undefined') window.kbCardDragOver = kbCardDragOver;
if (typeof kbCardDragLeave !== 'undefined') window.kbCardDragLeave = kbCardDragLeave;
if (typeof kbCardDrop !== 'undefined') window.kbCardDrop = kbCardDrop;
