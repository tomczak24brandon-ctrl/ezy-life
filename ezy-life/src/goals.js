
function addGoalStep() {

  var inp = document.getElementById('g-step-input');

  var t = (inp.value||'').trim();

  if (!t) return;

  _gSteps.push({text:t, done:false});

  inp.value = '';

  renderGoalStepsList('g-steps-list', _gSteps, 'g');

}

function addDetailStep() {

  var inp = document.getElementById('gd-step-input');

  var t = (inp.value||'').trim();

  if (!t) return;

  _gdSteps.push({text:t, done:false});

  inp.value = '';

  renderGoalStepsList('gd-steps-list', _gdSteps, 'gd');

}

function toggleGoalStep(prefix, i) {

  var arr = prefix==='g' ? _gSteps : _gdSteps;

  arr[i].done = !arr[i].done;

  renderGoalStepsList(prefix+'-steps-list', arr, prefix);

  // For Goal Detail modal: recalc progress + auto-archive/restore immediately

  if (prefix === 'gd') {

    var g = goals.find(function(x){ return x.id === _editingGoalId; });

    if (g && arr.length > 0) {

      var doneCnt = arr.filter(function(s){ return s.done; }).length;

      var newPct  = Math.round((doneCnt / arr.length) * 100);

      // Strict gate: only archive at exactly 100%, restore below 100%

      if (newPct === 100 && g.progress < 100) g.completedAt = Date.now();

      if (newPct < 100) g.completedAt = undefined;

      g.progress = newPct;

      g.steps = arr.slice();

      // Update slider + label in modal to reflect new pct

      var sl = document.getElementById('gd-progress');

      var lb = document.getElementById('gd-pct-label');

      if (sl) sl.value = newPct;

      if (lb) lb.textContent = newPct + '%';

      saveData();

      renderKanban();

    }

  }

}

function deleteGoalStep(prefix, i) {

  var arr = prefix==='g' ? _gSteps : _gdSteps;

  arr.splice(i,1);

  renderGoalStepsList(prefix+'-steps-list', arr, prefix);

}

function renderGoalStepsList(elId, arr, prefix) {

  var el = document.getElementById(elId);

  if (!el) return;

  if (!arr || arr.length === 0) {

    el.innerHTML = '<div style="font-size:12px;color:var(--text3);padding:4px 0">No steps yet.</div>';

    return;

  }

  // Plain render for Add-Goal modal (prefix='g'); full drag+edit for Goal Detail (prefix='gd')

  if (prefix !== 'gd') {

    el.innerHTML = arr.map(function(s, i) {

      return '<div class="goal-step">' +

        '<span class="goal-step-num">' + (i+1) + '.</span>' +

        '<div class="goal-step-check' + (s.done ? ' done' : '') + '" onclick="toggleGoalStep(\'' + prefix + '\',' + i + ')"></div>' +

        '<span class="goal-step-text' + (s.done ? ' done-step' : '') + '">' + esc(s.text) + '</span>' +

        '<button class="goal-step-del" onclick="deleteGoalStep(\'' + prefix + '\',' + i + ')">\u2715</button>' +

      '</div>';

    }).join('');

    return;

  }

  // --- Goal Detail: DOM-built rows with inline edit + drag-to-reorder ---

  el.innerHTML = '';

  var dragSrcIdx = null;

  arr.forEach(function(s, i) {

    var row = document.createElement('div');

    row.className = 'goal-step';

    row.draggable = false;

    row.dataset.idx = i;

    // Drag handle

    var handle = document.createElement('span');

    handle.className = 'gd-step-drag';

    handle.innerHTML = '&#x22EE;&#x22EE;';

    handle.title = 'Drag to reorder';

    handle.draggable = true;

    // Step number

    var num = document.createElement('span');

    num.className = 'goal-step-num';

    num.textContent = (i + 1) + '.';

    // Checkbox

    var chk = document.createElement('div');

    chk.className = 'goal-step-check' + (s.done ? ' done' : '');

    (function(idx) {

      chk.addEventListener('click', function(e) { e.stopPropagation(); toggleGoalStep('gd', idx); });

    })(i);

    // Inline-editable text

    var txt = document.createElement('span');

    txt.className = 'gd-step-edit' + (s.done ? ' done-step' : '');

    txt.contentEditable = 'true';

    txt.spellcheck = false;

    txt.textContent = s.text;

    (function(idx) {

      txt.addEventListener('blur', function() {

        var val = (txt.textContent || '').trim();

        if (val) arr[idx].text = val;

        else txt.textContent = arr[idx].text;

      });

      txt.addEventListener('keydown', function(e) {

        e.stopPropagation();

        if (e.key === 'Enter') { e.preventDefault(); txt.blur(); }

        if (e.key === 'Escape') { txt.textContent = arr[idx].text; txt.blur(); }

      });

      // Prevent drag triggering while editing

      txt.addEventListener('mousedown', function(e) { e.stopPropagation(); });

    })(i);

    // Delete button

    var del = document.createElement('button');

    del.className = 'goal-step-del';

    del.textContent = '\u2715';

    (function(idx) {

      del.addEventListener('click', function(e) { e.stopPropagation(); deleteGoalStep('gd', idx); });

    })(i);

    row.appendChild(handle);

    row.appendChild(num);

    row.appendChild(chk);

    row.appendChild(txt);

    row.appendChild(del);

    // Drag events  only fire from handle or row background, not from contenteditable

    row.addEventListener('dragstart', function(e) {

      if (document.activeElement === txt) { e.preventDefault(); return; }

      dragSrcIdx = parseInt(row.dataset.idx, 10);

      row.draggable = true;

      e.dataTransfer.effectAllowed = 'move';

      e.dataTransfer.setData('gd-step', '1');

      setTimeout(function() { row.classList.add('gd-dragging'); }, 0);

    });

    handle.addEventListener('dragend', function() { row.draggable = false; });

    row.addEventListener('dragend', function() {

      row.classList.remove('gd-dragging');

      el.querySelectorAll('.goal-step').forEach(function(r) { r.classList.remove('gd-drop-above','gd-drop-below'); });

    });

    row.addEventListener('dragover', function(e) {

      if (!e.dataTransfer.types || !Array.from(e.dataTransfer.types).includes('gd-step')) return;

      e.preventDefault(); e.stopPropagation();

      var rect = row.getBoundingClientRect();

      var before = (e.clientY - rect.top) < rect.height / 2;

      el.querySelectorAll('.goal-step').forEach(function(r) { r.classList.remove('gd-drop-above','gd-drop-below'); });

      row._gdInsertBefore = before;

      row.classList.add(before ? 'gd-drop-above' : 'gd-drop-below');

    });

    row.addEventListener('dragleave', function() {

      row.classList.remove('gd-drop-above','gd-drop-below');

    });

    row.addEventListener('drop', function(e) {

      e.preventDefault(); e.stopPropagation();

      var insertBefore = row._gdInsertBefore !== false;

      row.classList.remove('gd-drop-above','gd-drop-below');

      var toIdx = parseInt(row.dataset.idx, 10);

      if (dragSrcIdx === null || dragSrcIdx === toIdx) { dragSrcIdx = null; return; }

      var moved = arr.splice(dragSrcIdx, 1)[0];

      var newToIdx = insertBefore ? toIdx : toIdx + 1;

      if (dragSrcIdx < toIdx) newToIdx = insertBefore ? toIdx - 1 : toIdx;

      if (newToIdx < 0) newToIdx = 0;

      if (newToIdx > arr.length) newToIdx = arr.length;

      arr.splice(newToIdx, 0, moved);

      dragSrcIdx = null;

      renderGoalStepsList(elId, arr, prefix);

    });

    el.appendChild(row);

  });

}

// ===== GOALS YEAR OVERVIEW =====

function renderGoalsDashboard() {

  var el = document.getElementById('goals-dashboard');

  if (!el) return;

  var allActive = goals.filter(function(g){ return g.progress < 100; });

  // Active Goals tab: show only the FIRST active goal per category (front-end display filter only)

  var seenCats = {};

  var active = allActive.filter(function(g) {

    if (seenCats[g.catId]) return false;

    seenCats[g.catId] = true;

    return true;

  });

  if (!active.length) {

    el.innerHTML = allActive.length > 0

      ? '<div class="gd-empty">? All goals complete! Check the <b>Archive</b> tab to see your achievements.</div>'

      : '<div class="gd-empty">No goals yet � add one with <b>+ Add Goal</b> above.</div>';

    return;

  }

  var html = '<div class="gd-section-label">Active Goals</div><div class="gd-grid">';

  active.forEach(function(g) {

    var cat = categories.find(function(c){ return c.id === g.catId; }) || { emoji: '?', name: 'General' };

    var steps = g.steps || [];

    var total = steps.length;

    var done = steps.filter(function(s){ return s.done; }).length;

    // Use manual progress slider; fall back to step ratio if steps exist and progress===0

    var pct = g.progress;

    if (pct === 0 && total > 0) pct = Math.round(done / total * 100);

    // Active Goals tab: show first INCOMPLETE task; fall back to first task if all done

    var firstIncomplete = steps.find(function(s){ return !s.done; }) || null;

    var firstStepIdx = firstIncomplete ? steps.indexOf(firstIncomplete) : -1;

    var firstTaskHtml;

    if (!steps.length) {

      // No tasks at all � placeholder

      firstTaskHtml = '<div class="gd-first-task" style="opacity:.6;cursor:pointer" onclick="openGoalDetail('+g.id+')">'

        + '<span style="font-size:1.05rem;color:var(--accent)">+ Add steps</span>'

        + '</div>';

    } else if (!firstIncomplete) {

      // All tasks done but goal not yet at 100%

      firstTaskHtml = '<div class="gd-first-task" style="opacity:.6">'

        + '<span style="font-size:1.05rem;color:var(--text3)">All steps complete</span>'

        + '</div>';

    } else {

      firstTaskHtml = '<div class="gd-first-task" onclick="event.stopPropagation()">'

        + '<div class="gd-task-chk' + (firstIncomplete.done ? ' done' : '') + '" onclick="gdDashToggleStep('+g.id+','+firstStepIdx+')"></div>'

        + '<span class="gd-task-text-lg' + (firstIncomplete.done ? ' done-step' : '') + '">'+esc(firstIncomplete.text)+'</span>'

        + '</div>';

    }

    var stepsMeta = total ? done+'/'+total+' steps' : '';

    var gStatus = getGoalStatus(g);

    var statusClass = gStatus ? ' status-'+gStatus : '';

    html += '<div class="gd-card'+statusClass+'" onclick="openGoalDetail('+g.id+')">';

    html += '<div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:2px">'

      +'<div class="gd-card-cat">'+cat.emoji+' '+esc(cat.name)+'</div>'

      +'<button class="kcard-edit-btn" onclick="event.stopPropagation();openEditGoalModal('+g.id+')" title="Edit goal" style="margin-top:-2px">&#9998;</button>'

      +'</div>';

    html += '<div class="gd-card-title">'+esc(g.title)+'</div>';

    if (g.targetDate) { var gtdLabel = fmtDate(g.targetDate); html += '<div style="font-size:10px;color:'+(gStatus==='overdue'?'var(--red)':'var(--text3)')+';margin-bottom:6px">📅 Goal due: '+gtdLabel+'</div>'; }

    html += '<div class="gd-bar-wrap"><div class="gd-bar-fill" style="width:'+pct+'%"></div></div>';

    html += '<div class="gd-bar-meta"><span class="gd-bar-pct">'+pct+'%</span><span class="gd-bar-steps">'+stepsMeta+'</span></div>';

    // Show ALL tasks with dates (not just first) in Active Goals tab

    if (!steps.length) {

      html += '<div class="gd-first-task" style="opacity:.6;cursor:pointer" onclick="event.stopPropagation();openGoalDetail('+g.id+')">'+'<span style="font-size:1.05rem;color:var(--accent)">+ Add steps</span></div>';

    } else {

      html += '<div class="gd-steps-list" onclick="event.stopPropagation()">';

      steps.forEach(function(s, si) {

        var sOverdue = checkStepOverdue(s);

        html += '<div class="gd-step-row">';

        html += '<div class="gd-task-chk'+(s.done?' done':'')+' " onclick="gdDashToggleStep('+g.id+','+si+')"></div>';

        html += '<span class="gd-task-text-lg'+(s.done?' done-step':'')+'">'+esc(s.text)+'</span>';

        html += '<input type="date" onclick="try{this.showPicker()}catch(e){}" style="cursor:pointer" class="gd-step-date'+(sOverdue?' overdue':'')+'" data-gid="'+g.id+'" data-si="'+si+'" value="'+(s.targetDate||'')+'" title="Task target date" onclick="event.stopPropagation()" onchange="gdDashStepDateChange(event)">';

        html += '</div>';

      });

      html += '</div>';

    }

    html += '</div>';

  });

  html += '</div>';

  el.innerHTML = html;

}

function renderGoalsYearOverview() {

  var el = document.getElementById('goals-year-overview');

  var cntEl = document.getElementById('goals-count');

  if (!el) return;

  // Only show goals that have been marked complete (progress===100 + completedAt timestamp)

  // Goals without completedAt but progress===100 get fallback year = current year

  var completed = goals.filter(function(g){ return g.progress === 100; });

  // Update subtitle

  if (cntEl) cntEl.textContent = completed.length + ' completed goal' + (completed.length !== 1 ? 's' : '');

  if (!completed.length) {

    el.innerHTML = '<div style="font-size:13px;color:var(--text3);padding:8px 0">No completed goals yet. Set a goal\'s progress to 100% to archive it here.</div>';

    return;

  }

  // Group by year derived from completedAt timestamp; fall back to current year

  var byYear = {};

  var curYear = new Date().getFullYear();

  completed.forEach(function(g) {

    var yr = g.completedAt ? new Date(g.completedAt).getFullYear() : curYear;

    if (!byYear[yr]) byYear[yr] = [];

    byYear[yr].push(g);

  });

  // Sort years newest-first  automatically handles any future year with zero code changes

  var years = Object.keys(byYear).map(Number).sort(function(a,b){ return b - a; });

  var html = '';

  years.forEach(function(yr) {

    var list = byYear[yr];

    var sectionId = 'arch-yr-' + yr;

    html += '<div class="arch-year-section">';

    html += '<div class="arch-year-hdr" onclick="archToggleYear(\''+sectionId+'\')">';

    html += '<span class="arch-year-label">'+yr+'</span>';

    html += '<span class="arch-year-count">'+list.length+' goal'+(list.length!==1?'s':'')+'</span>';

    html += '<span class="arch-year-arrow" id="'+sectionId+'-arrow">?</span>';

    html += '</div>';

    html += '<div class="arch-year-body" id="'+sectionId+'">';

    list.forEach(function(g) {

      var cat = categories.find(function(c){ return c.id === g.catId; }) || {emoji:'?',name:'General'};

      var dateStr = g.completedAt ? new Date(g.completedAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '';

      html += '<div class="year-goal-card" onclick="openGoalDetail('+g.id+')" style="border-color:var(--green,#3fb950);">';

      html += '<div class="year-goal-cat">'+cat.emoji+' '+esc(cat.name)+'<span style="color:var(--green,#3fb950);font-size:10px;font-weight:700;margin-left:6px">? Done</span>'+(dateStr?'<span style="color:var(--text3);font-size:10px;margin-left:6px">'+dateStr+'</span>':'')+'</div>';

      html += '<div class="year-goal-title">'+esc(g.title)+'</div>';

      html += '<div class="year-goal-bar"><div class="year-goal-fill" style="width:100%;background:var(--green,#3fb950)"></div></div>';

      html += '</div>';

    });

    html += '</div>';

    html += '</div>';

  });

  el.innerHTML = html;

}

function archToggleYear(sectionId) {

  var body = document.getElementById(sectionId);

  var arrow = document.getElementById(sectionId+'-arrow');

  if (!body) return;

  var collapsed = body.style.display === 'none';

  body.style.display = collapsed ? '' : 'none';

  if (arrow) arrow.textContent = collapsed ? '?' : '?';

}

// ===== MANAGE CATEGORIES MODAL =====

// ===== MCAT EMOJI PICKER HELPERS =====

var _mcatNewEmoji = null;

var _mcatNewIconUrl = null;

function openManageCatsModal() {

  renderMcatList();

  showModal('manage-cats');

  // Wire EP for the "new" row

  setTimeout(function() {

    buildEP('mcat-new', function(emoji) {

      _mcatNewEmoji = emoji;

      _mcatNewIconUrl = null;

      var btn = document.getElementById('mcat-new-ep-btn');

      if (btn) btn.innerHTML = emoji;

    });

  }, 0);

}

function openEditGoalModal(gid) {

  var g = goals.find(function(x){ return x.id===gid; });

  if (!g) return;

  _editingGoalId = gid;

  _gSteps = (g.steps||[]).map(function(s){ return Object.assign({},s); });

  var sel = document.getElementById('g-cat');

  sel.innerHTML = categories.map(function(c){ return '<option value="'+c.id+'"'+(g.catId===c.id?' selected':'')+'>'+c.emoji+' '+esc(c.name)+'</option>'; }).join('')

    + '<option value="__custom__">+ Add Custom Category</option>';

  document.getElementById('g-cat-custom-wrap').style.display='none';

  document.getElementById('g-title').value = g.title;

  document.getElementById('g-date').value = g.targetDate||'';

  renderGSteps();

  document.querySelector('#modal-addgoal .modal-title').innerHTML = '&#9998; Edit Goal';

  showModal('addgoal');

}

function openAddGoalModal(catId) {

  _editingGoalId = null;

  document.querySelector('#modal-addgoal .modal-title').innerHTML = '&#127919; Add Goal';

  _gSteps = [];

  var sel = document.getElementById('g-cat');

  sel.innerHTML = categories.map(function(c){ return '<option value="'+c.id+'"'+(catId===c.id?' selected':'')+'>'+c.emoji+' '+esc(c.name)+'</option>'; }).join('')

    + '<option value="__custom__">+ Add Custom Category</option>';

  document.getElementById('g-cat-custom-wrap').style.display='none';

  document.getElementById('g-title').value='';

  document.getElementById('g-date').value='';

  document.getElementById('g-step-input').value='';

  renderGoalStepsList('g-steps-list', _gSteps, 'g');

  showModal('addgoal');

  // Force-clear step input after browser autofill runs (autofill can fire after DOM update)

  setTimeout(function(){

    var inp = document.getElementById('g-step-input');

    if (inp) inp.value = '';

  }, 80);

}

function saveGoal() {

  var title = (document.getElementById('g-title').value||'').trim();

  if (!title){ alert('Please enter a goal title.'); return; }

  var catSel = document.getElementById('g-cat').value;

  var catId = parseInt(catSel, 10);

  if (isNaN(catId) || catSel === '__custom__') {

    alert('Please create or select a category first.');

    return;

  }

  var dateVal = document.getElementById('g-date').value;

  if (_editingGoalId) {

    // Edit mode � update existing goal

    var existing = goals.find(function(g){ return g.id === _editingGoalId; });

    if (existing) {

      existing.title = title;

      existing.catId = catId;

      existing.targetDate = dateVal;

      existing.steps = _gSteps.slice();

    }

    _editingGoalId = null;

  } else {

    goals.unshift({ id:Date.now(), title:title, catId:catId, targetDate:dateVal, steps:_gSteps.slice(), progress:0 });

  }

  _gSteps = [];

  closeModal('addgoal');

  renderKanban();

  renderGoalsYearOverview();

  updateGoalsCount();

  saveData();

}

function updateGoalsCount() {

  var el = document.getElementById('goals-count');

  if (el) el.textContent = goals.length + ' goal' + (goals.length!==1?'s':'');

}

// ===== PRINT =====

function checkStepOverdue(step) {

  if (!step.targetDate || step.done) return false;

  var today = new Date(); today.setHours(0,0,0,0);

  var d = new Date(step.targetDate + 'T00:00:00');

  return d < today;

}

// Returns 'overdue', 'healthy', or '' (no target dates set)

function getGoalStatus(g) {

  var today = new Date(); today.setHours(0,0,0,0);

  // Goal-level: no date = overdue/unscheduled

  if (!g.targetDate) return 'overdue';

  // Goal-level date past due

  var gd = new Date(g.targetDate + 'T00:00:00');

  if (gd < today && g.progress < 100) return 'overdue';

  // Check sub-task target dates

  var steps = g.steps || [];

  for (var i = 0; i < steps.length; i++) {

    var s = steps[i];

    if (!s.done) {

      // No date on incomplete step = overdue/unscheduled

      if (!s.targetDate) return 'overdue';

      var sd = new Date(s.targetDate + 'T00:00:00');

      if (sd < today) return 'overdue';

    }

  }

  return 'healthy';

}

// Returns first incomplete sub-task for goals shown in the Active Goals tab only.

// Mirrors renderGoalsDashboard: progress < 100, first goal per category (same filter as Active Goals tab).

function getActiveGoalTasks() {

  var result = [];

  var allActive = (goals || []).filter(function(g) { return g.progress < 100; });

  var seenCats = {};

  var activeGoals = allActive.filter(function(g) {

    if (seenCats[g.catId]) return false;

    seenCats[g.catId] = true;

    return true;

  });

  activeGoals.forEach(function(g) {

    var steps = g.steps || [];

    var firstIncomplete = null;

    for (var i = 0; i < steps.length; i++) {

      if (!steps[i].done) { firstIncomplete = steps[i]; break; }

    }

    var cat = (categories || []).find(function(c){ return c.id === g.catId; }) || { emoji: '🎯', name: 'Goal' };

    result.push({

      goalTitle: g.title,

      catEmoji: cat.emoji,

      catName: cat.name,

      taskText: firstIncomplete ? firstIncomplete.text : null,

      taskDate: firstIncomplete ? (firstIncomplete.targetDate || null) : (g.targetDate || null),

      progress: g.progress

    });

  });

  return result;

}

function getOverdueSteps() {

  var result = [];

  var today = new Date(); today.setHours(0,0,0,0);

  (goals||[]).forEach(function(g) {

    if (g.progress >= 100 && g.completedAt) return; // skip completed goals

    if (!g.steps) return;

    g.steps.forEach(function(s) {

      if (s.done) return;

      if (!s.targetDate) {

        // No date = unscheduled/overdue

        result.push({ goalTitle: g.title, stepText: s.text, targetDate: null, daysLate: null });

      } else {

        var d = new Date(s.targetDate + 'T00:00:00');

        if (d < today) result.push({ goalTitle: g.title, stepText: s.text, targetDate: s.targetDate, daysLate: Math.floor((today - d) / 86400000) });

      }

    });

  });

  return result;

}

function goalsShowOverdue() {

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

function getOverdueGoals() {

  var result = [];

  var today = new Date(); today.setHours(0,0,0,0);

  (goals||[]).forEach(function(g) {

    if (g.progress >= 100 && g.completedAt) return; // already complete

    if (!g.targetDate) {

      // No date = unscheduled/overdue

      result.push({ id: g.id, title: g.title, targetDate: null, daysLate: null, progress: g.progress });

    } else {

      var d = new Date(g.targetDate + 'T00:00:00');

      if (d < today) result.push({ id: g.id, title: g.title, targetDate: g.targetDate, daysLate: Math.floor((today - d) / 86400000), progress: g.progress });

    }

  });

  return result;

}

function openGoalDetail(gid) {

  var g = goals.find(function(x){ return x.id===gid; });

  if (!g) return;

  _editingGoalId = gid;

  var cat = categories.find(function(c){ return c.id===g.catId; }) || {emoji:'?',name:'General'};

  document.getElementById('gd-cat-badge').textContent = cat.emoji+' '+cat.name;

  document.getElementById('gd-title').value = g.title;

  document.getElementById('gd-progress').value = g.progress;

  document.getElementById('gd-pct-label').textContent = g.progress + '%';

  document.getElementById('gd-date').value = g.targetDate || '';

  _gdSteps = (g.steps || []).map(function(s){ return {text:s.text, done:s.done}; });

  document.getElementById('gd-step-input').value='';

  renderGoalStepsList('gd-steps-list', _gdSteps, 'gd');

  showModal('goaldetail');

}

function renderStepList(steps) {

  var el = document.getElementById('gd-steps');

  el.innerHTML = steps.length === 0 ? '<div style="font-size:12px;color:var(--text3);padding:4px 0 6px">No steps yet.</div>' :

    steps.map(function(s,i) {

      return '<div class="step-row">'

        +'<div class="step-check'+(s.done?' done':'')+'" onclick="gdToggleStep('+i+')"></div>'

        +'<input class="step-text" value="'+esc(s.text)+'" onchange="gdUpdateStepText('+i+',this.value)"'+(s.done?' style="text-decoration:line-through;color:var(--text3)"':'')+'>'

        +'<button class="step-del" onclick="gdDeleteStep('+i+')">?</button>'

        +'</div>';

    }).join('');

}

function gdAddStep() {

  var inp = document.getElementById('gd-new-step');

  var txt = (inp.value||'').trim();

  if (!txt) return;

  var g = goals.find(function(x){return x.id===_editingGoalId;});

  if (!g) return;

  if (!g.steps) g.steps = [];

  g.steps.push({id:Date.now(),text:txt,done:false});

  inp.value = '';

  renderStepList(g.steps);

}

// Dashboard card step toggle � marks step by index, recalculates progress, archives if 100%

function gdDashToggleStep(goalId, stepIdx) {

  var g = goals.find(function(x){ return x.id === goalId; });

  if (!g || !g.steps || !g.steps[stepIdx]) return;

  g.steps[stepIdx].done = !g.steps[stepIdx].done;

  // Recalculate progress from steps

  var total = g.steps.length;

  var doneCnt = g.steps.filter(function(s){ return s.done; }).length;

  var newPct = total > 0 ? Math.round(doneCnt / total * 100) : g.progress;

  if (newPct === 100 && g.progress < 100) g.completedAt = Date.now();

  if (newPct === 100 && !g.completedAt) g.completedAt = Date.now();

  if (newPct < 100) g.completedAt = undefined;

  g.progress = newPct;

  saveData();

  renderKanban();

}

function gdDashStepDateChange(e) {

  var inp = e.target;

  var gid = parseInt(inp.dataset.gid, 10);

  var si = parseInt(inp.dataset.si, 10);

  var g = goals.find(function(x){ return x.id === gid; });

  if (!g || !g.steps || !g.steps[si]) return;

  g.steps[si].targetDate = inp.value || undefined;

  saveData();

  renderKanban();

}

function gdToggleStep(i) {

  var g = goals.find(function(x){return x.id===_editingGoalId;});

  if (!g||!g.steps) return;

  g.steps[i].done = !g.steps[i].done;

  renderStepList(g.steps);

}

function gdUpdateStepText(i, val) {

  var g = goals.find(function(x){return x.id===_editingGoalId;});

  if (g&&g.steps&&g.steps[i]) g.steps[i].text = val;

}

function gdDeleteStep(i) {

  var g = goals.find(function(x){return x.id===_editingGoalId;});

  if (!g||!g.steps) return;

  g.steps.splice(i,1);

  renderStepList(g.steps);

}

function gdSave() {

  var g = goals.find(function(x){return x.id===_editingGoalId;});

  if (!g) return;

  g.title = (document.getElementById('gd-title').value||'').trim() || g.title;

  g.steps = _gdSteps.slice();

  var sliderPct = parseInt(document.getElementById('gd-progress').value,10)||0;

  // If steps exist, derive progress from steps (step checkboxes are authoritative)

  var newPct = sliderPct;

  if (_gdSteps.length > 0) {

    var doneCnt = _gdSteps.filter(function(s){ return s.done; }).length;

    newPct = Math.round((doneCnt / _gdSteps.length) * 100);

  }

  // Strict 100% gate: only archive at exactly 100%, restore below 100%

  if (newPct === 100 && g.progress < 100) g.completedAt = Date.now();

  if (newPct === 100 && !g.completedAt) g.completedAt = Date.now();

  if (newPct < 100) g.completedAt = undefined;

  g.progress = newPct;

  g.targetDate = document.getElementById('gd-date').value;

  closeModal('goaldetail');

  renderKanban();

  saveData();

}

function gdDeleteGoal() {

  if (!confirm('Delete this goal?')) return;

  goals = goals.filter(function(g){ return g.id !== _editingGoalId; });

  closeModal('goaldetail');

  renderKanban();

  saveData();

}

// ===== CATEGORIES =====

function confirmReassign(){ if(!_pendingReassign)return; var nd=document.getElementById('reassign-date').value; if(!nd){alert('Pick a date.');return;} var _a=_pendingReassign; var t=(_tasks[_a.dk]||[]).find(function(x){return x.id===_a.tid;}); if(t){var s=t.subtasks.find(function(x){return x.id===_a.sid;}); if(s){s.rdate=nd;s.done=false;}} _pendingReassign=null; closeModal('reassign'); renderGCal(); }

// ===== UTILS =====

function goalsLoadTabs() {

  var tabs = document.querySelectorAll('.goals-tab[data-tab-key]');

  tabs.forEach(function(tab, i) {

    var key = 'goalsTab' + i;

    var saved = localStorage.getItem(key);

    if (saved) tab.textContent = saved;

  });

}

function goalsEditTabs() {

  var tabs = document.querySelectorAll('.goals-tab[data-tab-key]');

  if (!tabs || tabs.length < 3) { alert('Could not find all 3 tabs. Try again.'); return; }

  document.getElementById('get-tab0').value = tabs[0].textContent.trim();

  document.getElementById('get-tab1').value = tabs[1].textContent.trim();

  document.getElementById('get-tab2').value = tabs[2].textContent.trim();

  openModal('goals-edit-tabs');

}

function goalsEditTabsSave() {

  var tabs = document.querySelectorAll('.goals-tab[data-tab-key]');

  var vals = [

    document.getElementById('get-tab0').value.trim(),

    document.getElementById('get-tab1').value.trim(),

    document.getElementById('get-tab2').value.trim()

  ];

  for (var i = 0; i < 3; i++) {

    var val = vals[i] || _goalsTabDefaults[i];

    localStorage.setItem('goalsTab' + i, val);

    if (tabs[i]) tabs[i].textContent = val;

  }

  closeModal('goals-edit-tabs');

}

function goalsGoTab(idx) {

  _goalsTabIdx = idx;

  var track = document.getElementById('goals-carousel-track');

  if (track) track.style.transform = 'translateX(-' + (idx * 100) + '%)';

  var tabs = document.querySelectorAll('.goals-tab');

  tabs.forEach(function(t, i) {

    t.classList.toggle('active', i === idx);

  });

}

function goalsCarouselInit() {

  var wrap = document.getElementById('goals-carousel-wrap');

  if (!wrap || wrap._carouselBound) return;

  wrap._carouselBound = true;

  var startX = 0, startY = 0, dx = 0, dragging = false, locked = false;

  var track = document.getElementById('goals-carousel-track');

  wrap.addEventListener('touchstart', function(e) {

    var t = e.touches[0];

    startX = t.clientX; startY = t.clientY; dx = 0; dragging = true; locked = false;

    track.style.transition = 'none';

  }, { passive: true });

  wrap.addEventListener('touchmove', function(e) {

    if (!dragging) return;

    var t = e.touches[0];

    dx = t.clientX - startX;

    var dy = t.clientY - startY;

    if (!locked) {

      // Lock axis after 6px threshold

      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;

      locked = true;

      if (Math.abs(dy) > Math.abs(dx)) { dragging = false; track.style.transition = ''; return; }

    }

    e.preventDefault();

    var base = _goalsTabIdx * 100;

    var pct = base - (dx / wrap.offsetWidth * 100);

    track.style.transform = 'translateX(-' + pct + '%)';

  }, { passive: false });

  wrap.addEventListener('touchend', function() {

    if (!dragging) return;

    dragging = false;

    track.style.transition = '';

    var panels = 3;

    if (dx < -50 && _goalsTabIdx < panels - 1) goalsGoTab(_goalsTabIdx + 1);

    else if (dx > 50 && _goalsTabIdx > 0) goalsGoTab(_goalsTabIdx - 1);

    else goalsGoTab(_goalsTabIdx);

  });

}



// --- window exports ---
if (typeof addGoalStep !== 'undefined') window.addGoalStep = addGoalStep;
if (typeof addDetailStep !== 'undefined') window.addDetailStep = addDetailStep;
if (typeof toggleGoalStep !== 'undefined') window.toggleGoalStep = toggleGoalStep;
if (typeof deleteGoalStep !== 'undefined') window.deleteGoalStep = deleteGoalStep;
if (typeof renderGoalStepsList !== 'undefined') window.renderGoalStepsList = renderGoalStepsList;
if (typeof renderGoalsDashboard !== 'undefined') window.renderGoalsDashboard = renderGoalsDashboard;
if (typeof renderGoalsYearOverview !== 'undefined') window.renderGoalsYearOverview = renderGoalsYearOverview;
if (typeof archToggleYear !== 'undefined') window.archToggleYear = archToggleYear;
if (typeof openEditGoalModal !== 'undefined') window.openEditGoalModal = openEditGoalModal;
if (typeof openAddGoalModal !== 'undefined') window.openAddGoalModal = openAddGoalModal;
if (typeof saveGoal !== 'undefined') window.saveGoal = saveGoal;
if (typeof updateGoalsCount !== 'undefined') window.updateGoalsCount = updateGoalsCount;
if (typeof openGoalDetail !== 'undefined') window.openGoalDetail = openGoalDetail;
if (typeof gdAddStep !== 'undefined') window.gdAddStep = gdAddStep;
if (typeof gdDashToggleStep !== 'undefined') window.gdDashToggleStep = gdDashToggleStep;
if (typeof gdDashStepDateChange !== 'undefined') window.gdDashStepDateChange = gdDashStepDateChange;
if (typeof gdToggleStep !== 'undefined') window.gdToggleStep = gdToggleStep;
if (typeof gdUpdateStepText !== 'undefined') window.gdUpdateStepText = gdUpdateStepText;
if (typeof gdDeleteStep !== 'undefined') window.gdDeleteStep = gdDeleteStep;
if (typeof gdSave !== 'undefined') window.gdSave = gdSave;
if (typeof gdDeleteGoal !== 'undefined') window.gdDeleteGoal = gdDeleteGoal;
if (typeof confirmReassign !== 'undefined') window.confirmReassign = confirmReassign;
if (typeof goalsShowOverdue !== 'undefined') window.goalsShowOverdue = goalsShowOverdue;
if (typeof goalsLoadTabs !== 'undefined') window.goalsLoadTabs = goalsLoadTabs;
if (typeof goalsEditTabs !== 'undefined') window.goalsEditTabs = goalsEditTabs;
if (typeof goalsEditTabsSave !== 'undefined') window.goalsEditTabsSave = goalsEditTabsSave;
if (typeof goalsGoTab !== 'undefined') window.goalsGoTab = goalsGoTab;
if (typeof goalsCarouselInit !== 'undefined') window.goalsCarouselInit = goalsCarouselInit;
if (typeof checkStepOverdue !== 'undefined') window.checkStepOverdue = checkStepOverdue;
