$src = "C:\Users\BIG D\.openclaw\workspace\ezy-life\index.html"
$c = [System.IO.File]::ReadAllText($src, [System.Text.Encoding]::UTF8)
$ok = $true

function Patch($label, [ref]$text, $old, $new) {
  if ($text.Value.Contains($old)) {
    $text.Value = $text.Value.Replace($old, $new)
    Write-Host "OK: $label"
  } else {
    Write-Host "MISS: $label"
    $script:ok = $false
  }
}

# ── 1. CSS block ─────────────────────────────────────────────────────────────
$cssOld = @'
.note-card-title { font-size:14px; font-weight:700; margin-bottom:7px; word-break:break-word; }
.note-card-body { font-size:13px; color:var(--text2); line-height:1.55; word-break:break-word; white-space:pre-wrap; max-height:200px; overflow:hidden; }
.note-pinned-icon { font-size:11px; color:var(--yellow); margin-bottom:5px; display:block; }
.note-actions { opacity:0; display:flex; gap:4px; margin-top:10px; transition:opacity .15s; }
.note-action-btn { background:var(--surface2); border:1px solid var(--border); border-radius:6px; padding:5px 9px; color:var(--text3); cursor:pointer; font-size:12px; transition:all .15s; }
.note-action-btn:hover { color:var(--text); border-color:var(--text3); }
'@
$cssNew = @'
.note-card-title { font-size:14px; font-weight:700; margin-bottom:7px; word-break:break-word; }
.note-card-body { font-size:13px; color:var(--text2); line-height:1.55; word-break:break-word; white-space:pre-wrap; max-height:200px; overflow:hidden; }
.note-pinned-icon { font-size:11px; color:var(--yellow); margin-bottom:5px; display:block; }
.note-actions { opacity:0; display:flex; gap:4px; margin-top:10px; transition:opacity .15s; }
.note-action-btn { background:var(--surface2); border:1px solid var(--border); border-radius:6px; padding:5px 9px; color:var(--text3); cursor:pointer; font-size:12px; transition:all .15s; }
.note-action-btn:hover { color:var(--text); border-color:var(--text3); }
/* Note formatting toolbar */
.note-fmt-toolbar { display:flex; gap:6px; margin-bottom:6px; }
.note-fmt-btn { background:var(--surface2); border:1px solid var(--border); border-radius:6px; padding:5px 10px; color:var(--text2); font-size:13px; font-weight:600; cursor:pointer; transition:all .15s; line-height:1; }
.note-fmt-btn:hover { background:var(--accent); color:#fff; border-color:var(--accent); }
/* Checkbox list in note card */
.note-cb-list { list-style:none; padding:0; margin:0; }
.note-cb-item { display:flex; align-items:flex-start; gap:7px; font-size:13px; color:var(--text2); line-height:1.5; margin-bottom:3px; }
.note-cb-item input[type=checkbox] { margin-top:2px; cursor:pointer; accent-color:var(--accent2); width:14px; height:14px; flex-shrink:0; }
.note-cb-item.done span { text-decoration:line-through; opacity:.55; }
/* Drag-and-drop note card states */
.note-card.note-dragging { opacity:.45; box-shadow:0 8px 32px rgba(0,0,0,.5); transform:scale(1.02); cursor:grabbing; }
.note-card.note-drag-over { outline:2px dashed var(--accent2); outline-offset:2px; }
.note-card { cursor:grab; }
.note-card:active { cursor:grabbing; }
/* gsearch arrow-key active */
.gsearch-item.gs-active { background:var(--surface2); }
'@
Patch "CSS block" ([ref]$c) $cssOld $cssNew

# ── 2. Note modal: add toolbar above textarea ────────────────────────────────
$modalOld = @'
    <div class="form-group" style="margin-bottom:14px">
      <label class="form-label">Note</label>
      <textarea class="form-textarea" id="nm-body" style="min-height:140px" placeholder="Write something..."></textarea>
    </div>
'@
$modalNew = @'
    <div class="form-group" style="margin-bottom:14px">
      <label class="form-label">Note</label>
      <div class="note-fmt-toolbar">
        <button type="button" class="note-fmt-btn" onclick="noteInsertFormat('numbered')" title="Numbered list">1. &#9776;</button>
        <button type="button" class="note-fmt-btn" onclick="noteInsertFormat('checkbox')" title="Checkbox list">&#9745; List</button>
      </div>
      <textarea class="form-textarea" id="nm-body" style="min-height:140px" placeholder="Write something..."></textarea>
    </div>
'@
Patch "Note modal toolbar" ([ref]$c) $modalOld $modalNew

# ── 3. Inject JS before renderNotes ─────────────────────────────────────────
$jsAnchor = "function renderNotes() {"
$jsInsert = @'
// ===== NOTES FORMATTING TOOLBAR =====
function noteInsertFormat(type) {
  var ta = document.getElementById('nm-body');
  if (!ta) return;
  var start = ta.selectionStart, end = ta.selectionEnd;
  var val = ta.value;
  var before = val.substring(0, start);
  var selected = val.substring(start, end);
  var after = val.substring(end);
  var lines = selected ? selected.split('\n') : [''];
  var prefix = before.length > 0 && before[before.length-1] !== '\n' ? '\n' : '';
  var formatted;
  if (type === 'numbered') {
    formatted = prefix + lines.map(function(l,i){ return (i+1)+'. '+(l.replace(/^\d+\.\s*/,'').replace(/^\[[ x]\]\s*/,'')); }).join('\n');
  } else {
    formatted = prefix + lines.map(function(l){ return '[ ] '+(l.replace(/^\d+\.\s*/,'').replace(/^\[[ x]\]\s*/,'')); }).join('\n');
  }
  ta.value = before + formatted + after;
  var newCursor = before.length + formatted.length;
  ta.setSelectionRange(newCursor, newCursor);
  ta.focus();
}

// ===== NOTES CHECKBOX CARD RENDERING =====
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
  localStorage.setItem('ezy_notes_v2', JSON.stringify(notes));
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
      grid.querySelectorAll('.note-card').forEach(function(c){ c.classList.remove('note-drag-over'); });
      card.classList.add('note-drag-over');
    });
    card.addEventListener('dragleave', function() { card.classList.remove('note-drag-over'); });
    card.addEventListener('drop', function(e) {
      e.preventDefault();
      card.classList.remove('note-drag-over');
      var targetId = parseInt(card.getAttribute('data-noteid'));
      if (_noteDragId === null || _noteDragId === targetId) return;
      var dragIdx = notes.findIndex(function(n){ return n.id===_noteDragId; });
      var targetIdx = notes.findIndex(function(n){ return n.id===targetId; });
      if (dragIdx < 0 || targetIdx < 0) return;
      var dragged = notes.splice(dragIdx, 1)[0];
      var newTarget = notes.findIndex(function(n){ return n.id===targetId; });
      notes.splice(newTarget, 0, dragged);
      saveNotes();
      renderNotes();
    });
  });
}

'@

if ($c.Contains($jsAnchor)) {
  $c = $c.Replace($jsAnchor, $jsInsert + $jsAnchor)
  Write-Host "OK: JS before renderNotes"
} else {
  Write-Host "MISS: renderNotes anchor"
  $ok = $false
}

# ── 4. buildNoteCard: add data-noteid, use buildNoteBodyHtml, fix icons ──────
$bcOld = 'function buildNoteCard(n) {
  var colorCls = n.color ? ' + "' '+n.color : '';" + '
  var pinnedBadge = n.pinned ? ' + "'<span class=""note-pinned-icon"">📌 Pinned</span>'" + ' : ' + "'';" + '
  var titleHtml = n.title ? ' + "'<div class=""note-card-title"">'" + '+esc(n.title)+' + "'</div>'" + ' : ' + "'';" + '
  var bodyPreview = (n.body||' + "''" + ').slice(0,300);
  return ' + "'<div class=""note-card'"+'+colorCls+' + '"" onclick=""openNoteModal(' + "'+n.id+')'"
# This approach is getting too nested, use direct string search instead
$bcIdx = $c.IndexOf("function buildNoteCard(n) {")
Write-Host "buildNoteCard at idx: $bcIdx"
# Read 500 chars from that point
$bcSnippet = $c.Substring($bcIdx, [Math]::Min(600, $c.Length - $bcIdx))
Write-Host "SNIPPET:`n$bcSnippet"
