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

# ── Helper: render an icon (emoji or base64/URL img) ─────────────────────────
# We'll add a JS helper function `renderCatIcon(cat)` that returns HTML string

# ── 1. Replace renderMcatList rows with ep-wrap pattern + upload ──────────────
patch("renderMcatList: ep-wrap + upload",
    """  el.innerHTML = categories.map(function(cat) {
    return '<div class="mcat-row" data-catid="'+cat.id+'">'
      +'<input class="mcat-emoji-inp" id="mcat-emoji-'+cat.id+'" value="'+cat.emoji+'" maxlength="2" title="Emoji (paste or type)">'
      +'<input class="mcat-name-inp" id="mcat-name-'+cat.id+'" value="'+esc(cat.name)+'" maxlength="32" placeholder="Category name" onkeydown="if(event.key==&quot;Enter&quot;){mcatSave('+cat.id+');}">'
      +'<button class="mcat-save-btn" onclick="mcatSave('+cat.id+')" title="Save">&#10003;</button>'
      +'<button class="mcat-del-btn" onclick="mcatDelete('+cat.id+')" title="Delete">&#128465;</button>'
      +'</div>';
  }).join('');
}""",
    """  el.innerHTML = categories.map(function(cat) {
    var iconHtml = cat.iconUrl
      ? '<img src="'+cat.iconUrl+'" class="mcat-icon-img" alt="">'
      : cat.emoji;
    return '<div class="mcat-row" data-catid="'+cat.id+'">'
      +'<div class="ep-wrap">'
        +'<button class="cat-emoji-btn mcat-ep-btn" id="mcat-epbtn-'+cat.id+'" onclick="event.stopPropagation();mcatToggleEP('+cat.id+')" title="Pick emoji">'+iconHtml+'</button>'
        +'<div class="ep-popup" id="ep-mcat'+cat.id+'"></div>'
      +'</div>'
      +'<input class="mcat-name-inp" id="mcat-name-'+cat.id+'" value="'+esc(cat.name)+'" maxlength="32" placeholder="Category name" onkeydown="if(event.key==&quot;Enter&quot;){mcatSave('+cat.id+');}">'
      +'<button class="mcat-save-btn" onclick="mcatSave('+cat.id+')" title="Save">&#10003;</button>'
      +'<button class="mcat-del-btn" onclick="mcatDelete('+cat.id+')" title="Delete">&#128465;</button>'
      +'</div>';
  }).join('');
  // Wire EP for each category row
  categories.forEach(function(cat) {
    buildEP('mcat'+cat.id, (function(c) {
      return function(emoji) {
        c.emoji = emoji;
        c.iconUrl = null;
        var btn = document.getElementById('mcat-epbtn-'+c.id);
        if (btn) btn.innerHTML = emoji;
        saveData();
      };
    })(cat));
  });
}""")

# ── 2. Replace bottom "Add" section: swap <select> for ep-wrap ───────────────
patch("manage-cats add row: ep-wrap",
    """    <div style="display:flex;gap:8px;align-items:center;margin-top:4px;border-top:1px solid var(--border);padding-top:14px">
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
    </div>""",
    """    <div style="display:flex;gap:8px;align-items:center;margin-top:4px;border-top:1px solid var(--border);padding-top:14px">
      <div class="ep-wrap" style="flex-shrink:0">
        <button class="cat-emoji-btn" id="mcat-new-ep-btn" onclick="event.stopPropagation();toggleEP('mcat-new')" title="Pick emoji">&#127919;</button>
        <div class="ep-popup" id="ep-mcat-new"></div>
      </div>
      <input type="file" id="mcat-new-upload" accept="image/*" style="display:none" onchange="mcatNewUpload(this)">
      <input class="form-input" id="mcat-new-name" placeholder="New category name..." maxlength="32" autocomplete="off" style="flex:1" onkeydown="if(event.key==='Enter'){event.preventDefault();mcatAdd();}">
      <button class="btn btn-primary btn-sm" onclick="mcatAdd()">+ Add</button>
    </div>""")

# ── 3. Update mcatSave: read emoji from the EP button text ────────────────────
patch("mcatSave reads EP button",
    """  var emoji = (emojiEl ? emojiEl.value.trim() : '') || cat.emoji;
  cat.name = name;
  cat.emoji = emoji;""",
    """  // emoji is stored directly on cat by EP callback; just keep existing
  cat.name = name;""")

# ── 4. Update mcatAdd: read emoji from EP button, support iconUrl ─────────────
patch("mcatAdd reads EP btn + iconUrl",
    """  var emojiRaw = emojiEl ? emojiEl.value : '\u2b50';
  var tmp = document.createElement('span'); tmp.innerHTML = emojiRaw; var emoji = tmp.textContent || emojiRaw || '\u2b50';
  var newCat = { id: _nextCatId++, name: name, emoji: emoji };""",
    """  var newBtn = document.getElementById('mcat-new-ep-btn');
  var emoji = _mcatNewEmoji || (newBtn ? (newBtn.textContent || newBtn.innerText || '\u2b50').trim() : '\u2b50');
  var iconUrl = _mcatNewIconUrl || null;
  _mcatNewEmoji = null; _mcatNewIconUrl = null;
  var newCat = { id: _nextCatId++, name: name, emoji: emoji, iconUrl: iconUrl };""")

# ── 5. Add mcatToggleEP, mcatNewUpload, _mcatNew* state vars, mcatUploadIcon ─
patch("inject mcat EP helpers",
    "function openManageCatsModal() {",
    """// ===== MCAT EMOJI PICKER HELPERS =====
var _mcatNewEmoji = null;
var _mcatNewIconUrl = null;

function openManageCatsModal() {""")

patch("inject mcatToggleEP + upload fns after openManageCatsModal",
    "  renderMcatList();\n  showModal('manage-cats');\n}",
    """  renderMcatList();
  showModal('manage-cats');
  // Wire EP for the "new" row
  setTimeout(function() {
    buildEP('mcat-new', function(emoji) {
      _mcatNewEmoji = emoji;
      _mcatNewIconUrl = null;
      var btn = document.getElementById('mcat-new-ep-btn');
      if (btn) btn.innerHTML = emoji;
    });
  }, 0);
}
function mcatToggleEP(catId) {
  toggleEP('mcat'+catId);
}
function mcatUploadIcon(catId) {
  var inp = document.getElementById('mcat-upload-'+catId);
  if (inp) inp.click();
}
function mcatHandleUpload(catId, input) {
  var file = input.files && input.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    var b64 = e.target.result;
    var cat = categories.find(function(c){ return c.id===catId; });
    if (!cat) return;
    cat.iconUrl = b64;
    cat.emoji = ''; // clear emoji when custom image set
    var btn = document.getElementById('mcat-epbtn-'+catId);
    if (btn) btn.innerHTML = '<img src="'+b64+'" class="mcat-icon-img" alt="">';
    saveData();
  };
  reader.readAsDataURL(file);
}
function mcatNewUpload(input) {
  var file = input.files && input.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    _mcatNewIconUrl = e.target.result;
    _mcatNewEmoji = null;
    var btn = document.getElementById('mcat-new-ep-btn');
    if (btn) btn.innerHTML = '<img src="'+_mcatNewIconUrl+'" class="mcat-icon-img" alt="">';
  };
  reader.readAsDataURL(file);
}""")

# ── 6. Update renderCatIcon helper used across app ────────────────────────────
# Add a global helper before renderMcatList
patch("inject renderCatIcon helper",
    "function renderMcatList() {",
    """function catIconHtml(cat) {
  if (!cat) return '';
  if (cat.iconUrl) return '<img src="'+cat.iconUrl+'" class="mcat-icon-img" style="width:18px;height:18px;border-radius:3px;object-fit:cover;vertical-align:middle" alt="">';
  return cat.emoji || '';
}
function renderMcatList() {""")

# ── 7. CSS: mcat-icon-img + mcat-ep-btn tweak ────────────────────────────────
patch("mcat-icon-img CSS",
    ".mcat-emoji-inp { width:44px; flex-shrink:0; background:var(--surface); border:1px solid var(--border); border-radius:6px; padding:4px 6px; color:var(--text); font-size:18px; text-align:center; cursor:text; }\n.mcat-emoji-inp:focus { outline:none; border-color:var(--accent); }",
    """.mcat-icon-img { width:20px; height:20px; border-radius:3px; object-fit:cover; vertical-align:middle; display:inline-block; }
.mcat-ep-btn { min-width:34px; min-height:34px; display:flex; align-items:center; justify-content:center; }""")

# ── 8. Also add Upload icon button inside each EP popup (after EP builds) ─────
# We'll inject an upload input hidden per row in the mcat-row HTML
patch("mcat-row: add hidden upload input",
    """      +'<button class="mcat-del-btn" onclick="mcatDelete('+cat.id+')" title="Delete">&#128465;</button>'
      +'</div>';""",
    """      +'<button class="mcat-del-btn" onclick="mcatDelete('+cat.id+')" title="Delete">&#128465;</button>'
      +'<input type="file" id="mcat-upload-'+cat.id+'" accept="image/*" style="display:none" onchange="mcatHandleUpload('+cat.id+',this)">'
      +'<button class="mcat-save-btn" onclick="document.getElementById(\'mcat-upload-\'+'+cat.id+').click()" title="Upload custom icon" style="background:var(--surface2);color:var(--text2);font-size:11px">&#128247;</button>'
      +'</div>';""")

# ── 9. Bump version ───────────────────────────────────────────────────────────
ts = int(time.time() * 1000)
c = re.sub(r'<!-- v\d+ -->', f'<!-- v{ts} -->', c)
with open(src, 'w', encoding='utf-8') as f:
    f.write(c)
sys.stdout.buffer.write(f"Version: v{ts}. Length: {len(c)}\n".encode('utf-8'))
if not ok:
    sys.exit(1)
sys.stdout.buffer.write(b"All OK\n")
