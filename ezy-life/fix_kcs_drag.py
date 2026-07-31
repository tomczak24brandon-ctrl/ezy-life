import re, time, sys

src = r"C:\Users\BIG D\.openclaw\workspace\ezy-life\index.html"
with open(src, 'r', encoding='utf-8') as f:
    raw = f.read()

ok = True

old = ("kcs-step\n"
       "    row.addEventListener('dragstart', function(e) {\n"
       "      e.stopPropagation(); // don't bubble to kanban card drag\n"
       "      dragSrcIdx = idx;\n"
       "      e.dataTransfer.setData('kcs-step', String(gid));\n"
       "      e.dataTransfer.effectAllowed = 'move';\n"
       "      setTimeout(function(){ row.classList.add('kcs-dragging'); }, 0);\n"
       "    });")

new = ("kcs-step -- drag via handle only\n"
       "    hdl.addEventListener('dragstart', function(e) {\n"
       "      e.stopPropagation();\n"
       "      dragSrcIdx = idx;\n"
       "      row.draggable = true;\n"
       "      e.dataTransfer.setData('kcs-step', String(gid));\n"
       "      e.dataTransfer.effectAllowed = 'move';\n"
       "      setTimeout(function(){ row.classList.add('kcs-dragging'); }, 0);\n"
       "    });\n"
       "    hdl.addEventListener('dragend', function() { row.draggable = false; });\n"
       "    row.addEventListener('dragstart', function(e) {\n"
       "      if (!row.draggable) { e.preventDefault(); e.stopPropagation(); return; }\n"
       "      e.stopPropagation();\n"
       "    });")

if old in raw:
    raw = raw.replace(old, new, 1)
    sys.stdout.buffer.write(b"OK: kcs dragstart handle-only\n")
else:
    sys.stdout.buffer.write(b"MISS\n")
    ok = False

# Also wire gd detail view handle dragstart (was missed — find its context)
gd_old = ("    // Drag events \u2014 only fire from handle or row background, not from contenteditable\n"
           "    row.addEventListener('dragstart', function(e) {\n"
           "      if (document.activeElement === txt) { e.preventDefault(); return; }")
gd_alt = ("    // Drag events ? only fire from handle or row background, not from contenteditable\n"
           "    row.addEventListener('dragstart', function(e) {\n"
           "      if (document.activeElement === txt) { e.preventDefault(); return; }")

# Try both variants
found_gd = False
for variant in [gd_old, gd_alt]:
    if variant in raw:
        gd_new = ("    // Drag events -- handle only\n"
                  "    handle.addEventListener('dragstart', function(e) {\n"
                  "      e.stopPropagation();\n"
                  "      if (document.activeElement === txt) { e.preventDefault(); return; }")
        raw = raw.replace(variant, gd_new, 1)
        sys.stdout.buffer.write(b"OK: gd handle dragstart wired\n")
        found_gd = True
        break
if not found_gd:
    # Check what's actually there now
    idx = raw.find("gd-step', '1'")
    sys.stdout.buffer.write(f"gd-step context: {repr(raw[max(0,idx-200):idx+50])}\n".encode())

ts = int(time.time() * 1000)
raw = re.sub(r'<!-- v\d+ -->', f'<!-- v{ts} -->', raw)
with open(src, 'w', encoding='utf-8') as f:
    f.write(raw)
sys.stdout.buffer.write(f"Written v{ts}. Length: {len(raw)}\n".encode())
if not ok:
    sys.exit(1)
sys.stdout.buffer.write(b"All OK\n")
