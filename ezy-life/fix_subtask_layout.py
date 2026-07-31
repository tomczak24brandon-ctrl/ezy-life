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

# ── 1. CSS fixes ──────────────────────────────────────────────────────────────

# 1a. Row: remove cursor:grab (drag should only start from handle), keep gap but increase it
patch("kcard-step-row CSS",
    ".kcard-step-row { display:flex; align-items:center; gap:6px; padding:3px 0; cursor:grab; user-select:none; }",
    ".kcard-step-row { display:flex; align-items:center; gap:0; padding:3px 0; cursor:default; user-select:none; }")

# 1b. Handle: more visible, right margin for gap
patch("kcard-step-hdl CSS",
    ".kcard-step-hdl { font-size:11px; color:var(--text3); cursor:grab; flex-shrink:0; padding:0 2px; }",
    ".kcard-step-hdl { font-size:13px; color:var(--text3); cursor:grab; flex-shrink:0; padding:0 4px 0 2px; margin-right:12px; line-height:1; }\n.kcard-step-hdl:hover { color:var(--accent); }")

# 1c. done-step: add opacity
patch("kcard-step-txt done-step opacity",
    ".kcard-step-txt.done-step { text-decoration:line-through; color:var(--text3); }",
    ".kcard-step-txt.done-step { text-decoration:line-through; color:var(--text3); opacity:0.6; }")

# 1d. txt: add left margin from checkbox, make it look clickable
patch("kcard-step-txt CSS",
    ".kcard-step-txt { flex:1; font-size:11px; color:var(--text2); outline:none; background:none; border:none; padding:0; min-width:0; }",
    ".kcard-step-txt { flex:1; font-size:11px; color:var(--text2); outline:none; background:none; border:none; padding:0; min-width:0; margin-left:8px; cursor:text; border-radius:3px; }\n.kcard-step-txt:focus { background:var(--surface2); padding:1px 4px; }")

# 1e. goal-step-check gap (in Add Goal modal / Goal Detail)
patch("gd-step-drag CSS add margin",
    ".gd-step-drag { color:var(--text3); cursor:grab; font-size:14px; flex-shrink:0; padding:0 4px; }",
    ".gd-step-drag { color:var(--text3); cursor:grab; font-size:14px; flex-shrink:0; padding:0 4px; margin-right:12px; }\n.gd-step-drag:hover { color:var(--accent); }")

# ── 2. JS: kcard-step-row — draggable=false on row, drag only from handle ────
patch("kcard-step-row draggable=false",
    """    row.className = 'kcard-step-row';
    row.draggable = true;

    // Drag handle
    var hdl = document.createElement('span');
    hdl.className = 'kcard-step-hdl';
    hdl.textContent = '\\u22EE';
    hdl.title = 'Drag to reorder';""",
    """    row.className = 'kcard-step-row';
    row.draggable = false;

    // Drag handle
    var hdl = document.createElement('span');
    hdl.className = 'kcard-step-hdl';
    hdl.innerHTML = '&#x22EE;&#x22EE;';
    hdl.title = 'Drag to reorder';
    hdl.draggable = true;""")

# 3. Redirect dragstart from row to only fire when handle is the target
patch("kcard dragstart handle-only check",
    """    // DnD ? scoped to this steps list, tagged kcs-step
    row.addEventListener('dragstart', function(e) {
      e.stopPropagation(); // don't bubble to kanban card drag
      dragSrcIdx = idx;
      e.dataTransfer.setData('kcs-step', String(gid));
      e.dataTransfer.effectAllowed = 'move';
      setTimeout(function(){ row.classList.add('kcs-dragging'); }, 0);
    });""",
    """    // DnD scoped to this steps list, tagged kcs-step — handle only
    hdl.addEventListener('dragstart', function(e) {
      e.stopPropagation();
      dragSrcIdx = idx;
      e.dataTransfer.setData('kcs-step', String(gid));
      e.dataTransfer.effectAllowed = 'move';
      row.draggable = true;
      setTimeout(function(){ row.classList.add('kcs-dragging'); }, 0);
    });
    hdl.addEventListener('dragend', function() { row.draggable = false; });
    row.addEventListener('dragstart', function(e) {
      if (!row.draggable) { e.preventDefault(); return; }
      e.stopPropagation();
    });""")

# 4. Done-step strikethrough + opacity when toggling checkbox in kcard
# The chk click toggles done class — ensure txt also gets/removes done-step
patch("kcard chk click updates txt done-step",
    """    chk.addEventListener('click', function(e) {
      e.stopPropagation();
      step.done = !step.done;""",
    """    chk.addEventListener('click', function(e) {
      e.stopPropagation();
      step.done = !step.done;
      if (step.done) { chk.classList.add('done'); txt.classList.add('done-step'); }
      else { chk.classList.remove('done'); txt.classList.remove('done-step'); }""")

# 5. Goal Detail modal step list: row draggable=false, handle triggers drag
patch("gd renderGoalStepsList row draggable=false",
    """    row.className = 'goal-step';
    row.draggable = true;
    row.dataset.idx = i;

    // Drag handle
    var handle = document.createElement('span');
    handle.className = 'gd-step-drag';
    handle.textContent = '\\u22ee';
    handle.title = 'Drag to reorder';""",
    """    row.className = 'goal-step';
    row.draggable = false;
    row.dataset.idx = i;

    // Drag handle
    var handle = document.createElement('span');
    handle.className = 'gd-step-drag';
    handle.innerHTML = '&#x22EE;&#x22EE;';
    handle.title = 'Drag to reorder';
    handle.draggable = true;""")

patch("gd dragstart handle-only",
    """    // Drag events ? only fire from handle or row background, not from contenteditable
    row.addEventListener('dragstart', function(e) {
      if (document.activeElement === txt) { e.preventDefault(); return; }
      dragSrcIdx = parseInt(row.dataset.idx, 10);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('gd-step', '1');
      setTimeout(function() { ro""",
    """    // Drag events — only fire from handle
    handle.addEventListener('dragstart', function(e) {
      e.stopPropagation();
      dragSrcIdx = parseInt(row.dataset.idx, 10);
      row.draggable = true;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('gd-step', '1');
      setTimeout(function() { ro""")

# ── 6. Bump version ───────────────────────────────────────────────────────────
ts = int(time.time() * 1000)
c = re.sub(r'<!-- v\d+ -->', f'<!-- v{ts} -->', c)

with open(src, 'w', encoding='utf-8') as f:
    f.write(c)
sys.stdout.buffer.write(f"Version: v{ts}\n".encode('utf-8'))
sys.stdout.buffer.write(f"Length: {len(c)}\n".encode('utf-8'))
if not ok:
    sys.exit(1)
sys.stdout.buffer.write(b"All patches OK\n")
