const fs = require('fs');
const path = 'C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html';
let html = fs.readFileSync(path, 'utf8');

// ─────────────────────────────────────────────────────────────────────────────
// 1. CSS — add before </style>
// ─────────────────────────────────────────────────────────────────────────────
const CSS_ANCHOR = '.ql-list-saved{opacity:.55;cursor:default;}\n</style>';
const CSS_NEW = `.ql-list-saved{opacity:.55;cursor:default;}
/* ===== HOME ICON EDIT ===== */
.home-block-icon-wrap{position:relative;display:inline-block;margin-bottom:14px;}
.home-block-icon-wrap .home-block-icon{margin-bottom:0;}
.hb-edit-btn{position:absolute;bottom:-4px;right:-6px;background:var(--surface);border:1.5px solid var(--border);border-radius:50%;width:22px;height:22px;font-size:11px;display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:0;transition:opacity .15s;line-height:1;padding:0;color:var(--text2);}
.home-block:hover .hb-edit-btn{opacity:1;}
.hb-edit-btn:hover{background:var(--accent);color:#fff;border-color:var(--accent);}
/* icon edit modal tabs */
.hie-tabs{display:flex;gap:8px;margin-bottom:16px;}
.hie-tab{flex:1;padding:8px;border-radius:8px;border:1.5px solid var(--border);background:transparent;color:var(--text2);font-size:13px;font-weight:600;cursor:pointer;transition:all .15s;}
.hie-tab.active{background:var(--accent);color:#fff;border-color:var(--accent);}
.hie-pane{display:none;}.hie-pane.active{display:block;}
.hie-emoji-grid{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;}
.hie-emoji-btn{font-size:22px;padding:4px 6px;border-radius:6px;border:1.5px solid transparent;background:var(--surface);cursor:pointer;transition:border-color .1s,background .1s;}
.hie-emoji-btn:hover,.hie-emoji-btn.selected{border-color:var(--accent);background:var(--card);}
.hie-custom-input{width:100%;padding:9px 12px;border-radius:8px;border:1.5px solid var(--border);background:var(--surface);color:var(--text);font-size:20px;text-align:center;outline:none;margin-bottom:10px;}
.hie-upload-area{border:2px dashed var(--border);border-radius:10px;padding:24px;text-align:center;cursor:pointer;color:var(--text3);font-size:13px;margin-bottom:10px;transition:border-color .15s;}
.hie-upload-area:hover{border-color:var(--accent);}
.hie-preview{width:72px;height:72px;border-radius:10px;object-fit:cover;display:block;margin:0 auto 10px;border:2px solid var(--border);}
</style>`;
if (html.indexOf(CSS_ANCHOR) === -1) { console.error('CSS anchor not found'); process.exit(1); }
html = html.replace(CSS_ANCHOR, CSS_NEW);

// ─────────────────────────────────────────────────────────────────────────────
// 2. MODAL HTML — insert before <!-- FORGOT PASSWORD -->
// ─────────────────────────────────────────────────────────────────────────────
const MODAL_ANCHOR = '<!-- FORGOT PASSWORD -->';
const MODAL_NEW = `<!-- HOME ICON EDIT MODAL -->
<div class="modal-overlay" id="modal-hie" style="display:none">
  <div class="modal modal-sm">
    <button class="close-btn" onclick="closeModal('hie')">×</button>
    <div class="modal-title">Edit Category Icon</div>
    <div class="hie-tabs">
      <button class="hie-tab active" id="hie-tab-emoji" onclick="hieTab('emoji')">😊 Choose Emoji</button>
      <button class="hie-tab" id="hie-tab-image" onclick="hieTab('image')">🖼️ Upload Image</button>
    </div>
    <!-- EMOJI PANE -->
    <div class="hie-pane active" id="hie-pane-emoji">
      <div class="hie-emoji-grid" id="hie-emoji-grid"></div>
      <input class="hie-custom-input" id="hie-custom-emoji" maxlength="8" placeholder="Or type/paste any emoji…" oninput="hieEmojiTyped(this.value)">
    </div>
    <!-- IMAGE PANE -->
    <div class="hie-pane" id="hie-pane-image">
      <div class="hie-upload-area" onclick="document.getElementById('hie-file-input').click()">
        <div style="font-size:28px;margin-bottom:6px">📁</div>
        <div>Click to choose an image</div>
        <div style="font-size:11px;margin-top:4px;color:var(--text3)">Will be compressed to 64×64px</div>
      </div>
      <input type="file" id="hie-file-input" accept="image/*" style="display:none" onchange="hieFileChosen(this)">
      <img id="hie-img-preview" class="hie-preview" style="display:none">
    </div>
    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:6px;">
      <button class="btn btn-outline" onclick="closeModal('hie')">Cancel</button>
      <button class="btn btn-primary" onclick="hieSave()">Save Icon</button>
    </div>
  </div>
</div>

<!-- FORGOT PASSWORD -->`;
if (html.indexOf(MODAL_ANCHOR) === -1) { console.error('Modal anchor not found'); process.exit(1); }
html = html.replace(MODAL_ANCHOR, MODAL_NEW);

// ─────────────────────────────────────────────────────────────────────────────
// 3. JS — insert before saveData()
// ─────────────────────────────────────────────────────────────────────────────
const JS_ANCHOR = 'function saveData() {';
const JS_NEW = `// ============================================================
// ===== HOME ICON EDITOR =====
// ============================================================
var _homeIcons = {}; // { groupId: 'emoji' | 'data:image/...' }
var _hieGroupId = null;
var _hiePendingValue = null; // emoji string or data URL
var _HIE_STORAGE = 'ezy_grpicons_v1';
var _HIE_EMOJIS = ['📁','🌿','🛠️','📈','🚗','🏢','💰','🎯','🎮','🏠','⚡','🔥','💎','🌟','🚀','🎵','🏋️','🧠','📚','✈️','🌎','🎨','💡','🔑','🛡️','⚙️','📊','🦅','🚛','🏗️','🌊','🎪'];
function hieLoad(){ try{ var d=localStorage.getItem(_HIE_STORAGE); if(d) _homeIcons=JSON.parse(d); }catch(e){} }
function hieSaveStore(){ try{ localStorage.setItem(_HIE_STORAGE, JSON.stringify(_homeIcons)); }catch(e){} }

function hieOpenModal(e, groupId){
  e.stopPropagation();
  e.preventDefault();
  _hieGroupId = groupId;
  _hiePendingValue = null;
  // reset tabs
  hieTab('emoji');
  // populate emoji grid
  var grid = document.getElementById('hie-emoji-grid');
  grid.innerHTML = _HIE_EMOJIS.map(function(em){
    return '<button class="hie-emoji-btn" onclick="hiePickEmoji(\\''+em+'\\')">' + em + '</button>';
  }).join('');
  document.getElementById('hie-custom-emoji').value = '';
  document.getElementById('hie-img-preview').style.display = 'none';
  document.getElementById('hie-file-input').value = '';
  showModal('hie');
}
function hieTab(name){
  ['emoji','image'].forEach(function(t){
    document.getElementById('hie-tab-'+t).classList.toggle('active', t===name);
    document.getElementById('hie-pane-'+t).classList.toggle('active', t===name);
  });
}
function hiePickEmoji(em){
  document.querySelectorAll('.hie-emoji-btn').forEach(function(b){ b.classList.remove('selected'); });
  event.currentTarget.classList.add('selected');
  document.getElementById('hie-custom-emoji').value = em;
  _hiePendingValue = em;
}
function hieEmojiTyped(val){
  document.querySelectorAll('.hie-emoji-btn').forEach(function(b){ b.classList.remove('selected'); });
  _hiePendingValue = val.trim() || null;
}
function hieFileChosen(input){
  var file = input.files[0]; if(!file) return;
  var reader = new FileReader();
  reader.onload = function(ev){
    var img = new Image();
    img.onload = function(){
      var canvas = document.createElement('canvas');
      canvas.width = 64; canvas.height = 64;
      var ctx = canvas.getContext('2d');
      // cover-fit: crop to square then draw
      var s = Math.min(img.width, img.height);
      var sx = (img.width - s) / 2, sy = (img.height - s) / 2;
      ctx.drawImage(img, sx, sy, s, s, 0, 0, 64, 64);
      var dataUrl = canvas.toDataURL('image/jpeg', 0.72);
      _hiePendingValue = dataUrl;
      var preview = document.getElementById('hie-img-preview');
      preview.src = dataUrl; preview.style.display = 'block';
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}
function hieSave(){
  if(!_hieGroupId || !_hiePendingValue) { closeModal('hie'); return; }
  _homeIcons[_hieGroupId] = _hiePendingValue;
  hieSaveStore();
  // Sync to sidebar: update icon of every item in this group that has a group-level icon
  // (we store separately so sidebar item icons remain independent; we update group header icon via _homeIcons)
  // Also update first item icon in sidebar for visual consistency
  sidebarGroups.forEach(function(grp){
    if(grp.id === _hieGroupId){
      // Store as group-level icon — sidebar groups don't have their own icon field yet, but we can tag it
      grp._icon = _hiePendingValue;
    }
  });
  saveSidebarToStorage();
  renderSidebar();
  renderHomeBlocks();
  closeModal('hie');
}

function saveData() {`;
if (html.indexOf(JS_ANCHOR) === -1) { console.error('JS anchor not found'); process.exit(1); }
html = html.replace(JS_ANCHOR, JS_NEW);

// ─────────────────────────────────────────────────────────────────────────────
// 4. Wire hieLoad() into appInit — after hbLoadOrder()
// ─────────────────────────────────────────────────────────────────────────────
html = html.replace(
  '  hbLoadOrder();\n  renderSidebar();',
  '  hbLoadOrder();\n  hieLoad();\n  renderSidebar();'
);

// ─────────────────────────────────────────────────────────────────────────────
// 5. Patch renderHomeBlocks() — wrap icon in .home-block-icon-wrap + pencil btn
//    Also read _homeIcons for custom icon
// ─────────────────────────────────────────────────────────────────────────────
// Find and replace the icon line + data-gid block inside renderHomeBlocks
// The card HTML currently:
//   return '<div class="home-block" draggable="true" data-gid="' + gid2 + '" ...
//     '<div class="home-block-icon">' + icon + '</div>' +
// We need to:
//  a) read custom icon: var icon = _homeIcons[gid2] || icons[g.id] || '📁';
//  b) render icon as image or emoji inside .home-block-icon-wrap with pencil btn
//  c) pencil btn uses stopPropagation so drag/click aren't triggered

const OLD_CARD = `    var icon = icons[g.id] || '📁';
    var desc = descs[g.id] || g.name + ' section';
    var gid2 = g.id;
    return '<div class="home-block" draggable="true" data-gid="' + gid2 + '" data-hbi="' + i + '"' +
      ' ondragstart="homeBlockDragStart(event,' + i + ')"' +
      ' ondragover="homeBlockDragOver(event)"' +
      ' ondrop="homeBlockDrop(event,' + i + ')"' +
      ' ondragend="homeBlockDragEnd()"' +
      ' onclick="homeBlockClick(event,\\'' + gid2 + '\\')"' +
      ' style="cursor:grab;">' +
      '<div class="home-block-icon">' + icon + '</div>' +
      '<div class="home-block-title">' + esc(g.name) + '</div>' +
      '<div class="home-block-desc">' + desc + '</div>' +
      '<div class="home-block-count">' + g.items.length + ' sections</div>' +
    '</div>';`;

const NEW_CARD = `    var rawIcon = _homeIcons[g.id] || icons[g.id] || '📁';
    var isImg = rawIcon.indexOf('data:') === 0;
    var iconHtml = isImg
      ? '<img src="' + rawIcon + '" style="width:52px;height:52px;border-radius:8px;object-fit:cover;">'
      : '<span style="font-size:52px;line-height:1;">' + rawIcon + '</span>';
    var desc = descs[g.id] || g.name + ' section';
    var gid2 = g.id;
    return '<div class="home-block" draggable="true" data-gid="' + gid2 + '" data-hbi="' + i + '"' +
      ' ondragstart="homeBlockDragStart(event,' + i + ')"' +
      ' ondragover="homeBlockDragOver(event)"' +
      ' ondrop="homeBlockDrop(event,' + i + ')"' +
      ' ondragend="homeBlockDragEnd()"' +
      ' onclick="homeBlockClick(event,\\'' + gid2 + '\\')"' +
      ' style="cursor:grab;">' +
      '<div class="home-block-icon-wrap">' +
        '<div class="home-block-icon" style="margin-bottom:0;">' + iconHtml + '</div>' +
        '<button class="hb-edit-btn" title="Edit icon" ondragstart="event.stopPropagation();event.preventDefault();" onclick="hieOpenModal(event,\\'' + gid2 + '\\')">✏️</button>' +
      '</div>' +
      '<div class="home-block-title">' + esc(g.name) + '</div>' +
      '<div class="home-block-desc">' + desc + '</div>' +
      '<div class="home-block-count">' + g.items.length + ' sections</div>' +
    '</div>';`;

if (html.indexOf(OLD_CARD) === -1) { console.error('OLD_CARD not found'); process.exit(1); }
html = html.replace(OLD_CARD, NEW_CARD);

// ─────────────────────────────────────────────────────────────────────────────
// 6. Patch renderSidebar() to show _icon on group header if set
//    The sidebar currently shows group name only; we'll prefix the name with the icon
// ─────────────────────────────────────────────────────────────────────────────
const OLD_SB_LABEL = "html += '<span class=\"sg-label\" ondblclick=\"sgRename('+gi+')\" title=\"Double-click to rename\">'+esc(grp.name)+'</span>';";
const NEW_SB_LABEL = `var grpIconHtml = '';
    if(grp._icon){
      if(grp._icon.indexOf('data:')===0){
        grpIconHtml = '<img src="'+grp._icon+'" style="width:18px;height:18px;border-radius:4px;object-fit:cover;vertical-align:middle;margin-right:5px;">';
      } else {
        grpIconHtml = '<span style="margin-right:4px;font-size:14px;">'+grp._icon+'</span>';
      }
    }
    html += '<span class="sg-label" ondblclick="sgRename('+gi+')" title="Double-click to rename">'+grpIconHtml+esc(grp.name)+'</span>';`;

if (html.indexOf(OLD_SB_LABEL) === -1) { console.error('SB_LABEL not found'); process.exit(1); }
html = html.replace(OLD_SB_LABEL, NEW_SB_LABEL);

// ─────────────────────────────────────────────────────────────────────────────
// Write
// ─────────────────────────────────────────────────────────────────────────────
fs.writeFileSync(path, html, 'utf8');
console.log('Done. File length:', html.length);
