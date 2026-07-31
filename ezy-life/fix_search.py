import re, time

src = r"C:\Users\BIG D\.openclaw\workspace\ezy-life\index.html"
with open(src, 'r', encoding='utf-8') as f:
    c = f.read()

ok = True

def patch(label, old, new):
    global c, ok
    if old in c:
        c = c.replace(old, new, 1)
        print(f"OK: {label}")
    else:
        print(f"MISS: {label}")
        ok = False

# ── Fix 1: Replace JSON.stringify(sec) in onclick with data-sec attribute ────
# The bug: onclick="gsearchAct("Notes",0)" — inner quotes break the HTML attr
patch("gsearch item render - use data attributes",
      """html += '<div class="gsearch-item" data-ridx="'+sec+'_'+i+'" onclick="gsearchAct('+JSON.stringify(sec)+','+i+')">'+'<span class="gsearch-item-icon">'+r.icon+'</span><div class="gsearch-item-main"><div class="gsearch-item-title">'+esc(r.title)+'</div>'+(r.sub ? '<div class="gsearch-item-sub">'+esc(r.sub)+'</div>' : '')+'</div></div>';""",
      """html += '<div class="gsearch-item" data-sec="'+esc(sec)+'" data-idx="'+i+'" onclick="gsearchActEl(this)">'+'<span class="gsearch-item-icon">'+r.icon+'</span><div class="gsearch-item-main"><div class="gsearch-item-title">'+esc(r.title)+'</div>'+(r.sub ? '<div class="gsearch-item-sub">'+esc(r.sub)+'</div>' : '')+'</div></div>';""")

# ── Fix 2: Add gsearchActEl helper that reads data attributes ────────────────
patch("gsearchActEl function",
      "function gsearchAct(sec, i) {",
      """function gsearchActEl(el) {
  var sec = el.getAttribute('data-sec');
  var i = parseInt(el.getAttribute('data-idx'));
  gsearchAct(sec, i);
}
function gsearchAct(sec, i) {""")

# ── Fix 3: Also fix arrow-key Enter to use gsearchActEl ─────────────────────
# (already calls cur.click() which triggers onclick="gsearchActEl(this)" — OK)

# Bump version
ts = int(time.time() * 1000)
c = re.sub(r'<!-- v\d+ -->', f'<!-- v{ts} -->', c)
print(f"Version: v{ts}")

with open(src, 'w', encoding='utf-8') as f:
    f.write(c)
print(f"Written. Length: {len(c)}")
if not ok:
    print("WARNING: some patches missed!")
    import sys; sys.exit(1)
