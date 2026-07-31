
function qlSave(){ try{ localStorage.setItem('ezy_quicklinks_v1', JSON.stringify(_quickLinks)); }catch(e){} }

function qlLoad(){ try{ var d=localStorage.getItem('ezy_quicklinks_v1'); if(d) _quickLinks=JSON.parse(d); }catch(e){} }

function renderQuickLinks(){

  // Update badge count on the Add Shortcut grid card

  var badge = document.getElementById('ql-count-badge');

  if (badge) badge.textContent = _quickLinks.length ? _quickLinks.length + ' saved' : 'none saved';

}

function qlOpenModal(){

  var lb=document.getElementById('ql-listbox'); if(!lb) return;

  // Clear selection

  document.getElementById('ql-selected-id').value='';

  document.getElementById('ql-selected-icon').value='';

  document.getElementById('ql-selected-label').value='';

  var rows='';

  sidebarGroups.forEach(function(grp){

    grp.items.forEach(function(item){

      if(item.id==='home') return;

      var already=_quickLinks.find(function(l){ return l.id===item.id; });

      rows+='<div class="ql-list-item'+(already?' ql-list-saved':'')

        +'" data-id="'+item.id+'" data-icon="'+esc(item.icon)+'" data-label="'+esc(item.label)+'"'

        +' onclick="qlSelectItem(this)">'

        +'<span style="font-size:16px;margin-right:9px;">'+item.icon+'</span>'

        +'<span style="flex:1;">'+esc(item.label)+'</span>'

        +(already?'<span style="font-size:11px;color:var(--text3);margin-left:6px;">saved</span>':'')

        +'</div>';

    });

  });

  lb.innerHTML=rows;

  showModal('ql-add');

}

function qlSelectItem(el){

  document.querySelectorAll('.ql-list-item').forEach(function(r){ r.classList.remove('ql-list-active'); });

  el.classList.add('ql-list-active');

  document.getElementById('ql-selected-id').value=el.getAttribute('data-id');

  document.getElementById('ql-selected-icon').value=el.getAttribute('data-icon');

  document.getElementById('ql-selected-label').value=el.getAttribute('data-label');

}

function qlSaveShortcut(){

  var id=document.getElementById('ql-selected-id').value;

  if(!id){ closeModal('ql-add'); return; }

  if(_quickLinks.find(function(l){ return l.id===id; })){ closeModal('ql-add'); return; }

  var icon=document.getElementById('ql-selected-icon').value||'?';

  var label=document.getElementById('ql-selected-label').value||id;

  _quickLinks.push({id:id,icon:icon,label:label});

  qlSave(); renderHomeBlocks(); closeModal('ql-add');

}

function qlDelete(i){ _quickLinks.splice(i,1); qlSave(); renderHomeBlocks(); }

// ============================================================

// ===== HOME ICON EDITOR =====

// ============================================================

var _homeIcons = {}; // { groupId: 'emoji' | 'data:image/...' }

var _hieGroupId = null;

var _hiePendingValue = null; // emoji string or data URL

var _HIE_STORAGE = 'ezy_grpicons_v1';

var _HIE_EMOJIS = ['🏠','🎯','📅','📝','📈','🚗','🏢','🦅','🚛','🗂️','📋','💳','📓','⚙️','🖨️','❤️','💼','🎨','⭐','💰','📌','🔧','🌱','📊','📁','🔑','🔒','👤','💡','⏳'];


// --- window exports ---
if (typeof qlLoad !== 'undefined') window.qlLoad = qlLoad;
if (typeof qlSave !== 'undefined') window.qlSave = qlSave;
if (typeof renderQuickLinks !== 'undefined') window.renderQuickLinks = renderQuickLinks;
if (typeof qlOpenModal !== 'undefined') window.qlOpenModal = qlOpenModal;
if (typeof qlSelectItem !== 'undefined') window.qlSelectItem = qlSelectItem;
if (typeof qlSaveShortcut !== 'undefined') window.qlSaveShortcut = qlSaveShortcut;
if (typeof qlDelete !== 'undefined') window.qlDelete = qlDelete;
