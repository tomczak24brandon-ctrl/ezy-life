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

# Fix 1: gd-step-drag CSS (exact match)
patch("gd-step-drag CSS margin",
    ".gd-step-drag { color:var(--text3); cursor:grab; font-size:14px; padding:0 3px; flex-shrink:0; user-select:none; -webkit-user-select:none; }",
    ".gd-step-drag { color:var(--text3); cursor:grab; font-size:14px; padding:0 4px; margin-right:12px; flex-shrink:0; user-select:none; -webkit-user-select:none; }\n.gd-step-drag:hover { color:var(--accent); }")

# Fix 2: kcard-step-row dragstart — redirect to handle
# The text before matched earlier patch inserted hdl.addEventListener; now row.addEventListener is the leftovers
# Remove the row dragstart and replace with handle-based one
patch("kcard dragstart handle-only",
    """    // DnD ? scoped to this steps list, tagged kcs-step
    row.addEventListener('dragstart', function(e) {
      e.stopPropagation(); // don't bubble to kanban card drag
      dragSrcIdx = idx;
      e.dataTransfer.setData('kcs-step', String(gid));
      e.dataTransfer.effectAllowed = 'move';
      setTimeout(function(){ row.classList.add('kcs-dragging'); }, 0);
    });""",
    """    // DnD scoped to steps list — drag via handle only
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
    });""")

# Fix 3: gd detail view dragstart — redirect to handle-only
patch("gd dragstart handle-only",
    """    if (document.activeElement === txt) { e.preventDefault(); return; }
      dragSrcIdx = parseInt(row.dataset.idx, 10);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('gd-step', '1');
      setTimeout(function() { row.classList.add('gd-dragging'); }, 0);
    });""",
    """    if (document.activeElement === txt) { e.preventDefault(); return; }
      dragSrcIdx = parseInt(row.dataset.idx, 10);
      row.draggable = true;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('gd-step', '1');
      setTimeout(function() { row.classList.add('gd-dragging'); }, 0);
    });
    handle.addEventListener('dragend', function() { row.draggable = false; });""")

# Fix: also wire handle dragstart for gd (find gd-step '1' context to insert handle listener)
patch("gd handle.addEventListener dragstart",
    """    // Drag events — only fire from handle
    handle.addEventListener('dragstart', function(e) {
      e.stopPropagation();
      dragSrcIdx = parseInt(row.dataset.idx, 10);
      row.draggable = true;
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
      setTimeout(function() { ro""")  # no-op if already applied

# Bump version
ts = int(time.time() * 1000)
c = re.sub(r'<!-- v\d+ -->', f'<!-- v{ts} -->', c)
with open(src, 'w', encoding='utf-8') as f:
    f.write(c)
sys.stdout.buffer.write(f"Version: v{ts}\n".encode('utf-8'))
sys.stdout.buffer.write(f"Length: {len(c)}\n".encode('utf-8'))
if not ok:
    sys.exit(1)
sys.stdout.buffer.write(b"All patches OK\n")
