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

# ── 1. Replace pencil button onclick → openManageCatsModal() ────────────────
patch("pencil btn -> openManageCatsModal",
    'onclick="goalsEditTabs()" title="Edit tab names"',
    'onclick="openManageCatsModal()" title="Manage Categories"')

# ── 2. Add Manage Categories modal HTML (before modal-addgoal) ───────────────
patch("inject manage-cats modal",
    '<div class="modal-overlay" id="modal-addgoal"',
    """<div class="modal-overlay" id="modal-manage-cats" style="display:none">
  <div class="modal" style="max-width:460px">
    <button class="close-btn" onclick="closeModal('manage-cats')">&#10005;</button>
    <div class="modal-title">&#127914; Manage Categories</div>
    <div class="modal-sub">Rename, delete, or add goal categories</div>
    <div id="mcat-list" style="display:flex;flex-direction:column;gap:10px;margin:18px 0 14px"></div>
    <div style="display:flex;gap:8px;align-items:center;margin-top:4px;border-top:1px solid var(--border);padding-top:14px">
      <select class="form-select" id="mcat-new-emoji" style="width:72px;flex-shrink:0">
        <option>&#127919;</option>
        <option>&#127968;</option>
        <option>&#128170;</option>
        <option>&#128176;</option>
        <option>&#128295;</option>
        <option>&#127774;</option>
        <option>&#128218;</option>
        <option>&#127891;</option>
        <option>&#128640;</option>
        <option>&#11088;</option>
        <option>&#128187;</option>
        <option>&#127829;</option>
      </select>
      <input class="form-input" id="mcat-new-name" placeholder="New category name..." maxlength="32" autocomplete="off" style="flex:1" onkeydown="if(event.key==='Enter'){event.preventDefault();mcatAdd();}">
      <button class="btn btn-primary btn-sm" onclick="mcatAdd()">+ Add</button>
    </div>
  </div>
</div>
<div class="modal-overlay" id="modal-addgoal\"""")

# ── 3. Add CSS for manage-cats modal rows ────────────────────────────────────
patch("manage-cats CSS",
    ".kcard-edit-btn { background:none; border:none; cursor:pointer; font-size:13px; color:var(--text3); padding:0 2px; line-height:1; transition:color .15s; flex-shrink:0; }\n.kcard-edit-btn:hover { color:var(--accent2); }",
    """.kcard-edit-btn { background:none; border:none; cursor:pointer; font-size:13px; color:var(--text3); padding:0 2px; line-height:1; transition:color .15s; flex-shrink:0; }
.kcard-edit-btn:hover { color:var(--accent2); }
.mcat-row { display:flex; align-items:center; gap:8px; background:var(--surface2); border-radius:8px; padding:8px 10px; }
.mcat-emoji-sel { width:64px; flex-shrink:0; background:var(--surface); border:1px solid var(--border); border-radius:6px; padding:4px; color:var(--text); font-size:14px; }
.mcat-name-inp { flex:1; background:var(--surface); border:1px solid var(--border); border-radius:6px; padding:6px 10px; color:var(--text); font-size:13px; }
.mcat-name-inp:focus { outline:none; border-color:var(--accent); }
.mcat-save-btn { background:var(--accent); color:#fff; border:none; border-radius:6px; padding:6px 10px; font-size:12px; font-weight:700; cursor:pointer; flex-shrink:0; }
.mcat-save-btn:hover { opacity:.85; }
.mcat-del-btn { background:none; border:none; color:var(--red,#e55); cursor:pointer; font-size:16px; flex-shrink:0; padding:0 2px; }
.mcat-del-btn:hover { opacity:.7; }""")

# ── 4. Inject JS functions: openManageCatsModal, renderMcatList, mcatSave, mcatDelete, mcatAdd ──
patch("inject manage-cats JS",
    "function openEditGoalModal(gid) {",
    """// ===== MANAGE CATEGORIES MODAL =====
function openManageCatsModal() {
  renderMcatList();
  openModal('manage-cats');
}
function renderMcatList() {
  var el = document.getElementById('mcat-list');
  if (!el) return;
  if (!categories.length) { el.innerHTML = '<div style="color:var(--text3);font-size:13px">No categories yet.</div>'; return; }
  el.innerHTML = categories.map(function(cat) {
    return '<div class="mcat-row" data-catid="'+cat.id+'">'
      +'<select class="mcat-emoji-sel" id="mcat-emoji-'+cat.id+'">'
      +['&#127919;','&#127968;','&#128170;','&#128176;','&#128295;','&#127774;','&#128218;','&#127891;','&#128640;','&#11088;','&#128187;','&#127829;'].map(function(e){
          var tmp=document.createElement('span'); tmp.innerHTML=e; var ch=tmp.textContent;
          return '<option'+(cat.emoji===ch?' selected':'')+'>'+e+'</option>';
        }).join('')
      +'</select>'
      +'<input class="mcat-name-inp" id="mcat-name-'+cat.id+'" value="'+esc(cat.name)+'" maxlength="32" onkeydown="if(event.key===\'Enter\'){mcatSave('+cat.id+');}">'
      +'<button class="mcat-save-btn" onclick="mcatSave('+cat.id+')">&#10003;</button>'
      +'<button class="mcat-del-btn" onclick="mcatDelete('+cat.id+')" title="Delete category">&#128465;&#65039;</button>'
      +'</div>';
  }).join('');
}
function mcatSave(catId) {
  var cat = categories.find(function(c){ return c.id===catId; });
  if (!cat) return;
  var nameEl = document.getElementById('mcat-name-'+catId);
  var emojiEl = document.getElementById('mcat-emoji-'+catId);
  var name = (nameEl ? nameEl.value : '').trim();
  if (!name) { alert('Category name cannot be empty.'); return; }
  var emojiRaw = emojiEl ? emojiEl.value : cat.emoji;
  var tmp = document.createElement('span'); tmp.innerHTML = emojiRaw; var emoji = tmp.textContent || emojiRaw;
  cat.name = name;
  cat.emoji = emoji;
  saveData();
  renderMcatList();
  renderKanban();
}
function mcatDelete(catId) {
  var cat = categories.find(function(c){ return c.id===catId; });
  if (!cat) return;
  var inUse = goals.some(function(g){ return g.catId===catId; });
  if (inUse && !confirm('Goals using "'+cat.name+'" will be uncategorized. Delete anyway?')) return;
  categories = categories.filter(function(c){ return c.id!==catId; });
  saveData();
  renderMcatList();
  renderKanban();
}
function mcatAdd() {
  var nameEl = document.getElementById('mcat-new-name');
  var emojiEl = document.getElementById('mcat-new-emoji');
  var name = (nameEl ? nameEl.value : '').trim();
  if (!name) { alert('Enter a category name.'); return; }
  var emojiRaw = emojiEl ? emojiEl.value : '&#11088;';
  var tmp = document.createElement('span'); tmp.innerHTML = emojiRaw; var emoji = tmp.textContent || emojiRaw;
  var newCat = { id: _nextCatId++, name: name, emoji: emoji };
  categories.push(newCat);
  localStorage.setItem('ezy_next_cat_id', _nextCatId);
  if (nameEl) nameEl.value = '';
  saveData();
  renderMcatList();
  renderKanban();
}

function openEditGoalModal(gid) {""")

# ── 5. Bump version ──────────────────────────────────────────────────────────
ts = int(time.time() * 1000)
c = re.sub(r'<!-- v\d+ -->', f'<!-- v{ts} -->', c)
sys.stdout.buffer.write(f"Version: v{ts}\n".encode('utf-8'))

with open(src, 'w', encoding='utf-8') as f:
    f.write(c)
sys.stdout.buffer.write(f"Written. Length: {len(c)}\n".encode('utf-8'))
if not ok:
    sys.exit(1)
sys.stdout.buffer.write(b"All patches OK\n")
