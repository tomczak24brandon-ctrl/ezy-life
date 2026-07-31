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

# Patch 1: Insert pencil button before done-chk in kanban card
patch("kanban pencil before done-chk",
    """' onclick="event.stopPropagation();kcardComplete('+g.id+',this)" />'\n    +'<button class="kcard-chevron\"""",
    """' onclick="event.stopPropagation();kcardComplete('+g.id+',this)" />'\n    +'<button class="kcard-edit-btn" onclick="event.stopPropagation();openEditGoalModal('+g.id+')" title="Edit goal">&#9998;</button>'\n    +'<button class="kcard-chevron\"""")

# Patch 2: Also exclude kcard-edit-btn from the card's own onclick
patch("kanban card onclick exclude edit btn",
    "&&!event.target.closest('.kcard-done-chk'))openGoalDetail",
    "&&!event.target.closest('.kcard-done-chk')&&!event.target.closest('.kcard-edit-btn'))openGoalDetail")

ts = int(time.time() * 1000)
c = re.sub(r'<!-- v\d+ -->', f'<!-- v{ts} -->', c)

with open(src, 'w', encoding='utf-8') as f:
    f.write(c)
sys.stdout.buffer.write(f"Written v{ts}. Length: {len(c)}\n".encode('utf-8'))
if not ok:
    sys.exit(1)
sys.stdout.buffer.write(b"All patches OK\n")
