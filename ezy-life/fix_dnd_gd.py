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

# Fix dragleave (still removing only gd-drop-above, not gd-drop-below)
patch("gd dragleave: clear both",
    "      row.classList.remove('gd-drop-above');\n    });\n    row.addEventListener('drop', function(e) {\n      e.preventDefault(); e.stopPropagation();\n      row.classList.remove('gd-drop-above');",
    "      row.classList.remove('gd-drop-above','gd-drop-below');\n    });\n    row.addEventListener('drop', function(e) {\n      e.preventDefault(); e.stopPropagation();\n      var insertBefore = row._gdInsertBefore !== false;\n      row.classList.remove('gd-drop-above','gd-drop-below');")

# Fix the actual splice in the drop handler (uses toIdx not i)
patch("gd drop: Y-midpoint splice",
    "      var toIdx = parseInt(row.dataset.idx, 10);\n      if (dragSrcIdx === null || dragSrcIdx === toIdx) { dragSrcIdx = null; return; }\n      var moved = arr.splice(dragSrcIdx, 1)[0];\n      arr.splice(toI",
    "      var toIdx = parseInt(row.dataset.idx, 10);\n      if (dragSrcIdx === null || dragSrcIdx === toIdx) { dragSrcIdx = null; return; }\n      var moved = arr.splice(dragSrcIdx, 1)[0];\n      var newToIdx = insertBefore ? toIdx : toIdx + 1;\n      if (dragSrcIdx < toIdx) newToIdx = insertBefore ? toIdx - 1 : toIdx;\n      if (newToIdx < 0) newToIdx = 0;\n      if (newToIdx > arr.length) newToIdx = arr.length;\n      arr.splice(newToI")

# bump version
ts = int(time.time() * 1000)
c = re.sub(r'<!-- v\d+ -->', f'<!-- v{ts} -->', c)
with open(src, 'w', encoding='utf-8') as f:
    f.write(c)
sys.stdout.buffer.write(f"Version: v{ts}. Length: {len(c)}\n".encode('utf-8'))
if not ok:
    sys.exit(1)
sys.stdout.buffer.write(b"All OK\n")
