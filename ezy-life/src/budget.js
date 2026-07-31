// ===== BUDGET STUBS (actual budget logic is in financials.js) =====

// ===== GLOBAL SEARCH =====
// ===== GLOBAL SEARCH =====

var _gsearchTimer = null;

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