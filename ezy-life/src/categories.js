
function buildTaskColorPicker() {

  var el = document.getElementById('task-color-picker');

  el.innerHTML = EVT_COLORS.map(function(c){

    return '<div class="evt-color-dot'+(c.val===window._selectedTaskColor?' selected':'')+'" style="background:'+c.val+'" title="'+c.label+'" onclick="selectTaskColor(\''+c.val+'\')"></div>';

  }).join('');

}

function selectTaskColor(val) {

  window._selectedTaskColor = val;

  buildTaskColorPicker();

}

// ===== GOALS (KANBAN) =====

// ===== GOAL STEPS (checklist) =====

var _gSteps = []; // temp steps when adding

var _gdSteps = []; // temp steps when editing

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

}

function renderMcatList() {

  var el = document.getElementById('mcat-list');

  if (!el) return;

  if (!categories.length) { el.innerHTML = '<div style="color:var(--text3);font-size:13px">No categories yet.</div>'; return; }

  el.innerHTML = categories.map(function(cat) {

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

      +'<input type="file" id="mcat-upload-'+cat.id+'" accept="image/*" style="display:none" onchange="mcatHandleUpload('+cat.id+',this)">'

      +'<button class="mcat-save-btn" onclick="mcatUploadIcon(\'' + cat.id + '\')" title="Upload custom icon" style="background:var(--surface2);color:var(--text2);font-size:11px">&#128247;</button>'

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

}

function mcatSave(catId) {

  var cat = categories.find(function(c){ return c.id===catId; });

  if (!cat) return;

  var nameEl = document.getElementById('mcat-name-'+catId);

  var emojiEl = document.getElementById('mcat-emoji-'+catId);

  var name = (nameEl ? nameEl.value : '').trim();

  if (!name) { alert('Category name cannot be empty.'); return; }

  // emoji is stored directly on cat by EP callback; just keep existing

  cat.name = name;

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

  var newBtn = document.getElementById('mcat-new-ep-btn');

  var emoji = _mcatNewEmoji || (newBtn ? (newBtn.textContent || newBtn.innerText || '?').trim() : '?');

  var iconUrl = _mcatNewIconUrl || null;

  _mcatNewEmoji = null; _mcatNewIconUrl = null;

  var newCat = { id: window._nextCatId++, name: name, emoji: emoji, iconUrl: iconUrl };

  categories.push(newCat);

  localStorage.setItem('ezy_next_cat_id', window._nextCatId);

  if (nameEl) nameEl.value = '';
  var resetBtn = document.getElementById('mcat-new-ep-btn');
  if (resetBtn) resetBtn.innerHTML = '&#127919;';
  saveData();
  renderMcatList();
  renderKanban();
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

  var newCat = { id: window._nextCatId++, name: name, emoji: emoji };

  categories.push(newCat);

  localStorage.setItem('ezy_next_cat_id', window._nextCatId);

  saveData();

  // Select the new category

  var sel = document.getElementById('g-cat');

  sel.innerHTML = categories.map(function(c){ return '<option value="'+c.id+'"'+(c.id===newCat.id?' selected':'')+'>'+c.emoji+' '+esc(c.name)+'</option>'; }).join('')

    + '<option value="__custom__">+ Add Custom Category</option>';

  document.getElementById('g-cat-custom-wrap').style.display='none';

  document.getElementById('g-cat-custom-input').value='';

  renderKanban();

}

function openCatModal() {

  window._newCatEmoji='⭐';

  document.getElementById('new-cat-emoji').textContent='⭐';

  document.getElementById('new-cat-name').value='';

  renderCatList();

  renderKanban();

  buildEP('new',function(emoji){ window._newCatEmoji=emoji; document.getElementById('new-cat-emoji').textContent=emoji; });

  showModal('cats');

}

function renameCat(id){

  var c=categories.find(function(x){return x.id===id;});

  if(!c)return;

  var n=prompt('Rename category:',c.name);

  if(n&&n.trim()&&n.trim()!==c.name){

    if(categories.find(function(x){return x.id!==id&&x.name.toLowerCase()===n.trim().toLowerCase();})){alert('Name already used.');return;}

    c.name=n.trim(); renderCatList(); saveData();

  }

}

// ===== CATEGORY LIST DRAG-AND-DROP =====

var _catDragSrc = null;

function catItemDragStart(e, idx) {

  _catDragSrc = idx;

  e.dataTransfer.effectAllowed = 'move';

  setTimeout(function(){ var el=e.currentTarget; if(el) el.classList.add('cat-dragging'); },0);

}

function catItemDragOver(e, idx) {

  if(_catDragSrc===null||_catDragSrc===idx) return;

  e.preventDefault();

  var el = e.currentTarget;

  var rect = el.getBoundingClientRect();

  var insertBefore = (e.clientY - rect.top) < rect.height / 2;

  document.querySelectorAll('.cat-item').forEach(function(r){ r.classList.remove('cat-drag-over','cat-drop-before','cat-drop-after'); });

  el.classList.add(insertBefore ? 'cat-drop-before' : 'cat-drop-after');

  el._catInsertBefore = insertBefore;

}

function catItemDrop(e, idx) {

  e.preventDefault();

  var target = e.currentTarget;

  var insertBefore = target._catInsertBefore !== false;

  document.querySelectorAll('.cat-item').forEach(function(el){ el.classList.remove('cat-drag-over','cat-dragging','cat-drop-before','cat-drop-after'); });

  if(_catDragSrc===null||_catDragSrc===idx) return;

  var moved = categories.splice(_catDragSrc, 1)[0];

  // Recalc idx after splice

  var newIdx = categories.findIndex(function(x){ return false; }); // placeholder

  // Find the target element's new position

  var allItems = document.querySelectorAll('.cat-item');

  var targetItem = target;

  var afterSplice = Array.from(allItems).indexOf(targetItem);

  var insertAt = insertBefore ? idx : idx + 1;

  if (_catDragSrc < idx) insertAt = insertBefore ? idx - 1 : idx;

  if (insertAt < 0) insertAt = 0;

  if (insertAt > categories.length) insertAt = categories.length;

  categories.splice(insertAt, 0, moved);

  _catDragSrc = null;

  renderCatList(); renderKanban(); saveData();

}

function catItemDragEnd() {

  _catDragSrc = null;

  document.querySelectorAll('.cat-item').forEach(function(el){ el.classList.remove('cat-drag-over','cat-dragging','cat-drop-before','cat-drop-after'); });

}

function renderCatList(){

  var list=document.getElementById('cat-list');

  list.innerHTML=categories.map(function(c, idx){

    return '<div class="cat-item" draggable="true" ondragstart="catItemDragStart(event,'+idx+')" ondragover="catItemDragOver(event,'+idx+')" ondrop="catItemDrop(event,'+idx+')" ondragend="catItemDragEnd()"><span class="cat-drag-handle" title="Drag to reorder">?</span><div class="ep-wrap"><button class="cat-emoji-btn" onclick="openCatEP('+c.id+')">'+c.emoji+'</button><div class="ep-popup" id="ep-cat'+c.id+'"></div></div><span class="cat-name" title="Double-click to rename" ondblclick="renameCat('+c.id+')">'+esc(c.name)+'</span><button class="btn btn-outline btn-sm" onclick="renameCat('+c.id+')" style="padding:3px 8px;font-size:11px">✏️</button><button class="cat-del" onclick="delCat('+c.id+')" title="Delete">🗑️</button></div>';

  }).join('');

  categories.forEach(function(c){

    buildEP('cat'+c.id,(function(cat){ return function(emoji){ cat.emoji=emoji; closeAllEPs(); renderCatList(); saveData(); }; })(c));

  });

}

function openCatEP(id){ toggleEP('cat'+id); }

function addCat(){

  var name=(document.getElementById('new-cat-name').value||'').trim();

  if(!name){ alert('Enter a category name.'); return; }

  if(categories.find(function(c){ return c.name.toLowerCase()===name.toLowerCase(); })){ alert('That category already exists.'); return; }

  categories.push({id:window._nextCatId++,name:name,emoji:window._newCatEmoji});

  window._newCatEmoji='⭐'; document.getElementById('new-cat-emoji').textContent='⭐'; document.getElementById('new-cat-name').value='';

  renderCatList();

  renderKanban();

  buildEP('new',function(emoji){ window._newCatEmoji=emoji; document.getElementById('new-cat-emoji').textContent=emoji; });

  saveData();

}

function delCat(id){

  if(categories.length<=1){alert('Need at least one category.');return;}

  if(!confirm('Delete this category?'))return;

  categories=categories.filter(function(c){return c.id!==id;});

  renderCatList();

  saveData();

}

// ===== EMOJI PICKER =====

var EP_CATS = [

  { icon:'??', label:'Smileys', emojis:['??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??'] },

  { icon:'??', label:'People', emojis:['??','??','???','?','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','???','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','?????','?????','?????','?????','?????','?????','?????','?????','?????','?????','?????','?????','?????','?????','?????','?????','?????','?????','?????'] },

  { icon:'??', label:'Animals', emojis:['??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','???','??','??','??','??','??','??','??','???','??'] },

  { icon:'??', label:'Food', emojis:['??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','?','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','???','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??'] },

  { icon:'??', label:'Travel', emojis:['??','??','??','??','??','??','??','??','??','??','???','??','??','??','??','??','??','??','???','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','?','??','???','???','??','??','???','??','???','??','??','???','???','???','???','???','???','???','???','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','?','??','??','??','??','??','?','?','??','??','???','??','??','??','??','??'] },

  { icon:'?', label:'Sports', emojis:['?','??','??','?','??','??','??','??','??','??','??','??','?','??','??','??','??','??','??','??','??','??','??','??','??','??','???','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','???','???','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','???','??','??','??','??'] },

  { icon:'???', label:'Objects', emojis:['???','??','??','??','??','??','???','??','??','??','??','??','??','??','???','??','??','??','??','??','??','??','??','??','??','??','??','???','??','???','???','??','??','??','??','???','??','???','??','??','??','??','??','??','??','??','??','???','???','??','??','??','??','??','??','??','??','??','??','??','??','??','???','???','??','??','??','???','??','??','??','??','???','??','??','??','??'] },

  { icon:'?', label:'Symbols', emojis:['?','?','?','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','??','???','??','??','??','??','??','??','?','?','?','?','?','?','?','?','?','?','?','?','?','??','??','??','??','??','??','??','??','??','??','???','???','??','??','???','??','?','?','?','?','??','??','??','??','??','??','??','??','??','??','??','??','??','?','?','?','??','??','??','??','?','?','??','??','?','?','??','??','??','??','??','??','??','?','?'] }

];

var _epActiveIdx = 0;

var _epSearchTerm = '';

var _epCBs = {};

function buildEP(key, cb) {

  var el = document.getElementById('ep-' + key);

  if (!el) return;

  _epCBs[key] = cb;

  el._cb = cb;

  _renderEP(key);

}

function _renderEP(key) {

  var el = document.getElementById('ep-' + key);

  if (!el) return;

  var cat = EP_CATS[_epActiveIdx] || EP_CATS[0];

  var term = _epSearchTerm.toLowerCase();

  var list = term

    ? EP_CATS.reduce(function(a,c){ return a.concat(c.emojis); }, []).filter(function(e){ return e.indexOf(term) >= 0; }).slice(0,120)

    : cat.emojis;

  var tabsHtml = EP_CATS.map(function(cat2, i) {

    var cls = 'ep-cat-tab' + ((i === _epActiveIdx && !term) ? ' ep-tab-active' : '');

    return '<button class="' + cls + '" data-epkey="' + key + '" data-idx="' + i + '" onclick="event.stopPropagation();_epSetCat(this.dataset.epkey,parseInt(this.dataset.idx))" title="' + cat2.label + '">' + cat2.icon + '</button>';

  }).join('');

  var gridHtml = list.map(function(emoji) {

    var safeEmoji = emoji.replace(/"/g, '&quot;');

    return '<span class="ep-opt" data-epkey="' + key + '" data-val="' + safeEmoji + '" onclick="event.stopPropagation();pickEmoji(this.dataset.epkey,this.dataset.val)">' + emoji + '</span>';

  }).join('');

  var kbdId = 'ep-kbd-' + key;

  var kbdRow = '<div class="ep-kbd-row">'

    + '<input class="ep-kbd-inp" id="' + kbdId + '" placeholder="Type or paste any emoji, press Use" data-epkey="' + key + '" oninput="event.stopPropagation()" onkeydown="event.stopPropagation();if(event.key===String.fromCharCode(13)){var v=this.value.trim();if(v)pickEmoji(this.dataset.epkey,v);}" autocomplete="off">'

    + '<button class="ep-kbd-btn" data-kbdid="' + kbdId + '" data-epkey="' + key + '" onclick="event.stopPropagation();var v=document.getElementById(this.dataset.kbdid).value.trim();if(v)pickEmoji(this.dataset.epkey,v);">Use ?</button>'

    + '</div>';

  var searchRow = '<input class="ep-search-inp" placeholder="Search emoji..." value="'

    + _epSearchTerm.replace(/"/g, '&quot;')

    + '" data-epkey="' + key + '" oninput="event.stopPropagation();_epSearch(this.dataset.epkey,this.value)" autocomplete="off">';

  el.innerHTML = kbdRow + searchRow + '<div class="ep-cat-tabs">' + tabsHtml + '</div><div class="ep-grid">' + gridHtml + '</div>';

}

function _epSetCat(key, idx) {

  _epActiveIdx = idx;

  _epSearchTerm = '';

  _renderEP(key);

}

function _epSearch(key, term) {

  _epSearchTerm = term;

  _renderEP(key);

}

function toggleEP(key) {

  var el = document.getElementById('ep-' + key);

  if (!el) return;

  var was = el.classList.contains('open');

  closeAllEPs();

  if (!was) { _epActiveIdx = 0; _epSearchTerm = ''; el.classList.add('open'); _renderEP(key); }

}

function closeAllEPs() { document.querySelectorAll('.ep-popup').forEach(function(p){ p.classList.remove('open'); }); }

document.addEventListener('click',function(e){ if(!e.target.closest('.ep-wrap')&&!e.target.classList.contains('cat-emoji-btn'))closeAllEPs(); });

// ===== NOTES =====

var NOTE_COLORS = [

  {cls:'',      label:'Default'},

  {cls:'nc-red',    label:'Red'},

  {cls:'nc-orange', label:'Orange'},

  {cls:'nc-yellow', label:'Yellow'},

  {cls:'nc-green',  label:'Green'},

  {cls:'nc-teal',   label:'Teal'},

  {cls:'nc-blue',   label:'Blue'},

  {cls:'nc-pink',   label:'Pink'}

];


// --- window exports ---
window.openCatModal = openCatModal;
window.renameCat = renameCat;
window.catItemDragStart = catItemDragStart;
window.catItemDragOver = catItemDragOver;
window.catItemDrop = catItemDrop;
window.catItemDragEnd = catItemDragEnd;
window.renderCatList = renderCatList;
window.openCatEP = openCatEP;
window.addCat = addCat;
window.delCat = delCat;
window.toggleEP = toggleEP;
window.closeAllEPs = closeAllEPs;
window.buildTaskColorPicker = buildTaskColorPicker;
window.selectTaskColor = selectTaskColor;
window.mcatToggleEP = mcatToggleEP;
window.mcatUploadIcon = mcatUploadIcon;
window.mcatHandleUpload = mcatHandleUpload;
window.mcatNewUpload = mcatNewUpload;
window.mcatSave = mcatSave;
window.mcatDelete = mcatDelete;
window.mcatAdd = mcatAdd;
window.onGCatChange = onGCatChange;
window.addCustomCategory = addCustomCategory;
window.openManageCatsModal = openManageCatsModal;
window.renderMcatList = renderMcatList;
window._epSetCat = _epSetCat;
window._epSearch = _epSearch;
window._renderEP = _renderEP;
