import re, time, sys

src = r"C:\Users\BIG D\.openclaw\workspace\ezy-life\index.html"
with open(src, 'r', encoding='utf-8') as f:
    c = f.read()

ok = True
def patch(label, old, new):
    global c, ok
    if old in c:
        c = c.replace(old, new, 1)
        sys.stdout.buffer.write(f"OK: {label}\n".encode('utf-8'))
    else:
        sys.stdout.buffer.write(f"MISS: {label}\n".encode('utf-8'))
        ok = False

# ══════════════════════════════════════════════════════════════════════════════
# 1. CSS — drop indicator lines (insert before / after)
# ══════════════════════════════════════════════════════════════════════════════

# Replace cat-drag-over with insert-line indicators
patch("cat CSS: insert line instead of box highlight",
    ".cat-drag-over { border-color:var(--accent2); box-shadow:0 -2px 8px rgba(56,139,253,.4); }",
    """.cat-drag-over { border-color:var(--accent2); box-shadow:0 -2px 8px rgba(56,139,253,.4); }
.cat-drop-before { box-shadow:none !important; border-color:transparent !important; border-top:3px solid var(--accent) !important; }
.cat-drop-after  { box-shadow:none !important; border-color:transparent !important; border-bottom:3px solid var(--accent) !important; }""")

# Replace note-drag-over with insert-line indicators
patch("notes CSS: insert line instead of outline",
    ".note-drag-over { outline:2px dashed var(--accent2); outline-offset:2px; }",
    """.note-drag-over { outline:2px dashed var(--accent2); outline-offset:2px; }
.note-drop-before { outline:none !important; box-shadow: 0 -3px 0 0 var(--accent) !important; }
.note-drop-after  { outline:none !important; box-shadow: 0 3px 0 0 var(--accent) !important; }""")

# kcs-step already has border-top insert indicator — tweak to be thicker/bluer
patch("kcs-drop-above thickness",
    ".kcs-drop-above { border-top:2px solid var(--accent); }",
    ".kcs-drop-above { border-top:3px solid var(--accent); margin-top:-1px; }")

# gd-drop-above same
patch("gd-drop-above thickness",
    ".gd-drop-above { border-top:2px solid var(--accent); }",
    ".gd-drop-above { border-top:3px solid var(--accent); margin-top:-1px; }")

# ══════════════════════════════════════════════════════════════════════════════
# 2. catItem DnD — insert-before/after based on Y midpoint
# ══════════════════════════════════════════════════════════════════════════════

patch("catItemDragOver: insert-line indicator",
    """function catItemDragOver(e, idx) {
  if(_catDragSrc===null||_catDragSrc===idx) return;
  e.preventDefault();
  document.querySelectorAll('.cat-item').forEach(function(el){ el.classList.remove('cat-drag-over'); });
  e.currentTarget.classList.add('cat-drag-over');
}""",
    """function catItemDragOver(e, idx) {
  if(_catDragSrc===null||_catDragSrc===idx) return;
  e.preventDefault();
  var el = e.currentTarget;
  var rect = el.getBoundingClientRect();
  var insertBefore = (e.clientY - rect.top) < rect.height / 2;
  document.querySelectorAll('.cat-item').forEach(function(r){ r.classList.remove('cat-drag-over','cat-drop-before','cat-drop-after'); });
  el.classList.add(insertBefore ? 'cat-drop-before' : 'cat-drop-after');
  el._catInsertBefore = insertBefore;
}""")

patch("catItemDrop: use insert-before flag",
    """function catItemDrop(e, idx) {
  e.preventDefault();
  document.querySelectorAll('.cat-item').forEach(function(el){ el.classList.remove('cat-drag-over','cat-dragging'); });
  if(_catDragSrc===null||_catDragSrc===idx) return;
  var moved = categories.splice(_catDragSrc, 1)[0];
  var insertAt = _catDragSrc < idx ? idx-1 : idx;
  categories.splice(insertAt, 0, moved);
  _catDragSrc = null;""",
    """function catItemDrop(e, idx) {
  e.preventDefault();
  var target = e.currentTarget;
  var insertBefore = target._catInsertBefore !== false;
  document.querySelectorAll('.cat-item').forEach(function(el){ el.classList.remove('cat-drag-over','cat-dragging','cat-drop-before','cat-drop-after'); });
  if(_catDragSrc===null||_catDragSrc===idx) return;
  var moved = categories.splice(_catDragSrc, 1)[0];
  // Recalc idx after splice
  var newIdx = categories.findIndex(function(x){ return false; }); // placeholder
  // Find the target element's new position
  var allItems = document.querySelectorAll('.cat-item');
  var targetItem = target;
  var afterSplice = Array.from(allItems).indexOf(targetItem);
  var insertAt = insertBefore ? idx : idx + 1;
  if (_catDragSrc < idx) insertAt = insertBefore ? idx - 1 : idx;
  if (insertAt < 0) insertAt = 0;
  if (insertAt > categories.length) insertAt = categories.length;
  categories.splice(insertAt, 0, moved);
  _catDragSrc = null;""")

patch("catItemDragEnd: clear new classes",
    """function catItemDragEnd() {
  _catDragSrc = null;
  document.querySelectorAll('.cat-item').forEach(function(el){ el.classList.remove('cat-drag-over','cat-dragging'); });
}""",
    """function catItemDragEnd() {
  _catDragSrc = null;
  document.querySelectorAll('.cat-item').forEach(function(el){ el.classList.remove('cat-drag-over','cat-dragging','cat-drop-before','cat-drop-after'); });
}""")

# ══════════════════════════════════════════════════════════════════════════════
# 3. Notes DnD — insert before/after based on Y midpoint
# ══════════════════════════════════════════════════════════════════════════════

patch("notes dragover: insert-line indicator",
    """    card.addEventListener('dragover', function(e) {
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
    });""",
    """    card.addEventListener('dragover', function(e) {
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
    });""")

# ══════════════════════════════════════════════════════════════════════════════
# 4. kcs-step dragover: add insert-before/after based on Y midpoint
# ══════════════════════════════════════════════════════════════════════════════

patch("kcs-step dragover: Y-midpoint insert",
    """    row.addEventListener('dragover', function(e) {
      if (e.dataTransfer.types.indexOf('kcs-step') === -1) return;
      e.preventDefault(); e.stopPropagation();
      wrap.querySelectorAll('.kcard-step-row').forEach(function(r){ r.classList.remove('kcs-drop-above'); });
      row.classList.add('kcs-drop-above');
    });""",
    """    row.addEventListener('dragover', function(e) {
      if (e.dataTransfer.types.indexOf('kcs-step') === -1) return;
      e.preventDefault(); e.stopPropagation();
      var rect = row.getBoundingClientRect();
      var before = (e.clientY - rect.top) < rect.height / 2;
      wrap.querySelectorAll('.kcard-step-row').forEach(function(r){ r.classList.remove('kcs-drop-above','kcs-drop-below'); });
      row.classList.add(before ? 'kcs-drop-above' : 'kcs-drop-below');
      row._kcsInsertBefore = before;
    });""")

patch("kcs-step drop: use Y-midpoint insert",
    """    row.addEventListener('drop', function(e) {
      e.preventDefault(); e.stopPropagation();
      row.classList.remove('kcs-drop-above');
      if (dragSrcIdx === null || dragSrcIdx === idx) return;
      var moved = arr.splice(dragSrcIdx, 1)[0];
      arr.splice(idx, 0, moved);
      dragSrcIdx = null;
      g.steps = arr;
      saveData();
      renderKCardSteps(gid);
    });""",
    """    row.addEventListener('drop', function(e) {
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
    });""")

patch("kcs dragend: clear new class",
    """    row.addEventListener('dragend', function() {
      row.classList.remove('kcs-dragging');
      wrap.querySelectorAll('.kcard-step-row').forEach(function(r){ r.classList.remove('kcs-drop-above'); });
    });""",
    """    row.addEventListener('dragend', function() {
      row.classList.remove('kcs-dragging');
      wrap.querySelectorAll('.kcard-step-row').forEach(function(r){ r.classList.remove('kcs-drop-above','kcs-drop-below'); });
    });""")

# kcs-drop-below CSS
patch("kcs-drop-below CSS",
    ".kcs-drop-above { border-top:3px solid var(--accent); margin-top:-1px; }",
    ".kcs-drop-above { border-top:3px solid var(--accent); margin-top:-1px; }\n.kcs-drop-below { border-bottom:3px solid var(--accent); }")

# ══════════════════════════════════════════════════════════════════════════════
# 5. gd-step dragover: Y-midpoint insert
# ══════════════════════════════════════════════════════════════════════════════

patch("gd-step dragover: Y-midpoint insert",
    """      if (!e.dataTransfer.types || !Array.from(e.dataTransfer.types).includes('gd-step')) return;
      e.preventDefault(); e.stopPropagation();
      el.querySelectorAll('.goal-step').forEach(function(r) { r.classList.remove('gd-drop-above'); });
      row.cl""",
    """      if (!e.dataTransfer.types || !Array.from(e.dataTransfer.types).includes('gd-step')) return;
      e.preventDefault(); e.stopPropagation();
      var rect = row.getBoundingClientRect();
      var before = (e.clientY - rect.top) < rect.height / 2;
      el.querySelectorAll('.goal-step').forEach(function(r) { r.classList.remove('gd-drop-above','gd-drop-below'); });
      row._gdInsertBefore = before;
      row.cl""")

# Fix the classList.add call right after (it adds 'gd-drop-above' unconditionally)
patch("gd-step dragover classList.add conditional",
    """      row._gdInsertBefore = before;
      row.classList.add('gd-drop-above');""",
    """      row._gdInsertBefore = before;
      row.classList.add(before ? 'gd-drop-above' : 'gd-drop-below');""")

# gd drop handler
patch("gd-step drop: use Y-midpoint",
    """      el.querySelectorAll('.goal-step').forEach(function(r) { r.classList.remove('gd-drop-above'); });
      if (dragSrcIdx === null || i === dragSrcIdx) return;
      var moved = arr.splice(dragSrcIdx, 1)[0];
      arr.splice(i, 0, moved);""",
    """      var insertBefore = row._gdInsertBefore !== false;
      el.querySelectorAll('.goal-step').forEach(function(r) { r.classList.remove('gd-drop-above','gd-drop-below'); });
      if (dragSrcIdx === null || i === dragSrcIdx) return;
      var moved = arr.splice(dragSrcIdx, 1)[0];
      var newI = insertBefore ? i : i + 1;
      if (dragSrcIdx < i) newI = insertBefore ? i - 1 : i;
      if (newI < 0) newI = 0;
      arr.splice(newI, 0, moved);""")

patch("gd dragend: clear new class",
    """      el.querySelectorAll('.goal-step').forEach(function(r) { r.classList.remove('gd-drop-above'); });""",
    """      el.querySelectorAll('.goal-step').forEach(function(r) { r.classList.remove('gd-drop-above','gd-drop-below'); });""")

# gd-drop-below CSS
patch("gd-drop-below CSS",
    ".gd-drop-above { border-top:3px solid var(--accent); margin-top:-1px; }",
    ".gd-drop-above { border-top:3px solid var(--accent); margin-top:-1px; }\n.gd-drop-below { border-bottom:3px solid var(--accent); }")

# ══════════════════════════════════════════════════════════════════════════════
# 6. Bump version
# ══════════════════════════════════════════════════════════════════════════════
ts = int(time.time() * 1000)
c = re.sub(r'<!-- v\d+ -->', f'<!-- v{ts} -->', c)
with open(src, 'w', encoding='utf-8') as f:
    f.write(c)
sys.stdout.buffer.write(f"Version: v{ts}. Length: {len(c)}\n".encode('utf-8'))
if not ok:
    sys.exit(1)
sys.stdout.buffer.write(b"All OK\n")
