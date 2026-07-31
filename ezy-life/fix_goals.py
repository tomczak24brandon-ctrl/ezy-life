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

# ── 1. Add pencil edit button to kanban card ─────────────────────────────────
patch("kanban card pencil button",
    """+'<input type="checkbox" class="kcard-done-chk" title="Mark goal complete" '+(isDone?'checked':'')+' onclick="event.stopPropagation();kcardComplete('+g.id+',this)" />'
    +'<button class="kcard-chevron" id="'+chevronId+'" onclick="event.stopPropagation();kcardToggle(\'' + g.id + '\')" title="Expand/collapse tasks"></button>'""",
    """+'<button class="kcard-edit-btn" onclick="event.stopPropagation();openEditGoalModal('+g.id+')" title="Edit goal">&#9998;</button>'
    +'<input type="checkbox" class="kcard-done-chk" title="Mark goal complete" '+(isDone?'checked':'')+' onclick="event.stopPropagation();kcardComplete('+g.id+',this)" />'
    +'<button class="kcard-chevron" id="'+chevronId+'" onclick="event.stopPropagation();kcardToggle(\'' + g.id + '\')" title="Expand/collapse tasks"></button>'""")

# ── 2. Add pencil edit button to goal dashboard card ─────────────────────────
patch("dashboard card pencil button",
    """html += '<div class="gd-card-cat">'+cat.emoji+' '+esc(cat.name)+'</div>';
    html += '<div class="gd-card-title">'+esc(g.title)+'</div>';""",
    """html += '<div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:2px">'
      +'<div class="gd-card-cat">'+cat.emoji+' '+esc(cat.name)+'</div>'
      +'<button class="kcard-edit-btn" onclick="event.stopPropagation();openEditGoalModal('+g.id+')" title="Edit goal" style="margin-top:-2px">&#9998;</button>'
      +'</div>';
    html += '<div class="gd-card-title">'+esc(g.title)+'</div>';""")

# ── 3. CSS for pencil edit button ─────────────────────────────────────────────
patch("kcard-edit-btn CSS",
    ".kcard-chevron { float:right; background:none; border:none; cursor:pointer; font-size:13px; color:var(--text3); padding:0 0 0 6px; line-height:1; transition:color .15s; }\n.kcard-chevron:hover { color:var(--accent); }",
    ".kcard-chevron { float:right; background:none; border:none; cursor:pointer; font-size:13px; color:var(--text3); padding:0 0 0 6px; line-height:1; transition:color .15s; }\n.kcard-chevron:hover { color:var(--accent); }\n.kcard-edit-btn { background:none; border:none; cursor:pointer; font-size:13px; color:var(--text3); padding:0 2px; line-height:1; transition:color .15s; flex-shrink:0; }\n.kcard-edit-btn:hover { color:var(--accent2); }")

# ── 4. Add "Custom Category" option + input to Add Goal modal ─────────────────
patch("g-cat select custom option",
    '<div class="form-group"><label class="form-label">Category</label><select class="form-select" id="g-cat"></select></div>',
    '<div class="form-group"><label class="form-label">Category</label><select class="form-select" id="g-cat" onchange="onGCatChange()"></select><div id="g-cat-custom-wrap" style="display:none;margin-top:8px"><input class="form-input" id="g-cat-custom-input" placeholder="New category name..." maxlength="32" autocomplete="off"><div style="display:flex;gap:6px;margin-top:6px"><select class="form-select" id="g-cat-custom-emoji" style="width:90px"><option>&#127919;</option><option>&#127968;</option><option>&#128170;</option><option>&#128176;</option><option>&#128295;</option><option>&#127774;</option><option>&#128218;</option><option>&#127891;</option><option>&#128640;</option><option>&#11088;</option></select><button type="button" class="btn btn-outline btn-sm" onclick="addCustomCategory()">+ Create</button></div></div></div>')

# ── 5. openAddGoalModal: add custom option to select ─────────────────────────
patch("openAddGoalModal populate cat select",
    """  var sel = document.getElementById('g-cat');
  sel.innerHTML = categories.map(function(c){ return '<option value="'+c.id+'"'+(catId===c.id?' selected':'')+'>'+c.emoji+' '+esc(c.name)+'</option>'; }).join('');""",
    """  var sel = document.getElementById('g-cat');
  sel.innerHTML = categories.map(function(c){ return '<option value="'+c.id+'"'+(catId===c.id?' selected':'')+'>'+c.emoji+' '+esc(c.name)+'</option>'; }).join('')
    + '<option value="__custom__">+ Add Custom Category</option>';
  document.getElementById('g-cat-custom-wrap').style.display='none';""")

# ── 6. saveGoal: handle __custom__ catId ─────────────────────────────────────
patch("saveGoal handle custom cat + edit mode",
    """function saveGoal() {
  var title = (document.getElementById('g-title').value||'').trim();
  if (!title){ alert('Please enter a goal title.'); return; }
  var catId = parseInt(document.getElementById('g-cat').value,10);
  goals.unshift({ id:Date.now(), title:title, catId:catId, targetDate:document.getElementById('g-date').value, steps:_gSteps.slice(), progress:0 });
  _gSteps = [];
  closeModal('addgoal');
  renderKanban();
  renderGoalsYearOverview();
  updateGoalsCount();
  saveData(""",
    """function saveGoal() {
  var title = (document.getElementById('g-title').value||'').trim();
  if (!title){ alert('Please enter a goal title.'); return; }
  var catSel = document.getElementById('g-cat').value;
  var catId = parseInt(catSel, 10);
  if (isNaN(catId) || catSel === '__custom__') {
    alert('Please create or select a category first.');
    return;
  }
  var dateVal = document.getElementById('g-date').value;
  if (_editingGoalId) {
    // Edit mode — update existing goal
    var existing = goals.find(function(g){ return g.id === _editingGoalId; });
    if (existing) {
      existing.title = title;
      existing.catId = catId;
      existing.targetDate = dateVal;
      existing.steps = _gSteps.slice();
    }
    _editingGoalId = null;
  } else {
    goals.unshift({ id:Date.now(), title:title, catId:catId, targetDate:dateVal, steps:_gSteps.slice(), progress:0 });
  }
  _gSteps = [];
  closeModal('addgoal');
  renderKanban();
  renderGoalsYearOverview();
  updateGoalsCount();
  saveData(""")

# ── 7. Add openEditGoalModal, onGCatChange, addCustomCategory functions ───────
patch("inject goal edit + custom cat functions",
    "function openAddGoalModal(catId) {",
    """function openEditGoalModal(gid) {
  var g = goals.find(function(x){ return x.id===gid; });
  if (!g) return;
  _editingGoalId = gid;
  _gSteps = (g.steps||[]).map(function(s){ return Object.assign({},s); });
  var sel = document.getElementById('g-cat');
  sel.innerHTML = categories.map(function(c){ return '<option value="'+c.id+'"'+(g.catId===c.id?' selected':'')+'>'+c.emoji+' '+esc(c.name)+'</option>'; }).join('')
    + '<option value="__custom__">+ Add Custom Category</option>';
  document.getElementById('g-cat-custom-wrap').style.display='none';
  document.getElementById('g-title').value = g.title;
  document.getElementById('g-date').value = g.targetDate||'';
  renderGSteps();
  document.querySelector('#modal-addgoal .modal-title').innerHTML = '&#9998; Edit Goal';
  openModal('addgoal');
}
function onGCatChange() {
  var val = document.getElementById('g-cat').value;
  document.getElementById('g-cat-custom-wrap').style.display = (val==='__custom__') ? '' : 'none';
}
function addCustomCategory() {
  var name = (document.getElementById('g-cat-custom-input').value||'').trim();
  if (!name) { alert('Enter a category name.'); return; }
  var emojiSel = document.getElementById('g-cat-custom-emoji');
  var emoji = emojiSel ? emojiSel.value : '&#11088;';
  // Decode entity if it's a text node
  var tmp = document.createElement('span'); tmp.innerHTML = emoji; emoji = tmp.textContent || emoji;
  var newCat = { id: _nextCatId++, name: name, emoji: emoji };
  categories.push(newCat);
  localStorage.setItem('ezy_next_cat_id', _nextCatId);
  saveData();
  // Select the new category
  var sel = document.getElementById('g-cat');
  sel.innerHTML = categories.map(function(c){ return '<option value="'+c.id+'"'+(c.id===newCat.id?' selected':'')+'>'+c.emoji+' '+esc(c.name)+'</option>'; }).join('')
    + '<option value="__custom__">+ Add Custom Category</option>';
  document.getElementById('g-cat-custom-wrap').style.display='none';
  document.getElementById('g-cat-custom-input').value='';
  renderKanban();
}
function openAddGoalModal(catId) {
  _editingGoalId = null;
  document.querySelector('#modal-addgoal .modal-title').innerHTML = '&#127919; Add Goal';""")

# ── 8. openAddGoalModal: ensure _editingGoalId is cleared ────────────────────
# Already handled in injection above — openAddGoalModal now gets _editingGoalId=null prepended

# ── 9. Verify _editingGoalId is declared ─────────────────────────────────────
if 'var _editingGoalId' not in c:
    # Add near _editingTaskId
    patch("declare _editingGoalId",
        "var _editingTaskDk = null, _editingTaskId = null;",
        "var _editingTaskDk = null, _editingTaskId = null;\nvar _editingGoalId = null;")
else:
    print("OK: _editingGoalId already declared")

# ── 10. Bump version ──────────────────────────────────────────────────────────
ts = int(time.time() * 1000)
c = re.sub(r'<!-- v\d+ -->', f'<!-- v{ts} -->', c)
print(f"Version: v{ts}")

with open(src, 'w', encoding='utf-8') as f:
    f.write(c)
print(f"Written. Length: {len(c)}")
if not ok:
    print("WARNING: some patches missed!")
    import sys; sys.exit(1)
print("All patches applied successfully.")
