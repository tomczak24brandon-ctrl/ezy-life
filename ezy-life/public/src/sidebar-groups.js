// sidebar-groups.js — sidebar persistence, drag/drop, group/item editing

// ===== STATE =====
var _sgCollapsed = {};
var _sgItemDragSrc = null; // { gi, ii }

// ===== REMEMBER ME =====
function loadSaved() {
  var saved = localStorage.getItem('ezy_saved_creds');
  if (saved) {
    try {
      var c = JSON.parse(atob(saved));
      var u = document.getElementById('l-user'), pw = document.getElementById('l-pass');
      if (u && c.u) u.value = c.u.toLowerCase();
      if (pw && c.p) pw.value = c.p;
      document.getElementById('remember-me').checked = true;
    } catch(e){}
  }
}
loadSaved();

// ===== SIDEBAR STORAGE =====
function saveSidebarToStorage() {
  try { localStorage.setItem('ezy_sidebar_v3', JSON.stringify({ groups: sidebarGroups, collapsed: _sgCollapsed })); } catch(e){}
}

function loadSidebarFromStorage() {
  try {
    var s = localStorage.getItem('ezy_sidebar_v3');
    if (s) { var d=JSON.parse(s); if(d.groups&&d.groups.length) sidebarGroups=d.groups; if(d.collapsed) _sgCollapsed=d.collapsed; }
  } catch(e){}
}

// ===== GROUP COLLAPSE =====
function sgToggleCollapse(gi) {
  _sgCollapsed[gi] = !_sgCollapsed[gi];
  saveSidebarToStorage();
  renderSidebar();
}

function sgFinCatToggle(key) {
  _sgCollapsed[key] = !_sgCollapsed[key];
  renderSidebar();
}

// ===== ITEM DRAG (within a group) =====
function sgItemDragStart(e, gi, ii) {
  e.stopPropagation();
  _sgItemDragSrc = { gi: gi, ii: ii };
  e.dataTransfer.setData('sgitem', '1');
  e.dataTransfer.effectAllowed = 'move';
  setTimeout(function() { var el = e.target; if (el) el.style.opacity = '0.4'; }, 0);
}

function sgItemDragOver(e, gi, ii) {
  if (!_sgItemDragSrc || _sgItemDragSrc.gi !== gi) return;
  e.preventDefault(); e.stopPropagation();
  document.querySelectorAll('.nav-drag-placeholder').forEach(function(p) { p.remove(); });
  var el = e.currentTarget;
  var rect = el.getBoundingClientRect();
  var midY = rect.top + rect.height / 2;
  var ph = document.createElement('div');
  ph.className = 'nav-drag-placeholder';
  if (e.clientY < midY) { el.parentNode.insertBefore(ph, el); }
  else { el.parentNode.insertBefore(ph, el.nextSibling); }
}

function sgItemDrop(e, gi, ii) {
  e.stopPropagation();
  document.querySelectorAll('.nav-drag-placeholder').forEach(function(p) { p.remove(); });
  if (!_sgItemDragSrc || _sgItemDragSrc.gi !== gi) return;
  e.preventDefault();
  var src = _sgItemDragSrc.ii;
  var el = e.currentTarget;
  var rect = el.getBoundingClientRect();
  var dropAfter = e.clientY > rect.top + rect.height / 2;
  var targetIdx = dropAfter ? ii + 1 : ii;
  if (src === ii) return;
  var item = sidebarGroups[gi].items.splice(src, 1)[0];
  var newIdx = src < targetIdx ? targetIdx - 1 : targetIdx;
  sidebarGroups[gi].items.splice(newIdx, 0, item);
  _sgItemDragSrc = null;
  saveSidebarToStorage();
  renderSidebar();
}

function sgItemDragEnd() {
  _sgItemDragSrc = null;
  document.querySelectorAll('.nav-drag-placeholder').forEach(function(p) { p.remove(); });
  document.querySelectorAll('.nav-item').forEach(function(el) { el.style.opacity = ''; });
}

// ===== GROUP DRAG (reorder groups) =====
function sgDragStart(e, gi) {
  window._sgDragSrcIdx = gi;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', String(gi));
  setTimeout(function() {
    var el = document.querySelector('.sg-group[data-gi="' + gi + '"]');
    if (el) el.classList.add('dragging');
  }, 0);
}

function sgDragOver(e, gi) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  document.querySelectorAll('.sg-group').forEach(function(el) { el.classList.remove('drag-over'); });
  if (gi !== window._sgDragSrcIdx) {
    var el = document.querySelector('.sg-group[data-gi="' + gi + '"]');
    if (el) el.classList.add('drag-over');
  }
  document.querySelectorAll('.nav-drag-placeholder').forEach(function(p) { p.remove(); });
  var targetEl = document.querySelector('.sg-group[data-gi="' + gi + '"]');
  if (targetEl && gi !== window._sgDragSrcIdx) {
    var rect = targetEl.getBoundingClientRect();
    var ph = document.createElement('div');
    ph.className = 'nav-drag-placeholder';
    ph.style.margin = '2px 8px';
    if (e.clientY < rect.top + rect.height / 2) { targetEl.parentNode.insertBefore(ph, targetEl); }
    else { targetEl.parentNode.insertBefore(ph, targetEl.nextSibling); }
  }
}

function sgDrop(e, gi) {
  e.preventDefault();
  document.querySelectorAll('.nav-drag-placeholder').forEach(function(p) { p.remove(); });
  if (window._sgDragSrcIdx === null || window._sgDragSrcIdx === gi) return;
  var targetEl = document.querySelector('.sg-group[data-gi="' + gi + '"]');
  var dropAfter = false;
  if (targetEl) {
    var rect = targetEl.getBoundingClientRect();
    dropAfter = e.clientY > rect.top + rect.height / 2;
  }
  var src = window._sgDragSrcIdx;
  var moved = sidebarGroups.splice(src, 1)[0];
  var insertAt = src < gi ? (dropAfter ? gi : gi - 1) : (dropAfter ? gi + 1 : gi);
  sidebarGroups.splice(insertAt, 0, moved);
  saveSidebarToStorage();
  renderSidebar();
  var curPage = document.querySelector('.page.active');
  if (curPage) highlightNav(curPage.id.replace('page-', ''));
}

function sgDragEnd(e) {
  document.querySelectorAll('.sg-group').forEach(function(el) { el.classList.remove('dragging', 'drag-over'); });
  document.querySelectorAll('.nav-drag-placeholder').forEach(function(p) { p.remove(); });
  window._sgDragSrcIdx = null;
}

// ===== GROUP RENAME =====
function sgRename(gi) {
  var grp = sidebarGroups[gi];
  var name = prompt('Rename group:', grp.name);
  if (name && name.trim()) { grp.name = name.trim(); saveSidebarToStorage(); renderSidebar(); }
}

// ===== ITEM EDIT MODAL =====
var _sgItemEditGi = null;
var _sgItemEditIi = null;
var _sgItemPendingIcon = undefined;
var _SGITEM_EMOJIS = ['🏠','📈','📝','🎯','📅','⏳','💰','🚗','🏢','🦅','🚛','🗂️','📊','📓','⚙️','🖨️','❤️','💼','🎨','⭐'];

function sgItemEdit(gi, ii) {
  var item = sidebarGroups[gi] && sidebarGroups[gi].items[ii];
  if (!item) return;
  _sgItemEditGi = gi;
  _sgItemEditIi = ii;
  _sgItemPendingIcon = undefined;
  document.getElementById('sgitem-label-input').value = item.label || '';
  var grid = document.getElementById('sgitem-emoji-grid');
  grid.innerHTML = _SGITEM_EMOJIS.map(function(em) {
    var sel = em === item.icon ? ' selected' : '';
    return '<button class="hie-emoji-btn' + sel + '" onclick="sgitemPickEmoji(\'' + em + '\')">' + em + '</button>';
  }).join('');
  var customInp = document.getElementById('sgitem-custom-emoji');
  customInp.value = (_SGITEM_EMOJIS.indexOf(item.icon) === -1 && item.icon) ? item.icon : '';
  document.getElementById('sgitem-no-icon-btn').textContent = item.icon ? '✕ Remove Icon' : '(No Icon)';
  showModal('sgitem');
  setTimeout(function() { document.getElementById('sgitem-label-input').focus(); }, 80);
}

function sgitemPickEmoji(em) {
  document.querySelectorAll('#sgitem-emoji-grid .hie-emoji-btn').forEach(function(b) { b.classList.remove('selected'); });
  event.currentTarget.classList.add('selected');
  document.getElementById('sgitem-custom-emoji').value = '';
  _sgItemPendingIcon = em;
  document.getElementById('sgitem-no-icon-btn').textContent = '✕ Remove Icon';
}

function sgitemEmojiTyped(val) {
  document.querySelectorAll('#sgitem-emoji-grid .hie-emoji-btn').forEach(function(b) { b.classList.remove('selected'); });
  _sgItemPendingIcon = val.trim();
}

function sgitemClearIcon() {
  document.querySelectorAll('#sgitem-emoji-grid .hie-emoji-btn').forEach(function(b) { b.classList.remove('selected'); });
  document.getElementById('sgitem-custom-emoji').value = '';
  _sgItemPendingIcon = '';
  document.getElementById('sgitem-no-icon-btn').textContent = '(No Icon)';
}

function sgItemSave() {
  var item = sidebarGroups[_sgItemEditGi] && sidebarGroups[_sgItemEditGi].items[_sgItemEditIi];
  if (!item) { closeModal('sgitem'); return; }
  var newLabel = (document.getElementById('sgitem-label-input').value || '').trim();
  if (newLabel) item.label = newLabel;
  if (_sgItemPendingIcon !== undefined) item.icon = _sgItemPendingIcon;
  saveSidebarToStorage();
  closeModal('sgitem');
  renderSidebar();
}

function sgAddItem(gi) {
  var emoji = prompt('Emoji for new page (e.g. 🏠):');
  if (!emoji) return;
  var label = prompt('Page name:');
  if (!label || !label.trim()) return;
  var id = 'custom-' + Date.now();
  sidebarGroups[gi].items.push({ id: id, icon: emoji.trim(), label: label.trim() });
  renderSidebar();
}

// --- window exports ---
window.loadSaved             = loadSaved;
window.saveSidebarToStorage  = saveSidebarToStorage;
window.loadSidebarFromStorage = loadSidebarFromStorage;
window.sgToggleCollapse      = sgToggleCollapse;
window.sgFinCatToggle        = sgFinCatToggle;
window.sgItemDragStart       = sgItemDragStart;
window.sgItemDragOver        = sgItemDragOver;
window.sgItemDrop            = sgItemDrop;
window.sgItemDragEnd         = sgItemDragEnd;
window.sgDragStart           = sgDragStart;
window.sgDragOver            = sgDragOver;
window.sgDrop                = sgDrop;
window.sgDragEnd             = sgDragEnd;
window.sgRename              = sgRename;
window.sgItemEdit            = sgItemEdit;
window.sgitemPickEmoji       = sgitemPickEmoji;
window.sgitemEmojiTyped      = sgitemEmojiTyped;
window.sgitemClearIcon       = sgitemClearIcon;
window.sgItemSave            = sgItemSave;
window.sgAddItem             = sgAddItem;
