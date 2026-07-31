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

# Fix: openModal -> showModal everywhere in the new code
patch("openManageCatsModal uses showModal",
    "  renderMcatList();\n  openModal('manage-cats');",
    "  renderMcatList();\n  showModal('manage-cats');")

patch("openEditGoalModal uses showModal",
    "  document.querySelector('#modal-addgoal .modal-title').innerHTML = '&#9998; Edit Goal';\n  openModal('addgoal');",
    "  document.querySelector('#modal-addgoal .modal-title').innerHTML = '&#9998; Edit Goal';\n  showModal('addgoal');")

patch("openAddGoalModal uses showModal",
    "  document.querySelector('#modal-addgoal .modal-title').innerHTML = '&#127919; Add Goal';",
    "  document.querySelector('#modal-addgoal .modal-title').innerHTML = '&#127919; Add Goal';")

# Also check openAddGoalModal for openModal calls
patch("openAddGoalModal showModal call",
    "  openModal('addgoal');\n}",
    "  showModal('addgoal');\n}")

ts = int(time.time() * 1000)
c = re.sub(r'<!-- v\d+ -->', f'<!-- v{ts} -->', c)
with open(src, 'w', encoding='utf-8') as f:
    f.write(c)
sys.stdout.buffer.write(f"Written v{ts}. Length: {len(c)}\n".encode('utf-8'))
if not ok:
    sys.exit(1)
sys.stdout.buffer.write(b"All OK\n")
