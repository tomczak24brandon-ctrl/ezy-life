
function buildNoteColorPicker(selectedCls) {

  var el = document.getElementById('nm-colors');

  el.innerHTML = NOTE_COLORS.map(function(c){

    var sel = (c.cls === selectedCls) ? ' sel' : '';

    var dotCls = c.cls ? 'nc-dot-'+c.cls.replace('nc-','') : 'nc-dot-default';

    return '<div class="nc-dot '+dotCls+sel+'" title="'+c.label+'" onclick="nmSelectColor(\''+c.cls+'\')" style="position:relative"></div>';

  }).join('');

}

function nmSelectColor(cls) {

  window._nmColor = cls;

  buildNoteColorPicker(cls);

}

function openNoteModal(noteId) {

  window._editingNoteId = noteId;

  window._nmPinned = false;

  window._nmColor = '';

  if (noteId !== null) {

    var n = notes.find(function(x){return x.id===noteId;});

    if (!n) return;

    document.getElementById('nm-title').value = n.title || '';

    nceSetValue(n.body || '');

    window._nmColor = n.color || '';

    window._nmPinned = !!n.pinned;

    document.getElementById('nm-del-btn').style.display = 'inline-flex';

    document.getElementById('note-modal-ttl').textContent = '📝 Edit Note';

  } else {

    document.getElementById('nm-title').value = '';

    nceSetValue('');

    document.getElementById('nm-del-btn').style.display = 'none';

    document.getElementById('note-modal-ttl').textContent = '📝 New Note';

  }

  var pinBtn = document.getElementById('nm-pin-btn');

  pinBtn.textContent = window._nmPinned ? '📌 Unpin' : '📌 Pin';

  buildNoteColorPicker(window._nmColor);

  showModal('note');

}

function nmTogglePin() {

  window._nmPinned = !window._nmPinned;

  document.getElementById('nm-pin-btn').textContent = window._nmPinned ? '📌 Unpin' : '📌 Pin';

}

function nmSave() {

  var body = nceGetValue().trim();

  if (!body) { alert('Note body cannot be empty.'); return; }

  if (window._editingNoteId !== null) {

    var n = notes.find(function(x){return x.id===window._editingNoteId;});

    if (n) {

      n.title = (document.getElementById('nm-title').value||'').trim();

      n.body = body;

      n.color = window._nmColor;

      n.pinned = window._nmPinned;

    }

  } else {

    notes.unshift({

      id: Date.now(),

      title: (document.getElementById('nm-title').value||'').trim(),

      body: body,

      color: window._nmColor,

      pinned: window._nmPinned

    });

  }

  closeModal('note');

  renderNotes();

  saveData();

}

function nmDelete() {

  if (!confirm('Delete this note?')) return;

  notes = notes.filter(function(n){return n.id!==window._editingNoteId;});

  closeModal('note');

  renderNotes();

  saveData();

}

// ===== NOTES FORMATTING TOOLBAR =====

function noteInsertFormat(type) {

  var el = document.getElementById('nm-body'); if (!el) return;

  // Append a new formatted row to the contenteditable editor

  if (type === 'numbered') {

    // Count existing numbered rows to determine next number

    var numRows = el.querySelectorAll('.nce-num-label').length;

    var row = _nceNumRow(numRows + 1, '');

    if (el.lastChild && el.lastChild.nodeName !== 'BR') el.appendChild(document.createElement('br'));

    el.appendChild(row);

    var span = row.querySelector('.nce-text'); if (span) span.focus();

  } else {

    var row = _nceRow(false, '');

    if (el.lastChild && el.lastChild.nodeName !== 'BR') el.appendChild(document.createElement('br'));

    el.appendChild(row);

    var span = row.querySelector('.nce-text'); if (span) span.focus();

  }

}


// ===== NOTE CONTENTEDITABLE HELPERS =====
// Store/retrieve plain-text markdown format from the contenteditable div.
// The div renders live checkboxes; internally we always serialize back to "[ ]"/"[x]" text.

function buildNoteBodyHtml(body) {

  if (!body) return '';

  var lines = body.split('\n');

  var hasCb = lines.some(function(l){ return /^\[[ x]\]\s/.test(l); });

  if (!hasCb) return '<div class="note-card-body">'+esc(body.slice(0,300))+'</div>';

  var out = '<ul class="note-cb-list">';

  lines.slice(0,20).forEach(function(l) {

    if (/^\[ \]\s/.test(l)) {

      var text = l.replace(/^\[ \]\s*/,'');

      out += '<li class="note-cb-item"><input type="checkbox" onclick="event.stopPropagation();noteCardToggleCb(this)" data-line="'+esc(l)+'"><span>'+esc(text)+'</span></li>';

    } else if (/^\[x\]\s/i.test(l)) {

      var text = l.replace(/^\[x\]\s*/i,'');

      out += '<li class="note-cb-item done"><input type="checkbox" checked onclick="event.stopPropagation();noteCardToggleCb(this)" data-line="'+esc(l)+'"><span>'+esc(text)+'</span></li>';

    } else if (l.trim()) {

      out += '<li class="note-cb-item" style="list-style:none"><span style="color:var(--text2)">'+esc(l)+'</span></li>';

    }

  });

  out += '</ul>';

  return out;

}

function noteCardToggleCb(checkbox) {

  var card = checkbox.closest('[data-noteid]');

  if (!card) return;

  var nid = parseInt(card.getAttribute('data-noteid'));

  var n = notes.find(function(x){return x.id===nid;});

  if (!n) return;

  var line = checkbox.getAttribute('data-line');

  if (checkbox.checked) {

    n.body = n.body.replace(line, line.replace(/^\[ \]/, '[x]'));

  } else {

    n.body = n.body.replace(line, line.replace(/^\[x\]/i, '[ ]'));

  }

  saveNotes();

  renderNotes();

}

function saveNotes() {
  // Notes are now sourced from Google Tasks; local save is a fallback cache only
  try { localStorage.setItem('ezy_notes_v2', JSON.stringify(notes)); } catch(e) {}
}

// ===== NOTES DRAG-AND-DROP REORDER =====

var _noteDragId = null;

function initNoteDnD(gridId) {

  var grid = document.getElementById(gridId);

  if (!grid) return;

  var cards = grid.querySelectorAll('.note-card[data-noteid]');

  cards.forEach(function(card) {

    card.setAttribute('draggable', 'true');

    card.addEventListener('dragstart', function(e) {

      _noteDragId = parseInt(card.getAttribute('data-noteid'));

      setTimeout(function(){ card.classList.add('note-dragging'); }, 0);

      e.dataTransfer.effectAllowed = 'move';

    });

    card.addEventListener('dragend', function() {

      card.classList.remove('note-dragging');

      grid.querySelectorAll('.note-card').forEach(function(c){ c.classList.remove('note-drag-over'); });

    });

    card.addEventListener('dragover', function(e) {

      e.preventDefault();

      e.dataTransfer.dropEffect = 'move';

      var rect = card.getBoundingClientRect();

      var insertBefore = (e.clientY - rect.top) < rect.height / 2;

      grid.querySelectorAll('.note-card').forEach(function(c){ c.classList.remove('note-drag-over','note-drop-before','note-drop-after'); });

      card.classList.add(insertBefore ? 'note-drop-before' : 'note-drop-after');

      card._noteInsertBefore = insertBefore;

    });

    card.addEventListener('dragleave', function() { card.classList.remove('note-drag-over','note-drop-before','note-drop-after'); });

    card.addEventListener('drop', function(e) {

      e.preventDefault();

      var insertBefore = card._noteInsertBefore !== false;

      grid.querySelectorAll('.note-card').forEach(function(c){ c.classList.remove('note-drag-over','note-drop-before','note-drop-after'); });

      var targetId = parseInt(card.getAttribute('data-noteid'));

      if (_noteDragId === null || _noteDragId === targetId) return;

      var dragIdx = notes.findIndex(function(n){ return n.id===_noteDragId; });

      var targetIdx = notes.findIndex(function(n){ return n.id===targetId; });

      if (dragIdx < 0 || targetIdx < 0) return;

      var dragged = notes.splice(dragIdx, 1)[0];

      // Recalc targetIdx after splice

      var newTargetIdx = notes.findIndex(function(n){ return n.id===targetId; });

      var insertAt = insertBefore ? newTargetIdx : newTargetIdx + 1;

      if (insertAt < 0) insertAt = 0;

      notes.splice(insertAt, 0, dragged);

      saveNotes();

      renderNotes();

    });

  });

}

function renderNotes() {

  var q = (document.getElementById('notes-search').value||'').toLowerCase();

  var filtered = q ? notes.filter(function(n){

    return (n.title||'').toLowerCase().indexOf(q)>=0 || (n.body||'').toLowerCase().indexOf(q)>=0;

  }) : notes;

  var pinned = filtered.filter(function(n){return n.pinned;});

  var unpinned = filtered.filter(function(n){return !n.pinned;});

  var pinnedSec = document.getElementById('notes-pinned-section');

  var allSec = document.getElementById('notes-all-section');

  var emptyEl = document.getElementById('notes-empty');

  var allLabel = document.getElementById('notes-all-label');

  if (pinned.length > 0) {

    pinnedSec.style.display = 'block';

    document.getElementById('notes-pinned-grid').innerHTML = pinned.map(buildNoteCard).join('');

    initNoteDnD('notes-pinned-grid');

  } else {

    pinnedSec.style.display = 'none';

  }

  allLabel.textContent = pinned.length > 0 ? 'Other' : 'Notes';

  if (unpinned.length > 0) {

    document.getElementById('notes-all-grid').innerHTML = unpinned.map(buildNoteCard).join('');

    initNoteDnD('notes-all-grid');

    emptyEl.style.display = 'none';

  } else if (pinned.length === 0) {

    document.getElementById('notes-all-grid').innerHTML = '';

    emptyEl.style.display = 'block';

  } else {

    document.getElementById('notes-all-grid').innerHTML = '';

    emptyEl.style.display = 'none';

  }

}

function buildNoteCard(n) {

  var colorCls = n.color ? ' '+n.color : '';

  var pinnedBadge = n.pinned ? '<span class="note-pinned-icon">&#128204; Pinned</span>' : '';

  var titleHtml = n.title ? '<div class="note-card-title">'+esc(n.title)+'</div>' : '';

  var bodyHtml = buildNoteBodyHtml(n.body||'');

  return '<div class="note-card'+colorCls+'" data-noteid="'+n.id+'" onclick="openNoteModal('+n.id+')" draggable="true">'

    +pinnedBadge

    +titleHtml

    +bodyHtml

    +'<div class="note-actions">'

    +'<button class="note-action-btn" onclick="event.stopPropagation();toggleNotePin('+n.id+')">'+(n.pinned?'&#128204; Unpin':'&#128204; Pin')+'</button>'

    +'<button class="note-action-btn" onclick="event.stopPropagation();deleteNote('+n.id+')" style="color:var(--red)">&#128465;&#65039;</button>'

    +'</div>'

    +'</div>';

}

function toggleNotePin(id) {

  var n = notes.find(function(x){return x.id===id;});

  if (n) n.pinned = !n.pinned;

  renderNotes();

}

function deleteNote(id) {

  if (!confirm('Delete this note?')) return;

  notes = notes.filter(function(n){return n.id!==id;});

  renderNotes();

}

// ===== GOOGLE API: CALENDAR EVENTS + TASKS NOTES =====

// Get stored OAuth access token from sessionStorage
function fetchGoogleNotes() {
  var token = _getOAuthToken();
  if (!token) {
    console.warn('fetchGoogleNotes: no OAuth token available');
    return Promise.resolve();
  }

  // Step 1: get the user's first task list
  return fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists?maxResults=10', {
    headers: { 'Authorization': 'Bearer ' + token }
  })
  .then(function(res) {
    if (res.status === 401) {
      console.warn('fetchGoogleNotes: 401 Unauthorized');
      sessionStorage.removeItem('goog_oauth_token');
      return null;
    }
    return res.json();
  })
  .then(function(listsData) {
    if (!listsData || !listsData.items || !listsData.items.length) return;
    var listId = listsData.items[0].id;
    // Step 2: fetch tasks from the first list
    return fetch('https://tasks.googleapis.com/tasks/v1/lists/' + encodeURIComponent(listId) + '/tasks?showCompleted=false&maxResults=100', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
  })
  .then(function(res) {
    if (!res) return;
    return res.json();
  })
  .then(function(tasksData) {
    if (!tasksData || !tasksData.items) return;
    // Map Google Tasks into the notes[] format used by the existing notes UI
    var googleNotes = tasksData.items.map(function(task) {
      return {
        id:     task.id,
        gcalId: task.id,
        title:  task.title || '',
        body:   task.notes || '',
        pinned: false,
        color:  '',
        source: 'google_tasks'
      };
    });
    // Merge: keep local notes that aren't Google-sourced, prepend Google ones
    var localNotes = notes.filter(function(n) { return !n.source || n.source !== 'google_tasks'; });
    notes = googleNotes.concat(localNotes);
    console.log('fetchGoogleNotes: loaded', googleNotes.length, 'tasks from Google Tasks');
  })
  .catch(function(e) {
    console.error('fetchGoogleNotes error:', e);
  });
}

// ===== GOOGLE CALENDAR (TIME BLOCKING) =====


// --- window exports ---
window.openNoteModal = openNoteModal;
window.nmSelectColor = nmSelectColor;
window.nmTogglePin = nmTogglePin;
window.nmSave = nmSave;
window.nmDelete = nmDelete;
window.noteInsertFormat = noteInsertFormat;
window.noteCardToggleCb = noteCardToggleCb;
window.saveNotes = saveNotes;
window.renderNotes = renderNotes;
window.buildNoteCard = buildNoteCard;
window.toggleNotePin = toggleNotePin;
window.deleteNote = deleteNote;
window.fetchGoogleNotes = fetchGoogleNotes;
window.buildNoteColorPicker = buildNoteColorPicker;
