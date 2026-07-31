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

# ── 1. Replace renderMcatList rows — swap emoji select for emoji text input ──
# The select was rendering as a giant expanded list on some browsers.
# Use a simple text input limited to 2 chars instead.

patch("renderMcatList: emoji select → text input",
    """  el.innerHTML = categories.map(function(cat) {
    return '<div class="mcat-row" data-catid="'+cat.id+'">'
      +'<select class="mcat-emoji-sel" id="mcat-emoji-'+cat.id+'">'
      +['&#127919;','&#127968;','&#128170;','&#128176;','&#128295;','&#127774;','&#128218;','&#127891;','&#128640;','&#11088;','&#128187;','&#127829;'].map(function(e){
          var tmp=document.createElement('span'); tmp.innerHTML=e; var ch=tmp.textContent;
          return '<option'+(cat.emoji===ch?' selected':'')+'>'+e+'</option>';
        }).join('')
      +'</select>'
      +'<input class="mcat-name-inp" id="mcat-name-'+cat.id+'" value="'+esc(cat.name)+'" maxlength="32" onkeydown="if(event.key==&quot;Enter&quot;){mcatSave('+cat.id+');}">'
      +'<button class="mcat-save-btn" onclick="mcatSave('+cat.id+')">&#10003;</button>'
      +'<button class="mcat-del-btn" onclick="mcatDelete('+cat.id+')" title="Delete category">&#128465;&#65039;</button>'
      +'</div>';
  }).join('');""",
    """  el.innerHTML = categories.map(function(cat) {
    return '<div class="mcat-row" data-catid="'+cat.id+'">'
      +'<input class="mcat-emoji-inp" id="mcat-emoji-'+cat.id+'" value="'+cat.emoji+'" maxlength="2" title="Emoji (paste or type)">'
      +'<input class="mcat-name-inp" id="mcat-name-'+cat.id+'" value="'+esc(cat.name)+'" maxlength="32" placeholder="Category name" onkeydown="if(event.key==&quot;Enter&quot;){mcatSave('+cat.id+');}">'
      +'<button class="mcat-save-btn" onclick="mcatSave('+cat.id+')" title="Save">&#10003;</button>'
      +'<button class="mcat-del-btn" onclick="mcatDelete('+cat.id+')" title="Delete">&#128465;</button>'
      +'</div>';
  }).join('');""")

# ── 2. Update mcatSave to read emoji from text input ─────────────────────────
patch("mcatSave reads emoji text input",
    """  var emojiRaw = emojiEl ? emojiEl.value : cat.emoji;
  var tmp = document.createElement('span'); tmp.innerHTML = emojiRaw; var emoji = tmp.textContent || emojiRaw;
  cat.name = name;
  cat.emoji = emoji;""",
    """  var emoji = (emojiEl ? emojiEl.value.trim() : '') || cat.emoji;
  cat.name = name;
  cat.emoji = emoji;""")

# ── 3. Update mcatAdd to read from select (bottom "add" bar keeps the select) ─
# The bottom bar still uses the <select> — that's fine, leave it.
# But also fix mcatAdd to handle it gracefully:
patch("mcatAdd emoji from select value",
    """  var emojiRaw = emojiEl ? emojiEl.value : '&#11088;';
  var tmp = document.createElement('span'); tmp.innerHTML = emojiRaw; var emoji = tmp.textContent || emojiRaw;
  var newCat = { id: _nextCatId++, name: name, emoji: emoji };""",
    """  var emojiRaw = emojiEl ? emojiEl.value : '\u2b50';
  var tmp = document.createElement('span'); tmp.innerHTML = emojiRaw; var emoji = tmp.textContent || emojiRaw || '\u2b50';
  var newCat = { id: _nextCatId++, name: name, emoji: emoji };""")

# ── 4. Update CSS: replace mcat-emoji-sel with mcat-emoji-inp ─────────────────
patch("mcat-emoji-sel CSS → mcat-emoji-inp",
    """.mcat-emoji-sel { width:64px; flex-shrink:0; background:var(--surface); border:1px solid var(--border); border-radius:6px; padding:4px; color:var(--text); font-size:14px; }""",
    """.mcat-emoji-inp { width:44px; flex-shrink:0; background:var(--surface); border:1px solid var(--border); border-radius:6px; padding:4px 6px; color:var(--text); font-size:18px; text-align:center; cursor:text; }
.mcat-emoji-inp:focus { outline:none; border-color:var(--accent); }""")

# ── 5. Bump version ───────────────────────────────────────────────────────────
ts = int(time.time() * 1000)
c = re.sub(r'<!-- v\d+ -->', f'<!-- v{ts} -->', c)
with open(src, 'w', encoding='utf-8') as f:
    f.write(c)
sys.stdout.buffer.write(f"Written v{ts}. Length: {len(c)}\n".encode('utf-8'))
if not ok:
    sys.exit(1)
sys.stdout.buffer.write(b"All OK\n")
